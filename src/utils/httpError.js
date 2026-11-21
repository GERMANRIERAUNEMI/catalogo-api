// Error con código HTTP para devolver respuestas claras desde cualquier capa.
class HttpError extends Error {
  constructor(status, mensaje, errores) {
    super(mensaje);
    this.status = status;
    this.errores = errores;
  }
}

module.exports = HttpError;
