import pool, { poolConnect } from "../config/db.js";

export const obtenerUsuario = async (id) => {

    await poolConnect;

    const result = await pool.request()
        .input("id", id)
        .query(`
            SELECT
                id,
                name,
                email,
                fotoPerfil
            FROM users
            WHERE id = @id
        `);

    return result.recordset[0] || null;
};