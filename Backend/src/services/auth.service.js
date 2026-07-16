import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getUserByEmail } from "../models/user.model.js";
import pool from "../config/db.js";

export const login = async (datos) => {
    const { email, password } = datos;

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
            email: user.email
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


    const result = await pool.request()
        .input("name", name)
        .input("company_name", company_name || null)
        .input("email", email)
        .input("password", passwordHash)
        .query(`
            INSERT INTO users
            (
                name,
                company_name,
                email,
                password
            )
            OUTPUT INSERTED.id, INSERTED.name, INSERTED.email
            VALUES
            (
                @name,
                @company_name,
                @email,
                @password
            )
        `);


    return result.recordset[0];

};