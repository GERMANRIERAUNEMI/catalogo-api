// Favoritos del usuario autenticado. El id del usuario siempre sale de req.usuario (token).
const Favoritos = require('../models/favoritos.model');
const Productos = require('../models/productos.model');
const HttpError = require('../utils/httpError');
const { validarId } = require('../utils/validaciones');

// GET /api/favoritos
async function listar(req, res) {
  const favoritos = await Favoritos.listarPorUsuario(req.usuario.id);
  return res.status(200).json({ ok: true, total: favoritos.length, data: favoritos });
}

// POST /api/favoritos   body: { "productoId": 3 }
async function agregar(req, res) {
  const productoId = validarId(req.body?.productoId, 'productoId');

  const producto = await Productos.obtenerPorId(productoId);
  if (!producto) throw new HttpError(404, 'Producto no encontrado');

  try {
    const favorito = await Favoritos.agregar(req.usuario.id, productoId);
    return res.status(201).json({ ok: true, mensaje: 'Producto agregado a favoritos', data: favorito });
  } catch (error) {
    if (error.code === '23505') throw new HttpError(409, 'El producto ya está en tus favoritos');
    if (error.code === '23503') throw new HttpError(404, 'Producto no encontrado');
    throw error;
  }
}

// DELETE /api/favoritos/:productoId
async function quitar(req, res) {
  const productoId = validarId(req.params.productoId, 'productoId');
  const quitado = await Favoritos.quitar(req.usuario.id, productoId);
  // Si el favorito es de otro usuario, para este usuario "no existe": 404.
  if (!quitado) throw new HttpError(404, 'El producto no está en tus favoritos');
  return res.status(204).send();
}

module.exports = { listar, agregar, quitar };
