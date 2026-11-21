// Autenticación (JWT) y autorización (roles).
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/env');
const HttpError = require('../utils/httpError');

// Verifica que la petición traiga un JWT válido: firma correcta y no vencido.
function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization || '';
  const [tipo, token] = encabezado.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return next(new HttpError(401, 'Token no proporcionado'));
  }

  try {
    // jwt.verify comprueba la firma con el secreto y la fecha de expiración (exp).
    const payload = jwt.verify(token, jwtConfig.secret, { algorithms: ['HS256'] });
    // La identidad sale SOLO del token verificado, nunca del body o la URL.
    req.usuario = { id: Number(payload.sub), rol: payload.rol };
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new HttpError(401, 'Token vencido, inicia sesión nuevamente'));
    }
    return next(new HttpError(401, 'Token inválido'));
  }
}

// Permite el acceso solo a los roles indicados. Se usa después de verificarToken.
function permitirRoles(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return next(new HttpError(403, 'No tienes permisos para realizar esta acción'));
    }
    return next();
  };
}

module.exports = { verificarToken, permitirRoles };
