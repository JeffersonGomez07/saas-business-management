import { createHash, randomBytes } from "node:crypto";
import sql from "mssql";
import pool from "../config/db.js";

const createError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

export const crearInvitacion = async ({ email, userId, companyId }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const code = randomBytes(32).toString("base64url");
    const codeHash = createHash("sha256").update(code).digest();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
        const roleResult = await new sql.Request(transaction)
            .input("userId", sql.Int, userId)
            .input("companyId", sql.Int, companyId)
            .query(`
                SELECT company_role
                FROM dbo.users WITH (UPDLOCK, HOLDLOCK)
                WHERE id = @userId AND company_id = @companyId
            `);
        const role = roleResult.recordset[0]?.company_role;
        if (role !== "owner" && role !== "admin") {
            throw createError("Solo propietarios y administradores pueden invitar usuarios", 403);
        }

        const existingUser = await new sql.Request(transaction)
            .input("email", sql.VarChar(150), normalizedEmail)
            .query("SELECT TOP (1) id FROM dbo.users WHERE LOWER(email) = @email");
        if (existingUser.recordset.length) {
            throw createError("Ese correo ya tiene una cuenta", 409);
        }

        await new sql.Request(transaction)
            .input("companyId", sql.Int, companyId)
            .input("email", sql.VarChar(150), normalizedEmail)
            .query(`
                UPDATE dbo.CompanyInvitations
                SET revoked_at = GETDATE()
                WHERE company_id = @companyId
                  AND LOWER(email) = @email
                  AND accepted_at IS NULL
                  AND revoked_at IS NULL
            `);

        const insertedInvitation = await new sql.Request(transaction)
            .input("companyId", sql.Int, companyId)
            .input("email", sql.VarChar(150), normalizedEmail)
            .input("codeHash", sql.VarBinary(32), codeHash)
            .input("userId", sql.Int, userId)
            .query(`
                INSERT INTO dbo.CompanyInvitations
                    (company_id, email, code_hash, invited_by, expires_at)
                OUTPUT INSERTED.expires_at
                VALUES
                    (@companyId, @email, @codeHash, @userId, DATEADD(day, 7, GETDATE()));
            `);

        await transaction.commit();
        return {
            email: normalizedEmail,
            code,
            expiresAt: new Date(insertedInvitation.recordset[0].expires_at).toISOString()
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};
