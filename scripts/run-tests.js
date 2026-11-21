// Ejecuta la colección de Postman con Newman (el servidor debe estar encendido).
// - Toma las credenciales del admin desde .env (no se guardan en el entorno exportado).
// - Genera un token VENCIDO firmado con el secreto real para probar el 401 por expiración.
// Uso:  npm test                     (todas las pruebas)
//       npm run test:persistencia    (solo la carpeta de persistencia, después de reiniciar)
require('dotenv').config({ quiet: true });
const path = require('path');
const newman = require('newman');
const { generarTokenVencido } = require('./token-vencido');

const persistencia = process.argv.includes('--persistencia');

// Token con firma válida pero exp en el pasado.
const tokenVencido = generarTokenVencido();

const opciones = {
  collection: path.join(__dirname, '..', 'postman', 'Catalogo_API.postman_collection.json'),
  environment: path.join(__dirname, '..', 'postman', 'Catalogo_API.postman_environment.json'),
  envVar: [
    { key: 'baseUrl', value: `http://localhost:${process.env.PORT || 3000}/api` },
    { key: 'adminCorreo', value: process.env.ADMIN_CORREO },
    { key: 'adminPassword', value: process.env.ADMIN_PASSWORD },
    { key: 'tokenVencido', value: tokenVencido },
  ],
  reporters: ['cli', 'json'],
  reporter: { json: { export: path.join(__dirname, '..', 'postman', 'resultados', 'ultimo-resultado.json') } },
};

if (persistencia) {
  opciones.folder = '09 - Persistencia (ejecutar después de reiniciar el servidor)';
  opciones.environment = path.join(__dirname, '..', 'postman', 'resultados', 'entorno-despues-de-pruebas.json');
} else {
  opciones.exportEnvironment = path.join(__dirname, '..', 'postman', 'resultados', 'entorno-despues-de-pruebas.json');
}

newman.run(opciones, (error, resumen) => {
  if (error) {
    console.error('Error al ejecutar las pruebas:', error.message);
    process.exit(1);
  }
  const fallos = resumen.run.failures.length;
  console.log(fallos === 0 ? '\nTodas las pruebas pasaron.' : `\nPruebas fallidas: ${fallos}`);
  process.exit(fallos === 0 ? 0 : 1);
});
