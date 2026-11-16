import pool from "../config/db.js";


export const obtenerNotificaciones = async (userId, companyId) => {

    const result = await pool
        .request()
        .input("userId", userId)
        .input("companyId", companyId)
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
            WHERE UserId = @userId AND company_id = @companyId
            ORDER BY Fecha DESC
        `);

    return result.recordset;
};



export const obtenerNoLeidas = async (userId, companyId) => {

    const result = await pool
        .request()
        .input("userId", userId)
        .input("companyId", companyId)
        .query(`
            SELECT *
            FROM Notificaciones
            WHERE UserId = @userId AND company_id = @companyId
            AND Leida = 0
            ORDER BY Fecha DESC
        `);

    return result.recordset;
};



export const obtenerResumen = async (userId, companyId) => {

    const result = await pool
        .request()
        .input("userId", userId)
        .input("companyId", companyId)
        .query(`
            SELECT
                COUNT(*) AS Total,
                SUM(CASE WHEN Leida = 0 THEN 1 ELSE 0 END) AS NoLeidas,
                SUM(CASE WHEN Categoria='Ventas' THEN 1 ELSE 0 END) AS Ventas,
                SUM(CASE WHEN Categoria='Inventario' THEN 1 ELSE 0 END) AS Inventario,
                SUM(CASE WHEN Categoria='Clientes' THEN 1 ELSE 0 END) AS Clientes,
                SUM(CASE WHEN Categoria='Sistema' THEN 1 ELSE 0 END) AS Sistema
            FROM Notificaciones
            WHERE UserId=@userId AND company_id=@companyId
        `);


    return result.recordset[0];
};



export const crearNotificacion = async (data) => {

    const {
        userId,
        titulo,
        mensaje,
        categoria,
        prioridad = "Normal",
        companyId
    } = data;


    await pool
        .request()
        .input("userId", userId)
        .input("titulo", titulo)
        .input("mensaje", mensaje)
        .input("categoria", categoria)
        .input("prioridad", prioridad)
        .input("companyId", companyId)
        .query(`
            INSERT INTO Notificaciones
            (
                UserId,
                Titulo,
                Mensaje,
                Categoria,
                Prioridad,
                company_id
            )
            VALUES
            (
                @userId,
                @titulo,
                @mensaje,
                @categoria,
                @prioridad,
                @companyId
            )
        `);


    return {
        message:"Notificación creada correctamente"
    };
};



export const marcarComoLeida = async (id, userId, companyId) => {


    await pool
        .request()
        .input("id", id)
        .input("userId", userId)
        .input("companyId", companyId)
        .query(`
            UPDATE Notificaciones
            SET
                Leida = 1,
                FechaLectura = GETDATE()
            WHERE Id=@id AND UserId=@userId AND company_id=@companyId
        `);


    return {
        message:"Notificación actualizada"
    };
};



export const marcarTodasComoLeidas = async (userId, companyId) => {


    await pool
        .request()
        .input("userId", userId)
        .input("companyId", companyId)
        .query(`
            UPDATE Notificaciones
            SET
                Leida = 1,
                FechaLectura = GETDATE()
            WHERE UserId=@userId AND company_id=@companyId
            AND Leida=0
        `);


    return {
        message:"Todas las notificaciones fueron leídas"
    };
};



export const eliminarNotificacion = async (id, userId, companyId) => {


    await pool
        .request()
        .input("id", id)
        .input("userId", userId)
        .input("companyId", companyId)
        .query(`
            DELETE FROM Notificaciones
            WHERE Id=@id AND UserId=@userId AND company_id=@companyId
        `);


    return {
        message:"Notificación eliminada"
    };
};



export const limpiarNotificaciones = async (userId, companyId) => {


    await pool
        .request()
        .input("userId", userId)
        .input("companyId", companyId)
        .query(`
            DELETE FROM Notificaciones
            WHERE UserId=@userId AND company_id=@companyId
        `);


    return {
        message:"Todas las notificaciones fueron eliminadas"
    };
};



export const obtenerCantidadNoLeidas = async (userId, companyId)=>{


    const result = await pool
        .request()
        .input("UserId", userId)
        .input("companyId", companyId)
        .query(`
            SELECT COUNT(*) AS total
            FROM Notificaciones
            WHERE UserId=@UserId AND company_id=@companyId
            AND Leida=0
        `);


    return {
        total: result.recordset[0].total
    };
};