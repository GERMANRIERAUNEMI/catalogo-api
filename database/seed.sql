-- Productos de ejemplo (datos ficticios).
-- Solo se insertan si la tabla está vacía.
INSERT INTO productos (nombre, descripcion, categoria, precio)
SELECT * FROM (VALUES
  ('Audífonos Inalámbricos X1', 'Audífonos bluetooth con cancelación de ruido', 'Electrónica', 59.90),
  ('Teclado Mecánico K70',      'Teclado mecánico con switches rojos y luz RGB', 'Electrónica', 85.50),
  ('Mochila Urbana 20L',        'Mochila resistente al agua con compartimento para laptop', 'Accesorios', 34.99),
  ('Botella Térmica 750ml',     'Botella de acero inoxidable que mantiene la temperatura 12 horas', 'Hogar', 18.75),
  ('Libro Node.js Práctico',    'Guía práctica para construir APIs con Node.js y Express', 'Libros', 27.00),
  ('Lámpara de Escritorio LED', 'Lámpara LED con brillo regulable y puerto USB', 'Hogar', 22.40)
) AS datos(nombre, descripcion, categoria, precio)
WHERE NOT EXISTS (SELECT 1 FROM productos);
