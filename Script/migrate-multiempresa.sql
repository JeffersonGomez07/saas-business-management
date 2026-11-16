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

IF COL_LENGTH('dbo.users', 'company_role') IS NULL
    ALTER TABLE dbo.users ADD company_role VARCHAR(20) NULL;
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
        company_role VARCHAR(20) NULL,
        CONSTRAINT PK_LegacyCompanyAssignments PRIMARY KEY (entity_name, record_id),
        CONSTRAINT FK_LegacyCompanyAssignments_Companies
            FOREIGN KEY (company_id) REFERENCES dbo.companies(id)
    );
END;
GO

IF COL_LENGTH('dbo.LegacyCompanyAssignments', 'company_role') IS NULL
    ALTER TABLE dbo.LegacyCompanyAssignments ADD company_role VARCHAR(20) NULL;
GO

IF EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE name = 'CK_LegacyCompanyAssignments_Entity'
      AND parent_object_id = OBJECT_ID('dbo.LegacyCompanyAssignments')
)
    ALTER TABLE dbo.LegacyCompanyAssignments
        DROP CONSTRAINT CK_LegacyCompanyAssignments_Entity;

ALTER TABLE dbo.LegacyCompanyAssignments
    ADD CONSTRAINT CK_LegacyCompanyAssignments_Entity
        CHECK (entity_name IN ('users', 'Categorias', 'Clientes', 'Proveedores', 'Productos', 'Ventas'));
GO

IF EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE name = 'CK_LegacyCompanyAssignments_Role'
      AND parent_object_id = OBJECT_ID('dbo.LegacyCompanyAssignments')
)
    ALTER TABLE dbo.LegacyCompanyAssignments
        DROP CONSTRAINT CK_LegacyCompanyAssignments_Role;

ALTER TABLE dbo.LegacyCompanyAssignments
    ADD CONSTRAINT CK_LegacyCompanyAssignments_Role
        CHECK (
            (entity_name = 'users' AND (company_role IS NULL OR company_role IN ('owner', 'admin', 'member')))
            OR (entity_name <> 'users' AND company_role IS NULL)
        );
GO

