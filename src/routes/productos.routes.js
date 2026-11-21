const { Router } = require('express');
const controller = require('../controllers/productos.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth');

const router = Router();

// Públicas
router.get('/', controller.listar);
router.get('/:id', controller.obtener);

// Solo administrador: primero se verifica el token y luego el rol
router.post('/', verificarToken, permitirRoles('admin'), controller.crear);
router.put('/:id', verificarToken, permitirRoles('admin'), controller.actualizar);
router.delete('/:id', verificarToken, permitirRoles('admin'), controller.eliminar);

module.exports = router;
