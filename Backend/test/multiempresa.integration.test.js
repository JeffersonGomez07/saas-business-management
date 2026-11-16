import test from "node:test";
import assert from "node:assert/strict";
import "dotenv/config";

const enabled = process.env.RUN_SQL_INTEGRATION_TESTS === "1";
const testDatabase = "SaaS_Test";

test(
  "registration, login, customers, inventory, sales and reports stay tenant-isolated",
  { skip: !enabled || process.env.DB_DATABASE !== testDatabase },
  async (t) => {
    const [{ default: pool }, sqlModule, jwt, auth, customers, inventory, sales, reports] = await Promise.all([
      import("../src/config/db.js"),
      import("mssql"),
      import("jsonwebtoken"),
      import("../src/services/auth.service.js"),
      import("../src/services/clientes.service.js"),
      import("../src/services/inventario.service.js"),
      import("../src/services/ventas.service.js"),
      import("../src/services/reportes.service.js"),
    ]);
    const sql = sqlModule.default ?? sqlModule;

    const companyIds = [];
    t.after(async () => {
      for (const companyId of companyIds) {
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        try {
          await new sql.Request(transaction)
            .input("companyId", sql.Int, companyId)
            .query(`
              DELETE FROM DetalleVenta WHERE company_id=@companyId;
              DELETE FROM Ventas WHERE company_id=@companyId;
              DELETE FROM Productos WHERE company_id=@companyId;
              DELETE FROM Clientes WHERE company_id=@companyId;
              DELETE FROM Proveedores WHERE company_id=@companyId;
              DELETE FROM Categorias WHERE company_id=@companyId;
              DELETE FROM Notificaciones WHERE company_id=@companyId;
              DELETE FROM user_preferences
              WHERE user_id IN (SELECT id FROM users WHERE company_id=@companyId);
              DELETE FROM users WHERE company_id=@companyId;
              DELETE FROM companies WHERE id=@companyId;
            `);
          await transaction.commit();
        } catch (error) {
          await transaction.rollback();
          throw error;
        }
      }
      await pool.close();
    });

    assert.ok(
      process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32,
      "JWT_SECRET must be configured for integration tests"
    );

    const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const password = "Integration-test-password-2026";
    const tenantA = await auth.register({
      name: "Tenant A",
      company_name: `Integration A ${suffix}`,
      email: `tenant-a-${suffix}@example.test`,
      password,
    });
    companyIds.push(tenantA.company_id);
    const tenantB = await auth.register({
      name: "Tenant B",
      company_name: `Integration B ${suffix}`,
      email: `tenant-b-${suffix}@example.test`,
      password,
    });
    companyIds.push(tenantB.company_id);

    const loginA = await auth.login({ email: `tenant-a-${suffix}@example.test`, password });
    const loginB = await auth.login({ email: `tenant-b-${suffix}@example.test`, password });
    const claimsA = jwt.verify(loginA.token, process.env.JWT_SECRET);
    const claimsB = jwt.verify(loginB.token, process.env.JWT_SECRET);
    assert.equal(claimsA.companyId, tenantA.company_id);
    assert.equal(claimsB.companyId, tenantB.company_id);

    const clientA = await customers.crearCliente({
      nombre: "Customer A",
      correo: `customer-a-${suffix}@example.test`,
    }, claimsA.companyId);
    const clientB = await customers.crearCliente({
      nombre: "Customer B",
      correo: `customer-b-${suffix}@example.test`,
    }, claimsB.companyId);
    await inventory.agregarProducto({
      nombre: "Product A",
      sku: `A-${suffix}`,
      categoria: "General",
      precio: 100,
      stock: 10,
      minStock: 1,
    }, claimsA.companyId);
    await inventory.agregarProducto({
      nombre: "Product B",
      sku: `B-${suffix}`,
      categoria: "General",
      precio: 200,
      stock: 10,
      minStock: 1,
    }, claimsB.companyId);

    const productIdA = await pool.request()
      .input("sku", sql.VarChar(50), `A-${suffix}`)
      .input("companyId", sql.Int, claimsA.companyId)
      .query("SELECT Id FROM Productos WHERE SKU=@sku AND company_id=@companyId");
    const productIdB = await pool.request()
      .input("sku", sql.VarChar(50), `B-${suffix}`)
      .input("companyId", sql.Int, claimsB.companyId)
      .query("SELECT Id FROM Productos WHERE SKU=@sku AND company_id=@companyId");
    assert.equal(productIdA.recordset.length, 1);
    assert.equal(productIdB.recordset.length, 1);

    await inventory.actualizarProducto(productIdA.recordset[0].Id, {
      nombre: "Product A",
      sku: `A-${suffix}`,
      categoria: "General",
      proveedor: null,
      precio: 100,
      stock: 9,
      minStock: 1,
    }, claimsA.companyId);

    await sales.registrarVenta({
      clienteId: clientA.Id,
      metodoPago: "Efectivo",
      productos: [{ productoId: productIdA.recordset[0].Id, cantidad: 1 }],
    }, claimsA.companyId);
    await sales.registrarVenta({
      clienteId: clientB.Id,
      metodoPago: "Efectivo",
      productos: [{ productoId: productIdB.recordset[0].Id, cantidad: 1 }],
    }, claimsB.companyId);

    assert.equal((await customers.listadoClientes(claimsA.companyId)).length, 1);
    assert.equal((await customers.listadoClientes(claimsB.companyId)).length, 1);
    assert.equal((await inventory.listadoProductos(claimsA.companyId)).length, 1);
    assert.equal((await inventory.listadoProductos(claimsB.companyId)).length, 1);
    assert.equal((await sales.listadoVentas(claimsA.companyId)).length, 1);
    assert.equal((await sales.listadoVentas(claimsB.companyId)).length, 1);
    assert.equal((await sales.ventas(claimsA.companyId)).totalVentas, 100);
    assert.equal((await sales.ventas(claimsB.companyId)).totalVentas, 200);

    const todayResult = await pool.request()
      .query("SELECT CONVERT(varchar(10), GETDATE(), 23) AS today");
    const today = todayResult.recordset[0].today;
    assert.equal((await reports.obtenerReportes(today, today, claimsA.companyId)).Ingresos, 100);
    assert.equal((await reports.obtenerReportes(today, today, claimsB.companyId)).Ingresos, 200);

    await assert.rejects(
      sales.registrarVenta({
        clienteId: clientB.Id,
        metodoPago: "Efectivo",
        productos: [{ productoId: productIdA.recordset[0].Id, cantidad: 1 }],
      }, claimsA.companyId),
      /Cliente no encontrado/
    );
    await assert.rejects(
      sales.registrarVenta({
        clienteId: clientA.Id,
        metodoPago: "Efectivo",
        productos: [{ productoId: productIdB.recordset[0].Id, cantidad: 1 }],
      }, claimsA.companyId),
      /Producto no encontrado/
    );
    await assert.rejects(
      inventory.eliminarProducto(productIdB.recordset[0].Id, claimsA.companyId),
      /Producto no encontrado/
    );
  }
);
