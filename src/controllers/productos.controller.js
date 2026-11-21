// CRUD de productos.
const Productos = require('../models/productos.model');
const HttpError = require('../utils/httpError');
const { validarProducto, validarId } = require('../utils/validaciones');

// GET /api/productos?categoria=Hogar  (público)
async function listar(req, res) {
  const { categoria } = req.query;
  const productos = await Productos.listar(typeof categoria === 'string' ? categoria.trim() : undefined);
  return res.status(200).json({ ok: true, total: productos.length, data: productos });
}

// GET /api/productos/:id  (público)
async function obtener(req, res) {
  const id = validarId(req.params.id);
  const producto = await Productos.obtenerPorId(id);
  if (!producto) throw new HttpError(404, 'Producto no encontrado');
  return res.status(200).json({ ok: true, data: producto });
}

// POST /api/productos  (solo admin)
async function crear(req, res) {
  const datos = validarProducto(req.body);
  const producto = await Productos.crear(datos);
  return res.status(201).json({ ok: true, mensaje: 'Producto creado', data: producto });
}

// PUT /api/productos/:id  (solo admin)
async function actualizar(req, res) {
  const id = validarId(req.params.id);
  const datos = validarProducto(req.body);
  const producto = await Productos.actualizar(id, datos);
  if (!producto) throw new HttpError(404, 'Producto no encontrado');
  return res.status(200).json({ ok: true, mensaje: 'Producto actualizado', data: producto });
}

// DELETE /api/productos/:id  (solo admin)
async function eliminar(req, res) {
  const id = validarId(req.params.id);
  const eliminado = await Productos.eliminar(id);
  if (!eliminado) throw new HttpError(404, 'Producto no encontrado');
  return res.status(204).send();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
