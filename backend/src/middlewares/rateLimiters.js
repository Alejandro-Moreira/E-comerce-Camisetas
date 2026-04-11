const rateLimit = require('express-rate-limit');

/**
 * Limitador Escudo de Autenticación
 * Diseñado estrictamente para endpoints sensibles (Login, Register, Forgot Password).
 * Limita a 5 intentos cada 15 minutos por IP para prevenir ataques de fuerza bruta.
 */
const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos de bloqueo
  max: 5, // Límite de 5 peticiones por IP
  message: { 
    success: false, 
    error: 'TOO_MANY_ATTEMPTS', 
    message: 'Se han detectado demasiados intentos fallidos. Por seguridad, su IP ha sido bloqueada temporalmente. Intente nuevamente en 15 minutos.' 
  },
  standardHeaders: true, // Retorna info del límite en headers (RateLimit-*)
  legacyHeaders: false,  // Deshabilita los headers genéricos obsoletos
});

module.exports = {
  strictAuthLimiter
};
