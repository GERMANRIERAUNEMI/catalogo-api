// Manejo centralizado de errores: respuestas JSON consistentes y sin detalles internos.
const HttpError = require('../utils/httpError');

function rutaNoEncontrada(req, res, next) {
  next(new HttpError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function manejarErrores(err, req, res, next) {
  // JSON mal formado en el body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, mensaje: 'El cuerpo de la petición no es un JSON válido' });
  }

  if (err instanceof HttpError) {
    const cuerpo = { ok: false, mensaje: err.message };
    if (err.errores) cuerpo.errores = err.errores;
    return res.status(err.status).json(cuerpo);
  }

  // Errores de PostgreSQL que se pueden traducir a algo entendible
  if (err.code === '23505') {
    return res.status(409).json({ ok: false, mensaje: 'El registro ya existe' });
  }
  if (err.code === '23503') {
    return res.status(404).json({ ok: false, mensaje: 'El recurso referenciado no existe' });
  }

  // Cualquier otro error: se registra en consola, pero al cliente no se le muestran detalles.
  console.error(err);
  return res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
}

module.exports = { rutaNoEncontrada, manejarErrores };
