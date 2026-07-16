import pool from "../config/db.js";
import sql from "mssql";
import { generarCodigoVenta } from "../utils/generarCodigoVenta.js";
import { validarVenta } from "../validators/ventas.validator.js";


export const ventas = async () => {

    const result = await pool.request().query(`
      SELECT
        COUNT(*) AS transacciones,
        ISNULL(SUM(Total),0) AS totalVentas,
        SUM(
          CASE WHEN Estado='Completada'
          THEN 1 ELSE 0 END
        ) AS completadas
      FROM Ventas
    `);

    return result.recordset[0];
};



export const listadoVentas = async () => {

  const result = await pool.request().query(`
      SELECT
        v.Id,
        v.Codigo,
        v.Fecha,
        c.Nombre AS Cliente,
        v.Total,
        v.MetodoPago,
        v.Estado,
        p.Nombre AS Producto
      FROM Ventas v
      INNER JOIN Clientes c
        ON v.ClienteId = c.Id
      INNER JOIN DetalleVenta dv
        ON v.Id = dv.VentaId
      INNER JOIN Productos p
        ON dv.ProductoId = p.Id
  `);


  return result.recordset;
};




export const registrarVenta = async (datos) => {


   validarVenta(datos);


    const {
      clienteId,
      metodoPago,
      productos
    } = datos;



  const transaction = new sql.Transaction(pool);


  try {

    await transaction.begin();


    const ultimoCodigoResult = await new sql.Request(transaction)
      .query(`
        SELECT TOP 1 Codigo
        FROM Ventas
        WHERE Codigo LIKE 'V%'
        ORDER BY Id DESC
      `);


    const ultimoCodigo = ultimoCodigoResult.recordset[0]?.Codigo;

    const codigoVenta = generarCodigoVenta(ultimoCodigo);



    const result = await new sql.Request(transaction)

      .input("codigo", codigoVenta)
      .input("clienteId", clienteId)
      .input("metodoPago", metodoPago)

      .query(`
        INSERT INTO Ventas
        (
          Codigo,
          Fecha,
          ClienteId,
          Total,
          MetodoPago,
          Estado
        )

        VALUES
        (
          @codigo,
          GETDATE(),
          @clienteId,
          0,
          @metodoPago,
          'Completada'
        );

        SELECT SCOPE_IDENTITY() AS ventaId;
      `);



    const ventaId = result.recordset[0].ventaId;


    let total = 0;



    for (const item of productos) {


      const detalle = await new sql.Request(transaction)

        .input("productoId", item.productoId)

        .query(`
          SELECT Precio
          FROM Productos
          WHERE Id=@productoId
        `);



      const precio = detalle.recordset[0].Precio;


      const subtotal = precio * item.cantidad;


      total += subtotal;



      await new sql.Request(transaction)

        .input("ventaId", ventaId)
        .input("productoId", item.productoId)
        .input("cantidad", item.cantidad)
        .input("precio", precio)
        .input("subtotal", subtotal)

        .query(`
          INSERT INTO DetalleVenta
          (
            VentaId,
            ProductoId,
            Cantidad,
            PrecioUnitario,
            Subtotal
          )

          VALUES
          (
            @ventaId,
            @productoId,
            @cantidad,
            @precio,
            @subtotal
          )
        `);

    }



    await new sql.Request(transaction)

      .input("ventaId", ventaId)
      .input("total", total)

      .query(`
        UPDATE Ventas
        SET Total=@total
        WHERE Id=@ventaId
      `);



    await transaction.commit();



    return {
      message:"Venta registrada correctamente",
      ventaId,
      total
    };


  } catch(error){


    await transaction.rollback();

    throw error;

  }

};



export const obtenerClientes = async () => {


    const result = await pool.request().query(`

      SELECT
        Id,
        Nombre
      FROM Clientes
      ORDER BY Nombre;

    `);



    return result.recordset;

};




export const obtenerProductos = async () => {


    const result = await pool.request().query(`

      SELECT
        Id,
        Nombre,
        Precio,
        Stock
      FROM Productos
      WHERE Activo=1
      ORDER BY Nombre;

    `);



    return result.recordset;

};