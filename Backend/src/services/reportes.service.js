import sql from "mssql";
import pool from "../config/db.js";
import { calcularMargen } from "../utils/calcularMargen.js";

export const obtenerReportes = async (desde, hasta) => {

    const request = pool.request();

    request.input("desde", sql.Date, desde);
    request.input("hasta", sql.Date, hasta);

    const reportes = await request.query(`
        SELECT
            ISNULL(SUM(dv.subtotal),0) AS Ingresos,
            ISNULL(SUM(dv.cantidad * p.costo),0) AS Costos
        FROM DetalleVenta dv
        INNER JOIN Productos p
            ON dv.productoId = p.id
        INNER JOIN Ventas v
            ON dv.ventaId = v.id
        WHERE
            v.estado = 'Completada'
            AND v.fecha BETWEEN @desde AND @hasta;
    `);


    const datos = reportes.recordset[0];


    const ingresos = Number(datos.Ingresos);
    const costos = Number(datos.Costos);


    const ganancia = ingresos - costos;


    const margenGanancia = calcularMargen(
        ingresos,
        costos
    );

    return {
        Ingresos: ingresos,
        Costos: costos,
        Ganancia: ganancia,
        MargenGanancia: margenGanancia
    };
};
export const analisisFinanciero = async () => {

    const ventas = await pool.request().query(`
      SELECT
          MONTH(v.fecha) AS numeroMes,
          LEFT(DATENAME(MONTH, v.fecha), 3) AS mes,
          SUM(v.total) AS ventas,
          0 AS gastos,
          SUM(v.total) AS ganancia
          FROM ventas v
          WHERE v.estado = 'Completada'
          GROUP BY 
              MONTH(v.fecha),
              DATENAME(MONTH, v.fecha)
          ORDER BY numeroMes;
    `);
  return ventas.recordset;
};

export const ventasPorCategoria = async () => {
    const ventasCategoria = await pool.request().query(`
        SELECT
          c.nombre AS categoria,
          SUM(dv.subtotal) AS ventas
          FROM detalleventa dv
          INNER JOIN productos p
          ON dv.productoId=p.id
          INNER JOIN categorias c
          ON p.idCategoria=c.id
          INNER JOIN ventas v
          ON dv.ventaId=v.id
          WHERE v.estado='Completada'
          GROUP BY c.id,c.nombre
          ORDER BY ventas DESC;
    `);
  return ventasCategoria.recordset;
};

export const topProductosVendidos = async () => {
    const topProductos = await pool.request().query(`
      SELECT
        p.nombre AS producto,
        SUM(dv.cantidad) AS ventas,
        SUM(dv.subtotal) AS ingresos
        FROM detalleventa dv
        INNER JOIN productos p
        ON dv.productoId=p.id
        INNER JOIN ventas v
        ON dv.ventaId=v.id
        WHERE v.estado='Completada'
        GROUP BY p.id,p.nombre
        ORDER BY ventas DESC
    `);
  return topProductos.recordset;
};