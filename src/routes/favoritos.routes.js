const { Router } = require('express');
const controller = require('../controllers/favoritos.controller');
const { verificarToken } = require('../middlewares/auth');

const router = Router();

// Todas las rutas de favoritos requieren usuario autenticado
router.use(verificarToken);

router.get('/', controller.listar);
router.post('/', controller.agregar);
router.delete('/:productoId', controller.quitar);

module.exports = router;
