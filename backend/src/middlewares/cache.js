const CacheService = require('../services/cacheService');

/**
 * Middleware Dinámico de Caché de respuestas HTTP con Namespacing.
 * 
 * @param {string} namespacePrefix - Ej: 'cache:orders'
 * @param {number} ttlSegundos - Tiempo de vida particular del endpoint
 */
const cacheMiddleware = (namespacePrefix = 'cache:global', ttlSegundos = 60) => {
  return async (req, res, next) => {
    // Generación dinámica del namespace base usando URI
    const key = `${namespacePrefix}:path:${req.originalUrl || req.url}`;
    
    try {
      const cachedResponse = await CacheService.getCache(key);
      if (cachedResponse) {
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Namespace', namespacePrefix);
        return res.json(cachedResponse);
      } else {
        res.setHeader('X-Cache', 'MISS');
        res.originalJson = res.json;
        res.json = (body) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            CacheService.setCache(key, body, ttlSegundos);
          }
          res.originalJson(body);
        };
        next();
      }
    } catch(err) {
      next();
    }
  };
};

module.exports = cacheMiddleware;
