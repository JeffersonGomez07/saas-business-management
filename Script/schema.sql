/*==============================================================
  SaaS Database Schema
==============================================================*/

CREATE DATABASE SaaS;
GO

USE SaaS;
GO

/*==============================================================
  Tabla: Empresas
==============================================================*/

CREATE TABLE companies (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(150) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

/*==============================================================
  Tabla: Categorias
==============================================================*/

CREATE TABLE Categorias (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    company_id INT NOT NULL,
    CONSTRAINT FK_Categorias_Companies FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT UQ_Categorias_Company_Id UNIQUE (company_id, id),
    CONSTRAINT UQ_Categorias_Company_Nombre UNIQUE (company_id, nombre)
);
GO

/*==============================================================
  Tabla: Clientes
==============================================================*/

CREATE TABLE Clientes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Correo NVARCHAR(100),
    Telefono NVARCHAR(20),
    FechaCreacion DATETIME DEFAULT GETDATE(),
    direccion VARCHAR(255),
    company_id INT NOT NULL,
    CONSTRAINT FK_Clientes_Companies FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT UQ_Clientes_Company_Id UNIQUE (company_id, id)
);
GO

CREATE UNIQUE INDEX UQ_Clientes_Company_Correo
ON Clientes(company_id, Correo) WHERE Correo IS NOT NULL;
GO

CREATE UNIQUE INDEX UQ_Clientes_Company_Telefono
ON Clientes(company_id, Telefono) WHERE Telefono IS NOT NULL;
GO

/*==============================================================
  Tabla: Proveedores
==============================================================*/

CREATE TABLE Proveedores (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(100),
    Telefono VARCHAR(30),
    Correo VARCHAR(100),
    company_id INT NOT NULL,
    CONSTRAINT FK_Proveedores_Companies FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT UQ_Proveedores_Company_Id UNIQUE (company_id, id)
);
GO

/*==============================================================
  Tabla: Productos
==============================================================*/

CREATE TABLE Productos (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    Stock INT NOT NULL,
    idCategoria INT,
    SKU VARCHAR(50),
    ProveedorId INT,
    Estado VARCHAR(20),
    MinStock INT DEFAULT 5,
    Activo BIT DEFAULT 1,
    FechaCreacion DATETIME2 DEFAULT GETDATE(),
    FechaActualizacion DATETIME2,
    costo DECIMAL(10,2),
    company_id INT NOT NULL,
    CONSTRAINT FK_Productos_Companies FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT UQ_Productos_Company_Id UNIQUE (company_id, id),
    CONSTRAINT FK_Productos_Categorias_Company FOREIGN KEY (company_id, idCategoria) REFERENCES Categorias(company_id, id),
    CONSTRAINT FK_Productos_Proveedores_Company FOREIGN KEY (company_id, ProveedorId) REFERENCES Proveedores(company_id, id)
);
GO

/*==============================================================
  Tabla: users
==============================================================*/

CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    company_id INT NOT NULL,
    company_role VARCHAR(20) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    fotoPerfil VARCHAR(500),
    updated_at DATETIME,
    CONSTRAINT FK_Users_Companies FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT CK_Users_CompanyRole CHECK (company_role IN ('owner', 'admin', 'member')),
    CONSTRAINT UQ_Users_Company_Id UNIQUE (company_id, id)
);
GO

/*==============================================================
  Tabla: Invitaciones a empresas
==============================================================*/

CREATE TABLE CompanyInvitations (
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
        FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT FK_CompanyInvitations_InvitedBy
        FOREIGN KEY (company_id, invited_by) REFERENCES users(company_id, id),
    CONSTRAINT UQ_CompanyInvitations_CodeHash UNIQUE (code_hash)
);
GO

CREATE UNIQUE INDEX UQ_CompanyInvitations_PendingEmail
ON CompanyInvitations(company_id, email)
WHERE accepted_at IS NULL AND revoked_at IS NULL;
GO

/*==============================================================
  Tabla: user_preferences
==============================================================*/

CREATE TABLE user_preferences (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    email_notifications BIT DEFAULT 1,
    push_notifications BIT DEFAULT 1,
    ventas_notifications BIT DEFAULT 1,
    inventario_notifications BIT DEFAULT 0,
    clientes_notifications BIT DEFAULT 1,
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(50) DEFAULT 'Español',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    timezone VARCHAR(100) DEFAULT '(GMT-6:00) Costa Rica'
);
GO

/*==============================================================
  Tabla: Ventas
==============================================================*/

CREATE TABLE Ventas (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Codigo NVARCHAR(20) NOT NULL,
    Fecha DATETIME DEFAULT GETDATE(),
    ClienteId INT NOT NULL,
    Total DECIMAL(10,2) NOT NULL,
    MetodoPago NVARCHAR(30) NOT NULL,
    Estado NVARCHAR(20) NOT NULL,
    company_id INT NOT NULL,
    CONSTRAINT FK_Ventas_Companies FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT UQ_Ventas_Company_Id UNIQUE (company_id, id),
    CONSTRAINT UQ_Ventas_Company_Codigo UNIQUE (company_id, Codigo),
    CONSTRAINT FK_Ventas_Clientes_Company FOREIGN KEY (company_id, ClienteId) REFERENCES Clientes(company_id, id)
);
GO

/*==============================================================
  Tabla: DetalleVenta
==============================================================*/

CREATE TABLE DetalleVenta (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    VentaId INT NOT NULL,
    ProductoId INT NOT NULL,
    Cantidad INT NOT NULL,
    PrecioUnitario DECIMAL(10,2) NOT NULL,
    Subtotal DECIMAL(10,2) NOT NULL,
    company_id INT NOT NULL,
    CONSTRAINT FK_DetalleVenta_Companies FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT FK_DetalleVenta_Ventas_Company FOREIGN KEY (company_id, VentaId) REFERENCES Ventas(company_id, id),
    CONSTRAINT FK_DetalleVenta_Productos_Company FOREIGN KEY (company_id, ProductoId) REFERENCES Productos(company_id, id)
);
GO

/*==============================================================
  Tabla: Notificaciones
==============================================================*/

CREATE TABLE Notificaciones (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Titulo NVARCHAR(150) NOT NULL,
    Mensaje NVARCHAR(500) NOT NULL,
    Categoria VARCHAR(30) NOT NULL,
    Prioridad VARCHAR(20) DEFAULT 'Normal',
    Leida BIT DEFAULT 0,
    Fecha DATETIME DEFAULT GETDATE(),
    FechaLectura DATETIME NULL,
    company_id INT NOT NULL,
    CONSTRAINT FK_Notificaciones_Companies FOREIGN KEY (company_id) REFERENCES companies(id),
    CONSTRAINT FK_Notificaciones_Users_Company FOREIGN KEY (company_id, UserId) REFERENCES users(company_id, id)
);
GO

/*==============================================================
  Relaciones (FOREIGN KEY)
==============================================================*/

/* User Preferences -> Users */

ALTER TABLE user_preferences
ADD CONSTRAINT FK_UserPreferences_Users
FOREIGN KEY (user_id)
REFERENCES users(id);
GO
