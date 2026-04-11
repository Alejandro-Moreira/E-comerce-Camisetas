const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseHandler');
const logger = require('../utils/logger');
require('dotenv').config();

const logSecurityEvent = (msg, ip, additionalData = {}) => {
  logger.warn({ ip, ...additionalData }, `[SECURITY] ${msg}`);
};

// Verifica que el usuario tenga un token válido
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logSecurityEvent('Intento de acceso denegado (Missing/Bad Token format)', req.ip);
    return errorResponse(res, 'MISSING_TOKEN', 'Un token es requerido para la autenticación', 403);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, rol, ... }
  } catch (err) {
    logSecurityEvent('Carga útil alterada (JWT Signature Failed)', req.ip);
    return errorResponse(res, 'INVALID_TOKEN', 'Token inválido o manipulado', 401);
  }
  
  return next();
};

// Control Jerárquico de Nivel Enterprise
const roleHierarchy = {
  admin: 3,
  operador: 2,
  cliente: 1
};

/**
 * Validates Minimum Hierarchical Role
 * @param {string} requiredRole - Rol mínimo permitido para acceder (ej: 'operador')
 */
const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || !req.user.rol) {
      logSecurityEvent(`Acceso fallido: Sin Rol o Sin Autenticar. IP: ${req.ip}`);
      return errorResponse(res, 'UNAUTHORIZED', 'No hay sesión de usuario válida', 401);
    }
    
    const userRoleValue = roleHierarchy[req.user.rol] || 0;
    const requiredRoleValue = roleHierarchy[requiredRole] || Infinity;
    
    if (userRoleValue < requiredRoleValue) {
      logSecurityEvent(`Acceso de Seguridad Denegado. Rol Actual: [${req.user.rol}] | Requerido Mínimo: [${requiredRole}]`);
      // Standard HTTP 403 Structure requirement parameter fulfillment
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errorCode: "FORBIDDEN_HIERARCHY"
      });
    }
    
    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRole
};
