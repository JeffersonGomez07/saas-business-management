import sql from "mssql";
import pool from "../config/db.js";
import { calcularMargen } from "../utils/calcularMargen.js";

export const obtenerReportes = async (desde, hasta, companyId) => {

    const request = pool.request();

    request.input("desde", sql.Date, desde);
    request.input("hasta", sql.Date, hasta);
    request.input("companyId", sql.Int, companyId);

    const reportes = await request.query(`
        SELECT
            ISNULL(SUM(dv.subtotal),0) AS Ingresos,
            ISNULL(SUM(dv.cantidad * p.costo),0) AS Costos
        FROM DetalleVenta dv
        INNER JOIN Productos p
            ON dv.productoId = p.id AND p.company_id = @companyId
        INNER JOIN Ventas v
            ON dv.ventaId = v.id AND dv.company_id = @companyId
        WHERE
            v.estado = 'Completada'
            AND v.company_id = @companyId
            AND (@desde IS NULL OR v.fecha >= @desde)
            AND (@hasta IS NULL OR v.fecha < DATEADD(day, 1, @hasta));
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
export const analisisFinanciero = async (desde, hasta, companyId) => {

    const ventas = await pool.request()
      .input("desde", sql.Date, desde)
      .input("hasta", sql.Date, hasta)
      .input("companyId", sql.Int, companyId)
      .query(`
      SELECT
          MONTH(v.fecha) AS numeroMes,
          LEFT(DATENAME(MONTH, v.fecha), 3) AS mes,
          SUM(v.total) AS ventas,
          0 AS gastos,
          SUM(v.total) AS ganancia
          FROM ventas v
          WHERE v.estado = 'Completada'
            AND v.company_id = @companyId
            AND (@desde IS NULL OR v.fecha >= @desde)
            AND (@hasta IS NULL OR v.fecha < DATEADD(day, 1, @hasta))
          GROUP BY 
              MONTH(v.fecha),
              DATENAME(MONTH, v.fecha)
          ORDER BY numeroMes;
    `);
  return ventas.recordset;
};

export const ventasPorCategoria = async (desde, hasta, companyId) => {
    const ventasCategoria = await pool.request()
      .input("desde", sql.Date, desde)
      .input("hasta", sql.Date, hasta)
      .input("companyId", sql.Int, companyId)
      .query(`
        SELECT
          c.nombre AS categoria,
          SUM(dv.subtotal) AS ventas
          FROM detalleventa dv
          INNER JOIN productos p
          ON dv.productoId=p.id AND p.company_id = @companyId
          INNER JOIN categorias c
          ON p.idCategoria=c.id AND c.company_id = @companyId
          INNER JOIN ventas v
          ON dv.ventaId=v.id AND dv.company_id = @companyId
          WHERE v.estado='Completada'
            AND v.company_id = @companyId
            AND (@desde IS NULL OR v.fecha >= @desde)
            AND (@hasta IS NULL OR v.fecha < DATEADD(day, 1, @hasta))
          GROUP BY c.id,c.nombre
          ORDER BY ventas DESC;
    `);
  return ventasCategoria.recordset;
};

export const topProductosVendidos = async (desde, hasta, companyId) => {
    const topProductos = await pool.request()
      .input("desde", sql.Date, desde)
      .input("hasta", sql.Date, hasta)
      .input("companyId", sql.Int, companyId)
      .query(`
      SELECT
        p.nombre AS producto,
        SUM(dv.cantidad) AS ventas,
        SUM(dv.subtotal) AS ingresos
        FROM detalleventa dv
        INNER JOIN productos p
        ON dv.productoId=p.id AND p.company_id = @companyId
        INNER JOIN ventas v
        ON dv.ventaId=v.id AND dv.company_id = @companyId
        WHERE v.estado='Completada'
          AND v.company_id = @companyId
          AND (@desde IS NULL OR v.fecha >= @desde)
          AND (@hasta IS NULL OR v.fecha < DATEADD(day, 1, @hasta))
        GROUP BY p.id,p.nombre
        ORDER BY ventas DESC
    `);
  return topProductos.recordset;
};