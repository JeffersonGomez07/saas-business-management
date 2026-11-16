USE SaaS;
GO

IF OBJECT_ID('dbo.companies', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.companies (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(150) NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END;
GO

IF COL_LENGTH('dbo.users', 'company_id') IS NULL
    ALTER TABLE dbo.users ADD company_id INT NULL;
GO

DECLARE @userId INT, @companyName NVARCHAR(150), @companyId INT;
DECLARE users_cursor CURSOR LOCAL FAST_FORWARD FOR
    SELECT id, LTRIM(RTRIM(company_name))
    FROM dbo.users
    WHERE company_id IS NULL
      AND NULLIF(LTRIM(RTRIM(company_name)), '') IS NOT NULL;

OPEN users_cursor;
FETCH NEXT FROM users_cursor INTO @userId, @companyName;
WHILE @@FETCH_STATUS = 0
BEGIN
    INSERT INTO dbo.companies (name) VALUES (@companyName);
    SET @companyId = CONVERT(INT, SCOPE_IDENTITY());
    UPDATE dbo.users SET company_id = @companyId WHERE id = @userId;
    FETCH NEXT FROM users_cursor INTO @userId, @companyName;
END;
CLOSE users_cursor;
DEALLOCATE users_cursor;
GO

IF EXISTS (SELECT 1 FROM dbo.users WHERE company_id IS NULL)
BEGIN
    ;THROW 50001, 'Hay usuarios sin empresa asignada. Asigne company_id antes de continuar.', 1;
END;
GO

ALTER TABLE dbo.users ALTER COLUMN company_id INT NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Users_Companies')
    ALTER TABLE dbo.users ADD CONSTRAINT FK_Users_Companies
        FOREIGN KEY (company_id) REFERENCES dbo.companies(id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_Users_Company_Id' AND object_id = OBJECT_ID('dbo.users'))
    ALTER TABLE dbo.users ADD CONSTRAINT UQ_Users_Company_Id UNIQUE (company_id, id);
GO

DECLARE @tables TABLE (table_name SYSNAME);
INSERT INTO @tables (table_name)
VALUES ('Categorias'), ('Clientes'), ('Proveedores'), ('Productos'), ('Ventas'), ('DetalleVenta'), ('Notificaciones');

DECLARE @table SYSNAME, @sql NVARCHAR(MAX);
DECLARE table_cursor CURSOR LOCAL FAST_FORWARD FOR SELECT table_name FROM @tables;
OPEN table_cursor;
FETCH NEXT FROM table_cursor INTO @table;
WHILE @@FETCH_STATUS = 0
BEGIN
    IF COL_LENGTH('dbo.' + @table, 'company_id') IS NULL
    BEGIN
        SET @sql = N'ALTER TABLE dbo.' + QUOTENAME(@table) + N' ADD company_id INT NULL;';
        EXEC sys.sp_executesql @sql;
    END;

    SET @sql = N'
        IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N''FK_' + @table + N'_Companies'')
            ALTER TABLE dbo.' + QUOTENAME(@table) + N' ADD CONSTRAINT ' + QUOTENAME('FK_' + @table + '_Companies') + N'
                FOREIGN KEY (company_id) REFERENCES dbo.companies(id);';
    EXEC sys.sp_executesql @sql;
    FETCH NEXT FROM table_cursor INTO @table;
END;
CLOSE table_cursor;
DEALLOCATE table_cursor;
GO

IF OBJECT_ID('dbo.LegacyCompanyAssignments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.LegacyCompanyAssignments (
        entity_name SYSNAME NOT NULL,
        record_id INT NOT NULL,
        company_id INT NOT NULL,
        CONSTRAINT PK_LegacyCompanyAssignments PRIMARY KEY (entity_name, record_id),
        CONSTRAINT FK_LegacyCompanyAssignments_Companies
            FOREIGN KEY (company_id) REFERENCES dbo.companies(id),
        CONSTRAINT CK_LegacyCompanyAssignments_Entity
            CHECK (entity_name IN ('Categorias', 'Clientes', 'Proveedores', 'Productos', 'Ventas'))
    );
END;
GO

/*
Before continuing, populate dbo.LegacyCompanyAssignments with the confirmed
owner of every existing row in Categorias, Clientes, Proveedores, Productos,
and Ventas. Record IDs are the existing primary keys. Do not infer owners from
names or email addresses. Keep this table as the ownership audit trail.
*/
BEGIN TRY
BEGIN TRANSACTION;

UPDATE c SET company_id = a.company_id
FROM dbo.Categorias c
INNER JOIN dbo.LegacyCompanyAssignments a
    ON a.entity_name = 'Categorias' AND a.record_id = c.id
WHERE c.company_id IS NULL;

UPDATE c SET company_id = a.company_id
FROM dbo.Clientes c
INNER JOIN dbo.LegacyCompanyAssignments a
    ON a.entity_name = 'Clientes' AND a.record_id = c.Id
WHERE c.company_id IS NULL;

UPDATE p SET company_id = a.company_id
FROM dbo.Proveedores p
INNER JOIN dbo.LegacyCompanyAssignments a
    ON a.entity_name = 'Proveedores' AND a.record_id = p.Id
WHERE p.company_id IS NULL;

UPDATE p SET company_id = a.company_id
FROM dbo.Productos p
INNER JOIN dbo.LegacyCompanyAssignments a
    ON a.entity_name = 'Productos' AND a.record_id = p.Id
WHERE p.company_id IS NULL;

UPDATE v SET company_id = a.company_id
FROM dbo.Ventas v
INNER JOIN dbo.LegacyCompanyAssignments a
    ON a.entity_name = 'Ventas' AND a.record_id = v.Id
WHERE v.company_id IS NULL;

UPDATE d
SET company_id = v.company_id
FROM dbo.DetalleVenta d
INNER JOIN dbo.Ventas v ON v.Id = d.VentaId
WHERE d.company_id IS NULL AND v.company_id IS NOT NULL;

UPDATE n
SET company_id = u.company_id
FROM dbo.Notificaciones n
INNER JOIN dbo.users u ON u.id = n.UserId
WHERE n.company_id IS NULL;

SELECT entity_name, COUNT(*) AS unassigned_records
FROM (
    SELECT 'Categorias' AS entity_name FROM dbo.Categorias WHERE company_id IS NULL
    UNION ALL SELECT 'Clientes' FROM dbo.Clientes WHERE company_id IS NULL
    UNION ALL SELECT 'Proveedores' FROM dbo.Proveedores WHERE company_id IS NULL
    UNION ALL SELECT 'Productos' FROM dbo.Productos WHERE company_id IS NULL
    UNION ALL SELECT 'Ventas' FROM dbo.Ventas WHERE company_id IS NULL
    UNION ALL SELECT 'DetalleVenta' FROM dbo.DetalleVenta WHERE company_id IS NULL
    UNION ALL SELECT 'Notificaciones' FROM dbo.Notificaciones WHERE company_id IS NULL
) AS unresolved
GROUP BY entity_name
ORDER BY entity_name;

IF EXISTS (SELECT 1 FROM dbo.Categorias WHERE company_id IS NULL)
   OR EXISTS (SELECT 1 FROM dbo.Clientes WHERE company_id IS NULL)
   OR EXISTS (SELECT 1 FROM dbo.Proveedores WHERE company_id IS NULL)
   OR EXISTS (SELECT 1 FROM dbo.Productos WHERE company_id IS NULL)
   OR EXISTS (SELECT 1 FROM dbo.Ventas WHERE company_id IS NULL)
   OR EXISTS (SELECT 1 FROM dbo.DetalleVenta WHERE company_id IS NULL)
   OR EXISTS (SELECT 1 FROM dbo.Notificaciones WHERE company_id IS NULL)
BEGIN
    ;THROW 50002, 'Faltan asignaciones de empresa. Complete dbo.LegacyCompanyAssignments y vuelva a ejecutar la migracion.', 1;
END;
GO

ALTER TABLE dbo.Categorias ALTER COLUMN company_id INT NOT NULL;
ALTER TABLE dbo.Clientes ALTER COLUMN company_id INT NOT NULL;
ALTER TABLE dbo.Proveedores ALTER COLUMN company_id INT NOT NULL;
ALTER TABLE dbo.Productos ALTER COLUMN company_id INT NOT NULL;
ALTER TABLE dbo.Ventas ALTER COLUMN company_id INT NOT NULL;
ALTER TABLE dbo.DetalleVenta ALTER COLUMN company_id INT NOT NULL;
ALTER TABLE dbo.Notificaciones ALTER COLUMN company_id INT NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_Categorias_Company_Id' AND object_id = OBJECT_ID('dbo.Categorias'))
    ALTER TABLE dbo.Categorias ADD CONSTRAINT UQ_Categorias_Company_Id UNIQUE (company_id, id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_Clientes_Company_Id' AND object_id = OBJECT_ID('dbo.Clientes'))
    ALTER TABLE dbo.Clientes ADD CONSTRAINT UQ_Clientes_Company_Id UNIQUE (company_id, id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_Proveedores_Company_Id' AND object_id = OBJECT_ID('dbo.Proveedores'))
    ALTER TABLE dbo.Proveedores ADD CONSTRAINT UQ_Proveedores_Company_Id UNIQUE (company_id, id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_Productos_Company_Id' AND object_id = OBJECT_ID('dbo.Productos'))
    ALTER TABLE dbo.Productos ADD CONSTRAINT UQ_Productos_Company_Id UNIQUE (company_id, id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_Ventas_Company_Id' AND object_id = OBJECT_ID('dbo.Ventas'))
    ALTER TABLE dbo.Ventas ADD CONSTRAINT UQ_Ventas_Company_Id UNIQUE (company_id, id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Productos_Categorias_Company')
    ALTER TABLE dbo.Productos ADD CONSTRAINT FK_Productos_Categorias_Company
        FOREIGN KEY (company_id, idCategoria) REFERENCES dbo.Categorias(company_id, id);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Productos_Proveedores_Company')
    ALTER TABLE dbo.Productos ADD CONSTRAINT FK_Productos_Proveedores_Company
        FOREIGN KEY (company_id, ProveedorId) REFERENCES dbo.Proveedores(company_id, id);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Ventas_Clientes_Company')
    ALTER TABLE dbo.Ventas ADD CONSTRAINT FK_Ventas_Clientes_Company
        FOREIGN KEY (company_id, ClienteId) REFERENCES dbo.Clientes(company_id, id);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_DetalleVenta_Ventas_Company')
    ALTER TABLE dbo.DetalleVenta ADD CONSTRAINT FK_DetalleVenta_Ventas_Company
        FOREIGN KEY (company_id, VentaId) REFERENCES dbo.Ventas(company_id, id);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_DetalleVenta_Productos_Company')
    ALTER TABLE dbo.DetalleVenta ADD CONSTRAINT FK_DetalleVenta_Productos_Company
        FOREIGN KEY (company_id, ProductoId) REFERENCES dbo.Productos(company_id, id);
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Notificaciones_Users_Company')
    ALTER TABLE dbo.Notificaciones ADD CONSTRAINT FK_Notificaciones_Users_Company
        FOREIGN KEY (company_id, UserId) REFERENCES dbo.users(company_id, id);

COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO

/*
Review the final ownership counts before enabling the API:
*/
SELECT 'Categorias' AS entity_name, company_id, COUNT(*) AS records FROM dbo.Categorias GROUP BY company_id
UNION ALL SELECT 'Clientes', company_id, COUNT(*) FROM dbo.Clientes GROUP BY company_id
UNION ALL SELECT 'Proveedores', company_id, COUNT(*) FROM dbo.Proveedores GROUP BY company_id
UNION ALL SELECT 'Productos', company_id, COUNT(*) FROM dbo.Productos GROUP BY company_id
UNION ALL SELECT 'Ventas', company_id, COUNT(*) FROM dbo.Ventas GROUP BY company_id
UNION ALL SELECT 'DetalleVenta', company_id, COUNT(*) FROM dbo.DetalleVenta GROUP BY company_id
UNION ALL SELECT 'Notificaciones', company_id, COUNT(*) FROM dbo.Notificaciones GROUP BY company_id
ORDER BY entity_name, company_id;
