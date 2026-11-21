// Validaciones del lado del servidor. Si hay errores se responde 400 con el detalle.
const HttpError = require('./httpError');

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const esTextoNoVacio = (valor) => typeof valor === 'string' && valor.trim().length > 0;

function lanzarSiHayErrores(errores) {
  if (errores.length > 0) {
    throw new HttpError(400, 'Datos inválidos', errores);
  }
}

function validarRegistro({ nombre, correo, password } = {}) {
  const errores = [];
  if (!esTextoNoVacio(nombre)) errores.push('El nombre es obligatorio');
  if (!esTextoNoVacio(correo)) errores.push('El correo es obligatorio');
  else if (!REGEX_CORREO.test(correo.trim())) errores.push('El correo no tiene un formato válido');
  if (typeof password !== 'string' || password.length < 6) {
    errores.push('La contraseña debe tener al menos 6 caracteres');
  }
  lanzarSiHayErrores(errores);
  return { nombre: nombre.trim(), correo: correo.trim().toLowerCase(), password };
}

function validarLogin({ correo, password } = {}) {
  const errores = [];
  if (!esTextoNoVacio(correo)) errores.push('El correo es obligatorio');
  if (!esTextoNoVacio(password)) errores.push('La contraseña es obligatoria');
  lanzarSiHayErrores(errores);
  return { correo: correo.trim().toLowerCase(), password };
}

function validarProducto({ nombre, descripcion, categoria, precio } = {}) {
  const errores = [];
  if (!esTextoNoVacio(nombre)) errores.push('El nombre es obligatorio');
  if (!esTextoNoVacio(descripcion)) errores.push('La descripción es obligatoria');
  if (!esTextoNoVacio(categoria)) errores.push('La categoría es obligatoria');
  if (typeof precio !== 'number' || !Number.isFinite(precio) || precio <= 0) {
    errores.push('El precio debe ser un número mayor que cero');
  }
  lanzarSiHayErrores(errores);
  return {
    nombre: nombre.trim(),
    descripcion: descripcion.trim(),
    categoria: categoria.trim(),
    precio: Math.round(precio * 100) / 100,
  };
}

// Valida que un identificador sea un entero positivo.
function validarId(valor, campo = 'id') {
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new HttpError(400, 'Datos inválidos', [`El ${campo} debe ser un entero positivo`]);
  }
  return numero;
}

module.exports = { validarRegistro, validarLogin, validarProducto, validarId };
