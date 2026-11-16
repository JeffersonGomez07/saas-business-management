import pool from "../config/db.js";
import sql from "mssql";
import { validarProducto } from "../validators/inventario.validator.js";

export const obtenerInventario = async (companyId) => {
  
    const result = await pool.request().input("companyId", sql.Int, companyId).query(`
      SELECT
          COUNT(*) AS totalProductos,
          SUM(Stock * Precio) AS valorInventario,
          SUM(CASE WHEN Stock <= 5 THEN 1 ELSE 0 END) AS productosBajoStock
      FROM Productos
      WHERE company_id = @companyId;
    `);

    return result.recordset[0];

};

export const listadoProductos = async (companyId) => {
      const result = await pool.request().input("companyId", sql.Int, companyId).query(`
          SELECT
              p.Id,
              p.Nombre AS Producto,
              p.SKU,
              p.ProveedorId,
              c.Nombre AS Categoria,
              p.Stock,
              p.MinStock,
              p.Precio,
              pr.Nombre AS Proveedor,
              p.Estado
              FROM Productos p
              INNER JOIN Categorias c
              ON p.IdCategoria = c.Id AND c.company_id = @companyId
              LEFT JOIN Proveedores pr
              ON p.ProveedorId = pr.Id AND pr.company_id = @companyId
              WHERE p.Activo = 1 AND p.company_id = @companyId
              ORDER BY p.Nombre;
      `);

    return result.recordset;

};

export const obtenerCategorias = async (companyId) => {
    const result = await pool.request().input("companyId", sql.Int, companyId).query(`
      SELECT
        Id AS id,
        Nombre AS nombre
      FROM Categorias
      WHERE company_id = @companyId
      ORDER BY Nombre
    `);

    return result.recordset;

};

export const eliminarProducto = async(id, companyId)=>{

    const result = await pool.request()
      .input("id", id)
      .input("companyId", sql.Int, companyId)
      .query(`
        UPDATE Productos
        SET
          Activo = 0,
          FechaActualizacion = GETDATE()
        WHERE Id=@id AND company_id=@companyId
      `);


    if(result.rowsAffected[0]===0){

        throw new Error("Producto no encontrado");

    }


    return {
        message:"Producto desactivado correctamente"
    };

};

export const actualizarProducto = async(id, datos, companyId)=>{


    const {
        nombre,
        sku,
        categoria,
        proveedor,
        precio,
        stock,
        minStock
    } = datos;

    const categoriaResult = await pool.request()
      .input("categoria", sql.VarChar, categoria)
      .input("companyId", sql.Int, companyId)
      .query("SELECT Id FROM Categorias WHERE Nombre=@categoria AND company_id=@companyId");
    if (!categoriaResult.recordset.length) {
        throw new Error("La categoría no existe");
    }

    let proveedorId = null;
    if (proveedor) {
        const proveedorResult = await pool.request()
          .input("proveedorId", sql.Int, proveedor)
          .input("companyId", sql.Int, companyId)
          .query("SELECT Id FROM Proveedores WHERE Id=@proveedorId AND company_id=@companyId");
        if (!proveedorResult.recordset.length) {
            throw new Error("El proveedor no existe");
        }
        proveedorId = proveedorResult.recordset[0].Id;
    }

    const result = await pool.request()

    .input("id",id)
    .input("nombre",nombre)
    .input("sku", sql.VarChar(50), sku || null)
    .input("categoriaId", sql.Int, categoriaResult.recordset[0].Id)
    .input("proveedorId", sql.Int, proveedorId)
    .input("precio",precio)
    .input("stock",stock)
    .input("minStock", sql.Int, minStock)
    .input("companyId", sql.Int, companyId)

    .query(`
        UPDATE Productos
        SET
            Nombre=@nombre,
            SKU=@sku,
            idCategoria=@categoriaId,
            ProveedorId=@proveedorId,
            Precio=@precio,
            Stock=@stock,
            MinStock=@minStock,
            FechaActualizacion=GETDATE()
        WHERE Id=@id AND company_id=@companyId
    `);

    if (result.rowsAffected[0] === 0) {
        throw new Error("Producto no encontrado");
    }


    return {
        message:"Producto actualizado"
    };

};

export const agregarProducto = async(datos, companyId)=>{
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
      .input("companyId", sql.Int, companyId)
      .query(`
        SELECT id 
        FROM Categorias
        WHERE nombre = @Categoria AND company_id = @companyId
      `);


    if(categoriaResult.recordset.length === 0){
    throw new Error("La categoría no existe");
}

    const idCategoria = categoriaResult.recordset[0].id;



    // Buscar proveedor
    let proveedorId = null;

    if (proveedor) {
      const proveedorResult = await pool.request()
        .input("Proveedor", sql.Int, proveedor)
        .input("companyId", sql.Int, companyId)
        .query(`
          SELECT Id
          FROM Proveedores
          WHERE Id = @Proveedor AND company_id = @companyId
        `);

      if (!proveedorResult.recordset.length) {
        throw new Error("El proveedor no existe");
      }
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
      .input("companyId", sql.Int, companyId)
      .query(`
        INSERT INTO Productos
        (
          Nombre,
          Precio,
          Stock,
          idCategoria,
          SKU,
          ProveedorId,
          MinStock,
          company_id
        )
        VALUES
        (
          @Nombre,
          @Precio,
          @Stock,
          @CategoriaId,
          @SKU,
          @ProveedorId,
          @MinStock,
          @companyId
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

export const obtenerProveedores = async(companyId)=>{

    const result = await pool.request().input("companyId", sql.Int, companyId).query(`
      SELECT
        Id,
        Nombre
      FROM Proveedores
      WHERE company_id = @companyId
      ORDER BY Nombre
    `);


    return result.recordset;

};