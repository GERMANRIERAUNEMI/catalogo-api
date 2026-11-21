// Genera un JWT firmado con el secreto real pero YA VENCIDO.
// Sirve para probar en Postman que la API responde 401 cuando el token expiró.
// Uso:  npm run token:vencido   -> copiar el valor en la variable "tokenVencido" del entorno de Postman
require('dotenv').config({ quiet: true });
const jwt = require('jsonwebtoken');

function generarTokenVencido() {
  const ahora = Math.floor(Date.now() / 1000);
  return jwt.sign(
    { sub: '1', rol: 'admin', iat: ahora - 7200, exp: ahora - 3600 },
    process.env.JWT_SECRET,
    { algorithm: 'HS256' }
  );
}

if (require.main === module) {
  console.log(generarTokenVencido());
}

module.exports = { generarTokenVencido };
