const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { body, validationResult } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { strictAuthLimiter } = require('../middlewares/rateLimiters');

// Diseño de Software Resistente: Data Sanitization
const validateRegister = [
  body('nombre').trim().escape().notEmpty().withMessage('Falta nombre'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido o corrupto'),
  body('password').isLength({ min: 6 }).withMessage('Password muy débil (min 6)'),
  (req, res, next) => {
    const errors = validationResult(req);
    // Filtrado de ataque XSS o SQL Injection
    if (!errors.isEmpty()) return errorResponse(res, 'VALIDATION_ERROR', errors.array()[0].msg, 400);
    next();
  }
];

router.post('/register', strictAuthLimiter, validateRegister, authController.register);
router.post('/login', strictAuthLimiter, authController.login);
router.post('/refresh-token', strictAuthLimiter, authController.refreshToken);

// Ruta para obtener perfil del usuario logueado
router.get('/me', verifyToken, (req, res) => {
  successResponse(res, { user: req.user }, 'Usuario autenticado');
});

// Rutas avanzadas de Correo y Clave
router.get('/verify-email', authController.verifyEmail);
router.post('/forgot-password', strictAuthLimiter, authController.forgotPassword);
router.post('/reset-password', strictAuthLimiter, authController.resetPassword);

module.exports = router;
