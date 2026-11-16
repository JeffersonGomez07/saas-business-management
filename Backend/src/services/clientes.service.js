import pool from "../config/db.js";
import sql from "mssql";
import { validarCliente  } from "../validators/cliente.validator.js";

export const obtenerClientes = async (companyId) => {
  const clientes = await pool.request().input("companyId", sql.Int, companyId).query(`
    SELECT
      COUNT(DISTINCT ClienteId) AS totalClientes,
      SUM(Total) AS ingresosTotales,
      ROUND(SUM(Total) / COUNT(DISTINCT ClienteId), 2) AS promedioPorCliente
    FROM Ventas
    WHERE company_id = @companyId;
  `);

  return clientes.recordset[0];
};

export const listadoClientes = async (companyId) => {
  const clientes = await pool.request().input("companyId", sql.Int, companyId).query(`
    SELECT
      c.id,
      c.nombre,
      c.correo,
      c.telefono,
      c.direccion AS ubicacion,
      COALESCE(SUM(v.Total),0) AS totalCompras,
      COUNT(v.Id) AS numCompras,
      MAX(v.Fecha) AS ultimaCompra
    FROM Clientes c
    LEFT JOIN Ventas v
      ON c.Id = v.ClienteId AND v.company_id = @companyId
    WHERE c.company_id = @companyId
    GROUP BY
      c.Id,
      c.Nombre,
      c.Correo,
      c.Telefono,
      c.direccion;
  `);

  return clientes.recordset;
};

export const crearCliente = async (datos, companyId) => {
  
  validarCliente(datos);

  const { nombre, correo, telefono, direccion } = datos;


  if (correo) {
    const existe = await pool.request()
      .input("correo", sql.NVarChar(100), correo)
      .input("companyId", sql.Int, companyId)
      .query(`
        SELECT Id
        FROM Clientes
        WHERE Correo = @correo AND company_id = @companyId
      `);

    if (existe.recordset.length > 0) {
      throw new Error("Ya existe un cliente con ese correo.");
    }
  }

  const result = await pool.request()
    .input("nombre", sql.NVarChar(100), nombre)
    .input("correo", sql.NVarChar(100), correo || null)
    .input("telefono", sql.NVarChar(20), telefono || null)
    .input("direccion", sql.VarChar(255), direccion || null)
    .input("companyId", sql.Int, companyId)
    .query(`
      INSERT INTO Clientes
      (
        Nombre,
        Correo,
        Telefono,
        direccion,
        company_id
      )
      OUTPUT INSERTED.*
      VALUES
      (
        @nombre,
        @correo,
        @telefono,
        @direccion,
        @companyId
      )
    `);

  return result.recordset[0];
};