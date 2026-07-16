import pool from "../config/db.js";


export const obtenerResumen = async () => {

    const ventas = await pool.request().query(`
        SELECT ISNULL(SUM(Total),0) AS totalVentas
        FROM Ventas
        WHERE MONTH(fecha)=MONTH(GETDATE())
        AND YEAR(fecha)=YEAR(GETDATE())
    `);

    const pedidos = await pool.request().query(`
        SELECT COUNT(*) AS pedidos
        FROM Ventas
    `);

    const productos = await pool.request().query(`
        SELECT COUNT(*) AS totalProductos
        FROM Productos
    `);

    const clientes = await pool.request().query(`
        SELECT COUNT(*) AS totalClientes
        FROM Clientes
    `);


    return {
        totalVentas: ventas.recordset[0].totalVentas,
        totalPedidos: pedidos.recordset[0].pedidos,
        totalProductos: productos.recordset[0].totalProductos,
        totalClientes: clientes.recordset[0].totalClientes
    };
};



export const obtenerVentasMensuales = async () => {

    const ventasMensuales = await pool.request().query(`
        SELECT 
            MONTH(fecha) AS mes,
            ISNULL(SUM(Total),0) AS totalVentas

        FROM Ventas

        WHERE YEAR(fecha)=YEAR(GETDATE())

        GROUP BY MONTH(fecha)

        ORDER BY MONTH(fecha)
    `);


    return ventasMensuales.recordset;
};



export const obtenerVentasCategorias = async () => {

    const result = await pool.request().query(`
    SELECT
      c.nombre AS categoria,
      SUM(d.Subtotal) AS totalVentas
    FROM Ventas v
    INNER JOIN DetalleVenta d
      ON v.Id = d.VentaId
    INNER JOIN Productos p
      ON d.ProductoId = p.Id
    INNER JOIN Categorias c
      ON p.idCategoria = c.id
    WHERE YEAR(v.Fecha)=YEAR(GETDATE())
    GROUP BY c.nombre
    ORDER BY totalVentas DESC
    `);


    return result.recordset;
};



export const obtenerDistribucionProductos = async () => {


    const distribucionProductos = await pool.request().query(`
        SELECT
            p.Nombre AS producto,
            SUM(d.Subtotal) AS totalVentas

        FROM Ventas v

        INNER JOIN DetalleVenta d
        ON v.Id=d.VentaId

        INNER JOIN Productos p
        ON d.ProductoId=p.Id

        WHERE YEAR(v.Fecha)=YEAR(GETDATE())

        GROUP BY p.Nombre

        ORDER BY totalVentas DESC;
    `);


    return distribucionProductos.recordset;

};


export const obtenerVentasRecientes = async () => {

    const result = await pool.request().query(`
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
      ON v.ClienteId = c.Id
      ORDER BY v.Fecha DESC
    `);

    return result.recordset;
};