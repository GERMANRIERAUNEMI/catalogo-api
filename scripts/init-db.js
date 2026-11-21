// Crea las tablas y carga los productos de ejemplo.
// Uso:  npm run db:init      (crea si no existen)
//       npm run db:reset     (borra todo y vuelve a crear)
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

async function main() {
  const reset = process.argv.includes('--reset');
  const schema = fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(__dirname, '..', 'database', 'seed.sql'), 'utf8');

  if (reset) {
    await pool.query('DROP TABLE IF EXISTS favoritos, productos, usuarios CASCADE');
    console.log('Tablas eliminadas');
  }

  await pool.query(schema);
  console.log('Tablas creadas o verificadas');

  await pool.query(seed);
  const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM productos');
  console.log(`Productos en la base de datos: ${rows[0].total}`);
}

main()
  .catch((error) => {
    console.error('Error al inicializar la base de datos:', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
