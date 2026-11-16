import pool from "../config/db.js";
import sql from "mssql";


export const obtenerResumen = async (companyId) => {

    const ventas = await pool.request().input("companyId", sql.Int, companyId).query(`
        SELECT ISNULL(SUM(Total),0) AS totalVentas
        FROM Ventas
        WHERE MONTH(fecha)=MONTH(GETDATE())
        AND YEAR(fecha)=YEAR(GETDATE()) AND company_id=@companyId
    `);

    const pedidos = await pool.request().input("companyId", sql.Int, companyId).query(`
        SELECT COUNT(*) AS pedidos
        FROM Ventas WHERE company_id=@companyId
    `);

    const productos = await pool.request().input("companyId", sql.Int, companyId).query(`
        SELECT COUNT(*) AS totalProductos
        FROM Productos WHERE company_id=@companyId
    `);

    const clientes = await pool.request().input("companyId", sql.Int, companyId).query(`
        SELECT COUNT(*) AS totalClientes
        FROM Clientes WHERE company_id=@companyId
    `);


    return {
        totalVentas: ventas.recordset[0].totalVentas,
        totalPedidos: pedidos.recordset[0].pedidos,
        totalProductos: productos.recordset[0].totalProductos,
        totalClientes: clientes.recordset[0].totalClientes
    };
};



export const obtenerVentasMensuales = async (companyId) => {

    const ventasMensuales = await pool.request().input("companyId", sql.Int, companyId).query(`
        SELECT 
            MONTH(fecha) AS mes,
            ISNULL(SUM(Total),0) AS totalVentas

        FROM Ventas

        WHERE YEAR(fecha)=YEAR(GETDATE()) AND company_id=@companyId

        GROUP BY MONTH(fecha)

        ORDER BY MONTH(fecha)
    `);


    return ventasMensuales.recordset;
};



export const obtenerVentasCategorias = async (companyId) => {

    const result = await pool.request().input("companyId", sql.Int, companyId).query(`
    SELECT
      c.nombre AS categoria,
      SUM(d.Subtotal) AS totalVentas
    FROM Ventas v
    INNER JOIN DetalleVenta d
      ON v.Id = d.VentaId AND d.company_id = @companyId
    INNER JOIN Productos p
      ON d.ProductoId = p.Id AND p.company_id = @companyId
    INNER JOIN Categorias c
      ON p.idCategoria = c.id AND c.company_id = @companyId
    WHERE YEAR(v.Fecha)=YEAR(GETDATE()) AND v.company_id=@companyId
    GROUP BY c.nombre
    ORDER BY totalVentas DESC
    `);


    return result.recordset;
};



export const obtenerDistribucionProductos = async (companyId) => {


    const distribucionProductos = await pool.request().input("companyId", sql.Int, companyId).query(`
        SELECT
            p.Nombre AS producto,
            SUM(d.Subtotal) AS totalVentas

        FROM Ventas v

        INNER JOIN DetalleVenta d
        ON v.Id=d.VentaId AND d.company_id = @companyId

        INNER JOIN Productos p
        ON d.ProductoId=p.Id AND p.company_id = @companyId

        WHERE YEAR(v.Fecha)=YEAR(GETDATE()) AND v.company_id=@companyId

        GROUP BY p.Nombre

        ORDER BY totalVentas DESC;
    `);


    return distribucionProductos.recordset;

};


export const obtenerVentasRecientes = async (companyId) => {

    const result = await pool.request().input("companyId", sql.Int, companyId).query(`
      SELECT TOP (10)
        v.Id,
        v.Codigo,
        v.Fecha,
        c.Nombre AS Cliente,
        v.Total,
        v.MetodoPago,
        v.Estado
      FROM Ventas v
      INNER JOIN Clientes c
      ON v.ClienteId = c.Id AND c.company_id = @companyId
      WHERE v.company_id=@companyId
      ORDER BY v.Fecha DESC
    `);

    return result.recordset;
};