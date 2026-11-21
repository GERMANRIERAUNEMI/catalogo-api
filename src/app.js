// Configuración de Express: middlewares, rutas y manejo de errores.
const express = require('express');
const authRoutes = require('./routes/auth.routes');
const productosRoutes = require('./routes/productos.routes');
const favoritosRoutes = require('./routes/favoritos.routes');
const { rutaNoEncontrada, manejarErrores } = require('./middlewares/errorHandler');

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

app.get('/api', (req, res) => {
  res.json({ ok: true, mensaje: 'API Catálogo de productos con favoritos' });
});

app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/favoritos', favoritosRoutes);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

module.exports = app;
