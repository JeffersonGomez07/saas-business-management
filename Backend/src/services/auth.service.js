import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createHash } from "node:crypto";
import { getUserByEmail } from "../models/user.model.js";
import pool from "../config/db.js";
import sql from "mssql";

export const login = async (datos) => {
    const { password } = datos;
    const email = datos.email.trim().toLowerCase();
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
        password,
        inviteCode
    } = datos;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedInviteCode = inviteCode?.trim();
    const companyName = company_name?.trim();
    const existe = await getUserByEmail(normalizedEmail);
    if (existe) {
        throw new Error("El correo ya está registrado");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        let companyId;
        let registeredCompanyName;
        let companyRole;

        if (normalizedInviteCode) {
            const codeHash = createHash("sha256")
                .update(normalizedInviteCode)
                .digest();
            const invitationResult = await new sql.Request(transaction)
                .input("codeHash", sql.VarBinary(32), codeHash)
                .input("email", sql.VarChar(150), normalizedEmail)
                .query(`
                    SELECT TOP (1)
                        i.Id,
                        i.company_id,
                        c.name AS company_name
                    FROM dbo.CompanyInvitations i WITH (UPDLOCK, ROWLOCK)
                    INNER JOIN dbo.companies c ON c.id = i.company_id
                    WHERE i.code_hash = @codeHash
                      AND LOWER(i.email) = @email
                      AND i.accepted_at IS NULL
                      AND i.revoked_at IS NULL
                      AND i.expires_at > GETDATE()
                `);
            const invitation = invitationResult.recordset[0];
            if (!invitation) {
                throw new Error("El código de invitación es inválido, expiró o no corresponde a ese correo");
            }

            companyId = invitation.company_id;
            registeredCompanyName = invitation.company_name;
            companyRole = "member";
            const accepted = await new sql.Request(transaction)
                .input("invitationId", sql.Int, invitation.Id)
                .query(`
                    UPDATE dbo.CompanyInvitations
                    SET accepted_at = GETDATE()
                    WHERE Id = @invitationId
                      AND accepted_at IS NULL
                      AND revoked_at IS NULL
                      AND expires_at > GETDATE()
                `);
            if (accepted.rowsAffected[0] !== 1) {
                throw new Error("El código de invitación ya fue utilizado o expiró");
            }
        } else {
            const company = await new sql.Request(transaction)
                .input("name", sql.NVarChar(150), companyName)
                .query(`
                    INSERT INTO dbo.companies (name)
                    OUTPUT INSERTED.id
                    VALUES (@name)
                `);
            companyId = company.recordset[0].id;
            registeredCompanyName = companyName;
            companyRole = "owner";
        }

        const result = await new sql.Request(transaction)
            .input("name", sql.VarChar(100), name)
            .input("company_name", sql.VarChar(150), registeredCompanyName)
            .input("company_id", sql.Int, companyId)
            .input("company_role", sql.VarChar(20), companyRole)
            .input("email", sql.VarChar(150), normalizedEmail)
            .input("password", sql.VarChar(255), passwordHash)
            .query(`
                INSERT INTO users
                (name, company_name, company_id, company_role, email, password)
                OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.company_id, INSERTED.company_role
                VALUES (@name, @company_name, @company_id, @company_role, @email, @password)
            `);
        await new sql.Request(transaction)
            .input("userId", sql.Int, result.recordset[0].id)
            .query("INSERT INTO user_preferences (user_id) VALUES (@userId)");
        if (!normalizedInviteCode) {
            await new sql.Request(transaction)
                .input("companyId", sql.Int, companyId)
                .query("INSERT INTO Categorias (nombre, company_id) VALUES ('General', @companyId)");
        }

        await transaction.commit();
        return result.recordset[0];
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};