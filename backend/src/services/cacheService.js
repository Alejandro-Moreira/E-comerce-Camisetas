const redisClient = require('../config/redis');
const logger = require('../utils/logger');

class CacheService {
  /**
   * Obtiene un registro del cache.
   * @param {string} key Nombre del namespace (e.g. 'cache:orders:global')
   * @returns {Promise<any|null>} Respuesta parseada o null
   */
  static async getCache(key) {
    if (!redisClient.isReady) return null;
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      logger.error(`[CacheService GET] Falló lectura en key ${key}: ${e.message}`);
      return null;
    }
  }

  /**
   * Guarda un dataSet en memoria bajo un namespace específico.
   * @param {string} key Nombre del namespace
   * @param {any} data Array u Objeto
   * @param {number} ttl Segundos
   */
  static async setCache(key, data, ttl = 60) {
    if (!redisClient.isReady) return;
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(data));
    } catch (e) {
      logger.error(`[CacheService SET] Falló escritura en key ${key}: ${e.message}`);
    }
  }

  /**
   * Elimina selectivamente un patrón de llaves previniendo caída global de la memoria.
   * Utiliza el nativo SCAN para prevenir bloqueo I/O de node/redis (A diferencia de KEYS *)
   * @param {string} matchPattern Ej: 'cache:orders:*'
   */
  static async invalidatePattern(matchPattern) {
    if (!redisClient.isReady) return;
    try {
      let cursor = 0;
      do {
        const reply = await redisClient.scan(cursor, { MATCH: matchPattern, COUNT: 100 });
        cursor = reply.cursor;
        const keys = reply.keys;
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
      } while (cursor !== 0);
      logger.info(`[CacheService INVALIDATE] Vaciado el patrón asíncrono: ${matchPattern}`);
    } catch (e) {
      logger.error(`[CacheService] Falló selectiva invalidación para ${matchPattern}: ${e.message}`);
    }
  }
}

module.exports = CacheService;
