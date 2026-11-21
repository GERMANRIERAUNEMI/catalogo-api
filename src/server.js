// Punto de entrada: comprueba la conexión a la base de datos y levanta el servidor.
const { port } = require('./config/env');
const { pool } = require('./config/db');
const app = require('./app');

async function iniciar() {
  try {
    await pool.query('SELECT 1');
    console.log('Conexión a PostgreSQL correcta');
  } catch (error) {
    console.error('No se pudo conectar a PostgreSQL:', error.message);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}/api`);
  });
}

iniciar();
