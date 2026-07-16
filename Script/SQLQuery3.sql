INSERT INTO Categorias (nombre)
VALUES
('Laptops'),
('Accesorios'),
('Monitores'),
('Almacenamiento'),
('Periféricos');

INSERT INTO Clientes (Nombre, Correo, Telefono)
VALUES
('Juan Pérez', 'juan@gmail.com', '88881111'),
('María González', 'maria@gmail.com', '88882222'),
('Carlos Rodríguez', 'carlos@gmail.com', '88883333'),
('Ana Mora', 'ana@gmail.com', '88884444'),
('Luis Sánchez', 'luis@gmail.com', '88885555');

INSERT INTO Productos (Nombre, Precio, Stock, idCategoria)
VALUES
('Laptop Lenovo ThinkPad', 650000, 15, 1),
('Laptop HP Pavilion', 720000, 12, 1),
('Mouse Logitech G203', 18000, 50, 2),
('Teclado Mecánico Redragon', 35000, 30, 2),
('Monitor Samsung 24"', 125000, 20, 3),
('SSD Kingston 1TB', 55000, 40, 4),
('Memoria USB 64GB', 8000, 60, 4),
('Audífonos HyperX', 42000, 25, 5),
('Webcam Logitech C920', 58000, 18, 5),
('Mouse Pad XL', 12000, 45, 2);

INSERT INTO users (name, company_name, email, password)
VALUES
('Administrador', 'Tech Store', 'admin@techstore.com', '123456'),
('Jeff', 'Tech Store', 'jeff@techstore.com', '123456');

INSERT INTO Ventas (Codigo, Fecha, ClienteId, Total, MetodoPago, Estado)
VALUES
('V001','2026-01-15',1,686000,'Tarjeta','Completada'),
('V002','2026-02-10',2,125000,'Efectivo','Completada'),
('V003','2026-03-08',3,730000,'SINPE','Completada'),
('V004','2026-04-12',4,97000,'Tarjeta','Completada'),
('V005','2026-05-20',5,770000,'Tarjeta','Completada'),
('V006','2026-06-05',1,67000,'SINPE','Completada'),
('V007','2026-06-10',2,90000,'Efectivo','Completada'),
('V008','2026-06-15',3,137000,'Tarjeta','Completada'),
('V009','2026-06-20',4,55000,'SINPE','Completada'),
('V010','2026-06-28',5,42000,'Efectivo','Completada');

INSERT INTO DetalleVenta
(VentaId, ProductoId, Cantidad, PrecioUnitario, Subtotal)
VALUES

-- Venta 1
(1,1,1,650000,650000),
(1,3,2,18000,36000),

-- Venta 2
(2,5,1,125000,125000),

-- Venta 3
(3,2,1,720000,720000),
(3,7,1,8000,8000),
(3,10,1,12000,12000),

-- Venta 4
(4,8,1,42000,42000),
(4,9,1,58000,58000),

-- Venta 5
(5,2,1,720000,720000),
(5,6,1,50000,50000),

-- Venta 6
(6,6,1,55000,55000),
(6,10,1,12000,12000),

-- Venta 7
(7,3,5,18000,90000),

-- Venta 8
(8,5,1,125000,125000),
(8,10,1,12000,12000),

-- Venta 9
(9,6,1,55000,55000),

-- Venta 10
(10,8,1,42000,42000);

SELECT * FROM Categorias;

SELECT * FROM Clientes;

SELECT * FROM Productos;

SELECT * FROM Ventas;

SELECT * FROM DetalleVenta;

SELECT * FROM users;