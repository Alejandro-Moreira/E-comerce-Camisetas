const { createClient } = require('redis');
const logger = require('../utils/logger');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('Redis Client Connected'));

// Realizar la conexión de forma asíncrona pero centralizada
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Fallo iniciando Redis. Abortando caché rápida:', error);
  }
})();

module.exports = redisClient;
