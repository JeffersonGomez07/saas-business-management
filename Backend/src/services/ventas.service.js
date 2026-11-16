import pool from "../config/db.js";
import sql from "mssql";
import { generarCodigoVenta } from "../utils/generarCodigoVenta.js";
import { validarVenta } from "../validators/ventas.validator.js";


export const ventas = async (companyId) => {

    const result = await pool.request().input("companyId", sql.Int, companyId).query(`
      SELECT
        COUNT(*) AS transacciones,
        ISNULL(SUM(Total),0) AS totalVentas,
        SUM(
          CASE WHEN Estado='Completada'
          THEN 1 ELSE 0 END
        ) AS completadas
      FROM Ventas
      WHERE company_id = @companyId
    `);

    return result.recordset[0];
};



export const listadoVentas = async (companyId) => {

  const result = await pool.request().input("companyId", sql.Int, companyId).query(`
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
        ON v.ClienteId = c.Id AND c.company_id = @companyId
      INNER JOIN DetalleVenta dv
        ON v.Id = dv.VentaId AND dv.company_id = @companyId
      INNER JOIN Productos p
        ON dv.ProductoId = p.Id AND p.company_id = @companyId
      WHERE v.company_id = @companyId
  `);


  return result.recordset;
};




export const registrarVenta = async (datos, companyId) => {


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
      .input("companyId", sql.Int, companyId)
      .query(`
        SELECT TOP 1 Codigo
        FROM Ventas
        WHERE Codigo LIKE 'V%' AND company_id = @companyId
        ORDER BY Id DESC
      `);


    const ultimoCodigo = ultimoCodigoResult.recordset[0]?.Codigo;

    const codigoVenta = generarCodigoVenta(ultimoCodigo, companyId);



    const cliente = await new sql.Request(transaction)
      .input("clienteId", sql.Int, clienteId)
      .input("companyId", sql.Int, companyId)
      .query("SELECT Id FROM Clientes WHERE Id = @clienteId AND company_id = @companyId");
    if (!cliente.recordset.length) {
      throw new Error("Cliente no encontrado");
    }

    const result = await new sql.Request(transaction)

      .input("codigo", codigoVenta)
      .input("clienteId", clienteId)
      .input("metodoPago", metodoPago)
      .input("companyId", sql.Int, companyId)

      .query(`
        INSERT INTO Ventas
        (
          Codigo,
          Fecha,
          ClienteId,
          Total,
          MetodoPago,
          Estado,
          company_id
        )

        VALUES
        (
          @codigo,
          GETDATE(),
          @clienteId,
          0,
          @metodoPago,
          'Completada',
          @companyId
        );

        SELECT SCOPE_IDENTITY() AS ventaId;
      `);



    const ventaId = result.recordset[0].ventaId;


    let total = 0;



    for (const item of productos) {


      const detalle = await new sql.Request(transaction)

        .input("productoId", item.productoId)
        .input("companyId", sql.Int, companyId)

        .query(`
          SELECT Precio
          FROM Productos
          WHERE Id=@productoId AND company_id=@companyId AND Activo=1
        `);

      if (!detalle.recordset.length) {
        throw new Error("Producto no encontrado");
      }


      const precio = detalle.recordset[0].Precio;


      const subtotal = precio * item.cantidad;


      total += subtotal;



      await new sql.Request(transaction)

        .input("ventaId", ventaId)
        .input("productoId", item.productoId)
        .input("cantidad", item.cantidad)
        .input("precio", precio)
        .input("subtotal", subtotal)
        .input("companyId", sql.Int, companyId)

        .query(`
          INSERT INTO DetalleVenta
          (
            VentaId,
            ProductoId,
            Cantidad,
            PrecioUnitario,
            Subtotal
            , company_id
          )

          VALUES
          (
            @ventaId,
            @productoId,
            @cantidad,
            @precio,
            @subtotal
            , @companyId
          )
        `);

    }



    await new sql.Request(transaction)

      .input("ventaId", ventaId)
      .input("total", total)
      .input("companyId", sql.Int, companyId)

      .query(`
        UPDATE Ventas
        SET Total=@total
        WHERE Id=@ventaId AND company_id=@companyId
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



export const obtenerClientes = async (companyId) => {


    const result = await pool.request().input("companyId", sql.Int, companyId).query(`

      SELECT
        Id,
        Nombre
      FROM Clientes
      WHERE company_id = @companyId
      ORDER BY Nombre;

    `);



    return result.recordset;

};




export const obtenerProductos = async (companyId) => {


    const result = await pool.request().input("companyId", sql.Int, companyId).query(`

      SELECT
        Id,
        Nombre,
        Precio,
        Stock
      FROM Productos
      WHERE Activo=1 AND company_id = @companyId
      ORDER BY Nombre;

    `);



    return result.recordset;

};