IF OBJECT_ID('dbo.MultiTenantMigrationState', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.MultiTenantMigrationState (
        migration_key SYSNAME PRIMARY KEY,
        completed_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END;
GO

/*
Before the first successful run, create any required companies in dbo.companies
and populate dbo.LegacyCompanyAssignments for every existing user and every
row in Categorias, Clientes, Proveedores, Productos, and Ventas. Record IDs are
the existing primary keys. Set company_role to owner, admin, or member for
each user mapping; leave it NULL for business-data mappings. Do not infer
ownership from names or email addresses. Keep this table as the ownership and
company-role audit trail.
*/
BEGIN TRY
BEGIN TRANSACTION;

DECLARE @migrationComplete BIT = 0;
IF EXISTS (
    SELECT 1
    FROM dbo.MultiTenantMigrationState
    WHERE migration_key = 'multiempresa-v1'
)
    SET @migrationComplete = 1;

IF @migrationComplete = 0 AND EXISTS (
    SELECT 1
    FROM dbo.users u
    WHERE NOT EXISTS (
        SELECT 1
        FROM dbo.LegacyCompanyAssignments a
        WHERE a.entity_name = 'users'
          AND a.record_id = u.id
          AND a.company_role IN ('owner', 'admin', 'member')
    )
)
BEGIN
    ;THROW 50001, 'Asigne explícitamente cada usuario a una empresa y un rol en dbo.LegacyCompanyAssignments.', 1;
END;

IF @migrationComplete = 0 AND (
    EXISTS (SELECT 1 FROM dbo.Categorias c WHERE NOT EXISTS (
        SELECT 1 FROM dbo.LegacyCompanyAssignments a
        WHERE a.entity_name = 'Categorias' AND a.record_id = c.id
    ))
    OR EXISTS (SELECT 1 FROM dbo.Clientes c WHERE NOT EXISTS (
        SELECT 1 FROM dbo.LegacyCompanyAssignments a
        WHERE a.entity_name = 'Clientes' AND a.record_id = c.Id
    ))
    OR EXISTS (SELECT 1 FROM dbo.Proveedores p WHERE NOT EXISTS (
        SELECT 1 FROM dbo.LegacyCompanyAssignments a
        WHERE a.entity_name = 'Proveedores' AND a.record_id = p.Id
    ))
    OR EXISTS (SELECT 1 FROM dbo.Productos p WHERE NOT EXISTS (
        SELECT 1 FROM dbo.LegacyCompanyAssignments a
        WHERE a.entity_name = 'Productos' AND a.record_id = p.Id
    ))
    OR EXISTS (SELECT 1 FROM dbo.Ventas v WHERE NOT EXISTS (
        SELECT 1 FROM dbo.LegacyCompanyAssignments a
        WHERE a.entity_name = 'Ventas' AND a.record_id = v.Id
    ))
)
BEGIN
    ;THROW 50003, 'Asigne explícitamente cada registro empresarial a una empresa en dbo.LegacyCompanyAssignments.', 1;
END;

UPDATE u
SET company_id = a.company_id,
    company_role = a.company_role
FROM dbo.users u
INNER JOIN dbo.LegacyCompanyAssignments a
    ON a.entity_name = 'users' AND a.record_id = u.id;

UPDATE c SET company_id = a.company_id
FROM dbo.Categorias c
INNER JOIN dbo.LegacyCompanyAssignments a
    ON a.entity_name = 'Categorias' AND a.record_id = c.id;

UPDATE c SET company_id = a.company_id
FROM dbo.Clientes c
INNER JOIN dbo.LegacyCompanyAssignments a
    ON a.entity_name = 'Clientes' AND a.record_id = c.Id;

UPDATE p SET company_id = a.company_id
FROM dbo.Proveedores p
INNER JOIN dbo.LegacyCompanyAssignments a
    ON a.entity_name = 'Proveedores' AND a.record_id = p.Id;

UPDATE p SET company_id = a.company_id
FROM dbo.Productos p
INNER JOIN dbo.LegacyCompanyAssignments a
    ON a.entity_name = 'Productos' AND a.record_id = p.Id;

UPDATE v SET company_id = a.company_id
FROM dbo.Ventas v
INNER JOIN dbo.LegacyCompanyAssignments a
    ON a.entity_name = 'Ventas' AND a.record_id = v.Id;

UPDATE d
SET company_id = v.company_id
FROM dbo.DetalleVenta d
INNER JOIN dbo.Ventas v ON v.Id = d.VentaId;

UPDATE n
SET company_id = u.company_id
FROM dbo.Notificaciones n
INNER JOIN dbo.users u ON u.id = n.UserId;

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

IF EXISTS (SELECT 1 FROM dbo.users WHERE company_id IS NULL OR company_role IS NULL)
   OR EXISTS (SELECT 1 FROM dbo.Categorias WHERE company_id IS NULL)
   OR EXISTS (SELECT 1 FROM dbo.Clientes WHERE company_id IS NULL)
   OR EXISTS (SELECT 1 FROM dbo.Proveedores WHERE company_id IS NULL)
   OR EXISTS (SELECT 1 FROM dbo.Productos WHERE company_id IS NULL)
   OR EXISTS (SELECT 1 FROM dbo.Ventas WHERE company_id IS NULL)
   OR EXISTS (SELECT 1 FROM dbo.DetalleVenta WHERE company_id IS NULL)
   OR EXISTS (SELECT 1 FROM dbo.Notificaciones WHERE company_id IS NULL)
BEGIN
    ;THROW 50002, 'Faltan asignaciones o existen inconsistencias. Revise dbo.LegacyCompanyAssignments y vuelva a ejecutar la migracion.', 1;
END;

IF EXISTS (
    SELECT company_id
    FROM dbo.users
    GROUP BY company_id
    HAVING SUM(CASE WHEN company_role = 'owner' THEN 1 ELSE 0 END) = 0
)
BEGIN
    ;THROW 50004, 'Cada empresa con usuarios debe tener al menos un propietario asignado.', 1;
END;

ALTER TABLE dbo.users ALTER COLUMN company_id INT NOT NULL;
ALTER TABLE dbo.users ALTER COLUMN company_role VARCHAR(20) NOT NULL;
ALTER TABLE dbo.Categorias ALTER COLUMN company_id INT NOT NULL;
ALTER TABLE dbo.Clientes ALTER COLUMN company_id INT NOT NULL;
ALTER TABLE dbo.Proveedores ALTER COLUMN company_id INT NOT NULL;
ALTER TABLE dbo.Productos ALTER COLUMN company_id INT NOT NULL;
ALTER TABLE dbo.Ventas ALTER COLUMN company_id INT NOT NULL;
ALTER TABLE dbo.DetalleVenta ALTER COLUMN company_id INT NOT NULL;
ALTER TABLE dbo.Notificaciones ALTER COLUMN company_id INT NOT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Users_Companies')
    ALTER TABLE dbo.users ADD CONSTRAINT FK_Users_Companies
        FOREIGN KEY (company_id) REFERENCES dbo.companies(id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_Users_Company_Id' AND object_id = OBJECT_ID('dbo.users'))
    ALTER TABLE dbo.users ADD CONSTRAINT UQ_Users_Company_Id UNIQUE (company_id, id);

IF NOT EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE name = 'CK_Users_CompanyRole'
      AND parent_object_id = OBJECT_ID('dbo.users')
)
    ALTER TABLE dbo.users ADD CONSTRAINT CK_Users_CompanyRole
        CHECK (company_role IN ('owner', 'admin', 'member'));

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

IF OBJECT_ID('dbo.CompanyInvitations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CompanyInvitations (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        company_id INT NOT NULL,
        email VARCHAR(150) NOT NULL,
        code_hash VARBINARY(32) NOT NULL,
        invited_by INT NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        expires_at DATETIME2 NOT NULL,
        accepted_at DATETIME2 NULL,
        revoked_at DATETIME2 NULL,
        CONSTRAINT FK_CompanyInvitations_Companies
            FOREIGN KEY (company_id) REFERENCES dbo.companies(id),
        CONSTRAINT FK_CompanyInvitations_InvitedBy
            FOREIGN KEY (company_id, invited_by) REFERENCES dbo.users(company_id, id),
        CONSTRAINT UQ_CompanyInvitations_CodeHash UNIQUE (code_hash)
    );
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UQ_CompanyInvitations_PendingEmail'
      AND object_id = OBJECT_ID('dbo.CompanyInvitations')
)
    CREATE UNIQUE INDEX UQ_CompanyInvitations_PendingEmail
        ON dbo.CompanyInvitations(company_id, email)
        WHERE accepted_at IS NULL AND revoked_at IS NULL;

IF NOT EXISTS (
    SELECT 1
    FROM dbo.MultiTenantMigrationState
    WHERE migration_key = 'multiempresa-v1'
)
    INSERT INTO dbo.MultiTenantMigrationState (migration_key) VALUES ('multiempresa-v1');

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
