// Acceso a datos de favoritos. Todas las consultas filtran por usuario_id.
const { query } = require('../config/db');

async function listarPorUsuario(usuarioId) {
  const { rows } = await query(
    `SELECT p.id, p.nombre, p.descripcion, p.categoria, p.precio, f.creado_en AS agregado_en
     FROM favoritos f
     JOIN productos p ON p.id = f.producto_id
     WHERE f.usuario_id = $1
     ORDER BY f.creado_en DESC`,
    [usuarioId]
  );
  return rows;
}

async function agregar(usuarioId, productoId) {
  const { rows } = await query(
    `INSERT INTO favoritos (usuario_id, producto_id)
     VALUES ($1, $2)
     RETURNING usuario_id, producto_id, creado_en`,
    [usuarioId, productoId]
  );
  return rows[0];
}

// El WHERE con usuario_id garantiza que nadie borre favoritos ajenos.
async function quitar(usuarioId, productoId) {
  const { rowCount } = await query(
    'DELETE FROM favoritos WHERE usuario_id = $1 AND producto_id = $2',
    [usuarioId, productoId]
  );
  return rowCount > 0;
}

module.exports = { listarPorUsuario, agregar, quitar };
