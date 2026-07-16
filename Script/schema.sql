/*==============================================================
  SaaS Database Schema
==============================================================*/

CREATE DATABASE SaaS;
GO

USE SaaS;
GO

/*==============================================================
  Tabla: Categorias
==============================================================*/

CREATE TABLE Categorias (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);
GO

/*==============================================================
  Tabla: Clientes
==============================================================*/

CREATE TABLE Clientes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Correo NVARCHAR(100) UNIQUE,
    Telefono NVARCHAR(20) UNIQUE,
    FechaCreacion DATETIME DEFAULT GETDATE(),
    direccion VARCHAR(255)
);
GO

/*==============================================================
  Tabla: Proveedores
==============================================================*/

CREATE TABLE Proveedores (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(100),
    Telefono VARCHAR(30),
    Correo VARCHAR(100)
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
    costo DECIMAL(10,2)
);
GO

/*==============================================================
  Tabla: users
==============================================================*/

CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    fotoPerfil VARCHAR(500),
    updated_at DATETIME
);
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
    Codigo NVARCHAR(20) NOT NULL UNIQUE,
    Fecha DATETIME DEFAULT GETDATE(),
    ClienteId INT NOT NULL,
    Total DECIMAL(10,2) NOT NULL,
    MetodoPago NVARCHAR(30) NOT NULL,
    Estado NVARCHAR(20) NOT NULL
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
    Subtotal DECIMAL(10,2) NOT NULL
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
    FechaLectura DATETIME NULL
);
GO

/*==============================================================
  Relaciones (FOREIGN KEY)
==============================================================*/

/* Productos -> Categorias */

ALTER TABLE Productos
ADD CONSTRAINT FK_Productos_Categorias
FOREIGN KEY (idCategoria)
REFERENCES Categorias(id);
GO

/* Productos -> Proveedores */

ALTER TABLE Productos
ADD CONSTRAINT FK_ProductoProveedor
FOREIGN KEY (ProveedorId)
REFERENCES Proveedores(Id);
GO

/* Ventas -> Clientes */

ALTER TABLE Ventas
ADD CONSTRAINT FK_Ventas_Clientes
FOREIGN KEY (ClienteId)
REFERENCES Clientes(Id);
GO

/* DetalleVenta -> Ventas */

ALTER TABLE DetalleVenta
ADD CONSTRAINT FK_DetalleVenta_Ventas
FOREIGN KEY (VentaId)
REFERENCES Ventas(Id);
GO

/* DetalleVenta -> Productos */

ALTER TABLE DetalleVenta
ADD CONSTRAINT FK_DetalleVenta_Productos
FOREIGN KEY (ProductoId)
REFERENCES Productos(Id);
GO

/* Notificaciones -> Users */

ALTER TABLE Notificaciones
ADD CONSTRAINT FK_Notificaciones_Users
FOREIGN KEY (UserId)
REFERENCES users(id);
GO

/* User Preferences -> Users */

ALTER TABLE user_preferences
ADD CONSTRAINT FK_UserPreferences_Users
FOREIGN KEY (user_id)
REFERENCES users(id);
GO
