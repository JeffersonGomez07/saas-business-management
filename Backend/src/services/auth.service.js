import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getUserByEmail } from "../models/user.model.js";
import pool from "../config/db.js";
import sql from "mssql";

export const login = async (datos) => {
    const { email, password } = datos;
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        throw new Error("JWT_SECRET debe configurarse con al menos 32 caracteres");
    }

    const user = await getUserByEmail(email);

    if (!user) {
        throw new Error("Usuario no existe");
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
        throw new Error("Contraseña incorrecta");
    }

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            companyId: user.company_id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

    return { token };
};

export const register = async (datos) => {

    const {
        name,
        company_name,
        email,
        password
    } = datos;


    const existe = await getUserByEmail(email);


    if (existe) {
        throw new Error("El correo ya está registrado");
    }


    const passwordHash = await bcrypt.hash(
        password,
        10
    );


    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        const company = await new sql.Request(transaction)
            .input("name", sql.NVarChar(150), company_name)
            .query(`
                INSERT INTO companies (name)
                OUTPUT INSERTED.id
                VALUES (@name)
            `);
        const companyId = company.recordset[0].id;

        const result = await new sql.Request(transaction)
            .input("name", sql.VarChar(100), name)
            .input("company_name", sql.NVarChar(150), company_name)
            .input("company_id", sql.Int, companyId)
            .input("email", sql.VarChar(150), email)
            .input("password", sql.VarChar(255), passwordHash)
            .query(`
                INSERT INTO users
                (name, company_name, company_id, email, password)
                OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.company_id
                VALUES (@name, @company_name, @company_id, @email, @password)
            `);
        await new sql.Request(transaction)
            .input("userId", sql.Int, result.recordset[0].id)
            .query("INSERT INTO user_preferences (user_id) VALUES (@userId)");
        await new sql.Request(transaction)
            .input("companyId", sql.Int, companyId)
            .query("INSERT INTO Categorias (nombre, company_id) VALUES ('General', @companyId)");

        await transaction.commit();
        return result.recordset[0];
    } catch (error) {
        await transaction.rollback();
        throw error;
    }

};