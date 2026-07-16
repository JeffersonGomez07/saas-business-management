SELECT * FROM Clientes;

ALTER TABLE Clientes
ADD direccion VARCHAR(255);

SELECT
    c.id,
    c.nombre,
    c.correo,
    c.telefono,
    c.direccion AS ubicacion,
    COALESCE(SUM(v.total),0) AS totalCompras,
    COUNT(v.id) AS numCompras,
    MAX(v.fecha) AS ultimaCompra
FROM Clientes c
LEFT JOIN Ventas v
ON c.id = v.clienteId
GROUP BY
c.id,c.nombre,c.correo,c.telefono,c.direccion;


UPDATE Clientes
SET direccion = 'Heredia'
WHERE id = 5;