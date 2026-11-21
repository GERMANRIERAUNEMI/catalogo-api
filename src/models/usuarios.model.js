// Acceso a datos de usuarios.
const { query } = require('../config/db');

// Columnas públicas: nunca se selecciona password_hash para respuestas.
const COLUMNAS_PUBLICAS = 'id, nombre, correo, rol, creado_en';

async function crear({ nombre, correo, passwordHash, rol = 'usuario' }) {
  const { rows } = await query(
    `INSERT INTO usuarios (nombre, correo, password_hash, rol)
     VALUES ($1, $2, $3, $4)
     RETURNING ${COLUMNAS_PUBLICAS}`,
    [nombre, correo, passwordHash, rol]
  );
  return rows[0];
}

// Solo se usa en el login para comparar la contraseña.
async function buscarPorCorreoConHash(correo) {
  const { rows } = await query(
    'SELECT id, nombre, correo, rol, password_hash FROM usuarios WHERE correo = $1',
    [correo]
  );
  return rows[0] || null;
}

module.exports = { crear, buscarPorCorreoConHash };
