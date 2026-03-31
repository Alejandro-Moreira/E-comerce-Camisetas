const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Ruta para obtener perfil del usuario logueado
router.get('/me', verifyToken, (req, res) => {
  // Simplemente devolvemos el contenido decodificado del JWT
  res.json({ user: req.user });
});

module.exports = router;
