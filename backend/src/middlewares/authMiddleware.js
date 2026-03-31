const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verifica que el usuario tenga un token válido
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ error: 'Un token es requerido para la autenticación' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, rol, ... }
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
  
  return next();
};

// Verifica que el usuario tenga rol de 'admin'
const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Requiere rol de Administrador' });
  }
  return next();
};

module.exports = {
  verifyToken,
  verifyAdmin
};
