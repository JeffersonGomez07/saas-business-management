import pool from "../config/db.js";


export const obtenerNotificaciones = async (userId) => {

    const result = await pool
        .request()
        .input("userId", userId)
        .query(`
            SELECT
                Id,
                Titulo,
                Mensaje,
                Categoria,
                Prioridad,
                Leida,
                Fecha,
                FechaLectura
            FROM Notificaciones
            WHERE UserId = @userId
            ORDER BY Fecha DESC
        `);

    return result.recordset;
};



export const obtenerNoLeidas = async (userId) => {

    const result = await pool
        .request()
        .input("userId", userId)
        .query(`
            SELECT *
            FROM Notificaciones
            WHERE UserId = @userId
            AND Leida = 0
            ORDER BY Fecha DESC
        `);

    return result.recordset;
};



export const obtenerResumen = async (userId) => {

    const result = await pool
        .request()
        .input("userId", userId)
        .query(`
            SELECT
                COUNT(*) AS Total,
                SUM(CASE WHEN Leida = 0 THEN 1 ELSE 0 END) AS NoLeidas,
                SUM(CASE WHEN Categoria='Ventas' THEN 1 ELSE 0 END) AS Ventas,
                SUM(CASE WHEN Categoria='Inventario' THEN 1 ELSE 0 END) AS Inventario,
                SUM(CASE WHEN Categoria='Clientes' THEN 1 ELSE 0 END) AS Clientes,
                SUM(CASE WHEN Categoria='Sistema' THEN 1 ELSE 0 END) AS Sistema
            FROM Notificaciones
            WHERE UserId=@userId
        `);


    return result.recordset[0];
};



export const crearNotificacion = async (data) => {

    const {
        userId,
        titulo,
        mensaje,
        categoria,
        prioridad = "Normal"
    } = data;


    await pool
        .request()
        .input("userId", userId)
        .input("titulo", titulo)
        .input("mensaje", mensaje)
        .input("categoria", categoria)
        .input("prioridad", prioridad)
        .query(`
            INSERT INTO Notificaciones
            (
                UserId,
                Titulo,
                Mensaje,
                Categoria,
                Prioridad
            )
            VALUES
            (
                @userId,
                @titulo,
                @mensaje,
                @categoria,
                @prioridad
            )
        `);


    return {
        message:"Notificación creada correctamente"
    };
};



export const marcarComoLeida = async (id) => {


    await pool
        .request()
        .input("id", id)
        .query(`
            UPDATE Notificaciones
            SET
                Leida = 1,
                FechaLectura = GETDATE()
            WHERE Id=@id
        `);


    return {
        message:"Notificación actualizada"
    };
};



export const marcarTodasComoLeidas = async (userId) => {


    await pool
        .request()
        .input("userId", userId)
        .query(`
            UPDATE Notificaciones
            SET
                Leida = 1,
                FechaLectura = GETDATE()
            WHERE UserId=@userId
            AND Leida=0
        `);


    return {
        message:"Todas las notificaciones fueron leídas"
    };
};



export const eliminarNotificacion = async (id) => {


    await pool
        .request()
        .input("id", id)
        .query(`
            DELETE FROM Notificaciones
            WHERE Id=@id
        `);


    return {
        message:"Notificación eliminada"
    };
};



export const limpiarNotificaciones = async (userId) => {


    await pool
        .request()
        .input("userId", userId)
        .query(`
            DELETE FROM Notificaciones
            WHERE UserId=@userId
        `);


    return {
        message:"Todas las notificaciones fueron eliminadas"
    };
};



export const obtenerCantidadNoLeidas = async (userId)=>{


    const result = await pool
        .request()
        .input("UserId", userId)
        .query(`
            SELECT COUNT(*) AS total
            FROM Notificaciones
            WHERE UserId=@UserId
            AND Leida=0
        `);


    return {
        total: result.recordset[0].total
    };
};