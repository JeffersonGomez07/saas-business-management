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

DECLARE @companyMap TABLE (user_id INT, company_id INT);

MERGE dbo.companies AS target
USING (
    SELECT id AS user_id, LTRIM(RTRIM(company_name)) AS name
    FROM dbo.users
    WHERE company_id IS NULL
      AND NULLIF(LTRIM(RTRIM(company_name)), '') IS NOT NULL
) AS source
ON 1 = 0
WHEN NOT MATCHED THEN
    INSERT (name) VALUES (source.name)
OUTPUT source.user_id, inserted.id INTO @companyMap (user_id, company_id);

UPDATE u
SET company_id = mapping.company_id
FROM dbo.users u
INNER JOIN @companyMap mapping ON mapping.user_id = u.id;
GO

IF EXISTS (SELECT 1 FROM dbo.users WHERE company_id IS NULL)
    THROW 50001, 'Hay usuarios sin empresa asignada. Asigne company_id antes de continuar.', 1;
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

UPDATE n
SET company_id = u.company_id
FROM dbo.Notificaciones n
INNER JOIN dbo.users u ON u.id = n.UserId
WHERE n.company_id IS NULL;
GO

/*
Existing customers, products, sales, details, categories and suppliers have no
reliable owner in the legacy schema. Their company_id intentionally remains NULL
until an administrator assigns each record to its actual company. The API only
returns rows whose company_id matches the authenticated user's token.
*/
