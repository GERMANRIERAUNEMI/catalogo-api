// Crea (o actualiza) el usuario administrador a partir de las variables del .env.
// Es el ÚNICO camino para obtener el rol admin: el registro público siempre crea 'usuario'.
// Uso:  npm run admin:crear
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

async function main() {
  const nombre = process.env.ADMIN_NOMBRE || 'Administrador';
  const correo = (process.env.ADMIN_CORREO || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';

  if (!correo || password.length < 6) {
    throw new Error('Define ADMIN_CORREO y ADMIN_PASSWORD (mínimo 6 caracteres) en el archivo .env');
  }

  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, correo, password_hash, rol)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (correo)
     DO UPDATE SET nombre = EXCLUDED.nombre, password_hash = EXCLUDED.password_hash, rol = 'admin'
     RETURNING id, correo, rol`,
    [nombre, correo, hash]
  );
  console.log(`Administrador listo: ${rows[0].correo} (id ${rows[0].id}, rol ${rows[0].rol})`);
}

main()
  .catch((error) => {
    console.error('No se pudo crear el administrador:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
