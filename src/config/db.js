// Pool de conexiones a PostgreSQL.
const { Pool, types } = require('pg');
const { db } = require('./env');

// NUMERIC (OID 1700) llega como texto; lo convertimos a número para el precio.
types.setTypeParser(1700, (valor) => parseFloat(valor));

const pool = new Pool(db);

// Todas las consultas pasan por aquí y usan parámetros ($1, $2...) para evitar inyección SQL.
const query = (texto, params) => pool.query(texto, params);

module.exports = { pool, query };
