import pool, { poolConnect } from "../config/db.js";

export const getUserByEmail = async (email) => {
    await poolConnect;

    const result = await pool.request()
        .input("email", email)
        .query(`
            SELECT id, name, email, password
            FROM users
            WHERE email = @email
        `);

    return result.recordset[0] || null;
};