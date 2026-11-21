const { Router } = require('express');
const controller = require('../controllers/auth.controller');

const router = Router();

router.post('/registro', controller.registro); // Público
router.post('/login', controller.login);       // Público

module.exports = router;
