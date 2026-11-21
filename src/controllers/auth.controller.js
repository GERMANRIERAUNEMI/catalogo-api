// Registro e inicio de sesión.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/env');
const Usuarios = require('../models/usuarios.model');
const HttpError = require('../utils/httpError');
const { validarRegistro, validarLogin } = require('../utils/validaciones');

const RONDAS_BCRYPT = 10;

// POST /api/auth/registro
async function registro(req, res) {
  const { nombre, correo, password } = validarRegistro(req.body);
  const passwordHash = await bcrypt.hash(password, RONDAS_BCRYPT);

  try {
    // El rol se fija en 'usuario': aunque el cliente envíe "rol": "admin", se ignora.
    const usuario = await Usuarios.crear({ nombre, correo, passwordHash, rol: 'usuario' });
    return res.status(201).json({ ok: true, mensaje: 'Usuario registrado', data: usuario });
  } catch (error) {
    if (error.code === '23505') {
      throw new HttpError(409, 'El correo ya está registrado');
    }
    throw error;
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { correo, password } = validarLogin(req.body);
  const usuario = await Usuarios.buscarPorCorreoConHash(correo);

  // Mismo mensaje si el correo no existe o la contraseña está mal (no revelamos cuál falló).
  const passwordCorrecta = usuario && (await bcrypt.compare(password, usuario.password_hash));
  if (!passwordCorrecta) {
    throw new HttpError(401, 'Credenciales incorrectas');
  }

  const token = jwt.sign({ sub: String(usuario.id), rol: usuario.rol }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    algorithm: 'HS256',
  });

  return res.status(200).json({
    ok: true,
    mensaje: 'Inicio de sesión correcto',
    data: {
      token,
      expiraEn: jwtConfig.expiresIn,
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
    },
  });
}

module.exports = { registro, login };
