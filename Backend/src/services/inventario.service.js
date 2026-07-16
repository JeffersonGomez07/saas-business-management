import pool from "../config/db.js";
import sql from "mssql";
import { validarProducto } from "../validators/inventario.validator.js";

export const obtenerInventario = async () => {
  
    const result = await pool.request().query(`
      SELECT
          COUNT(*) AS totalProductos,
          SUM(Stock * Precio) AS valorInventario,
          SUM(CASE WHEN Stock <= 5 THEN 1 ELSE 0 END) AS productosBajoStock
      FROM Productos;
    `);

    return result.recordset[0];

};

export const listadoProductos = async () => {
      const result = await pool.request().query(`
          SELECT
              p.Id,
              p.Nombre AS Producto,
              p.SKU,
              c.Nombre AS Categoria,
              p.Stock,
              p.MinStock,
              p.Precio,
              pr.Nombre AS Proveedor,
              p.Estado
              FROM Productos p
              INNER JOIN Categorias c
              ON p.IdCategoria = c.Id
              INNER JOIN Proveedores pr
              ON p.ProveedorId = pr.Id
              WHERE p.Activo = 1
              ORDER BY p.Nombre;
      `);

    return result.recordset;

};

export const obtenerCategorias = async () => {
    const result = await pool.request().query(`
      SELECT
        Id AS id,
        Nombre AS nombre
      FROM Categorias
      ORDER BY Nombre
    `);

    return result.recordset;

};

export const eliminarProducto = async(id)=>{

    const result = await pool.request()
      .input("id", id)
      .query(`
        UPDATE Productos
        SET
          Activo = 0,
          FechaActualizacion = GETDATE()
        WHERE Id=@id
      `);


    if(result.rowsAffected[0]===0){

        throw new Error("Producto no encontrado");

    }


    return {
        message:"Producto desactivado correctamente"
    };

};

export const actualizarProducto = async(id, datos)=>{


    const {
        nombre,
        precio,
        stock
    } = datos;


    await pool.request()

    .input("id",id)
    .input("nombre",nombre)
    .input("precio",precio)
    .input("stock",stock)

    .query(`
        UPDATE Productos
        SET
            Nombre=@nombre,
            Precio=@precio,
            Stock=@stock,
            FechaActualizacion=GETDATE()
        WHERE Id=@id
    `);


    return {
        message:"Producto actualizado"
    };

};

export const agregarProducto = async(datos)=>{
  try {

    validarProducto(datos);

    const {
      nombre,
      sku,
      categoria,
      proveedor,
      precio,
      stock,
      minStock
    } = datos;

    // Buscar id de categoría
    const categoriaResult = await pool.request()
      .input("Categoria", sql.VarChar, categoria)
      .query(`
        SELECT id 
        FROM Categorias
        WHERE nombre = @Categoria
      `);


    if(categoriaResult.recordset.length === 0){
    throw new Error("La categoría no existe");
}

    const idCategoria = categoriaResult.recordset[0].id;



    // Buscar proveedor
    const proveedorResult = await pool.request()
      .input("Proveedor", sql.VarChar, proveedor)
      .query(`
        SELECT Id
        FROM Proveedores
        WHERE Nombre = @Proveedor
      `);



    let proveedorId = null;

    if(proveedorResult.recordset.length > 0){
      proveedorId = proveedorResult.recordset[0].Id;
    }



    await pool.request()
      .input("Nombre", sql.NVarChar, nombre)
      .input("Precio", sql.Decimal(10,2), precio)
      .input("Stock", sql.Int, stock)
      .input("CategoriaId", sql.Int, idCategoria)
      .input("SKU", sql.VarChar, sku)
      .input("ProveedorId", sql.Int, proveedorId)
      .input("MinStock", sql.Int, minStock)
      .query(`
        INSERT INTO Productos
        (
          Nombre,
          Precio,
          Stock,
          idCategoria,
          SKU,
          ProveedorId,
          MinStock
        )
        VALUES
        (
          @Nombre,
          @Precio,
          @Stock,
          @CategoriaId,
          @SKU,
          @ProveedorId,
          @MinStock
        )
      `);



    return {
      mensaje:"Producto agregado correctamente"
      };


  }catch(error){

    console.error(error);

    throw error;

  }
}

export const obtenerProveedores = async()=>{

    const result = await pool.request().query(`
      SELECT
        Id,
        Nombre
      FROM Proveedores
      ORDER BY Nombre
    `);


    return result.recordset;

};