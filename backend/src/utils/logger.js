const pino = require('pino');

const isProduction = process.env.NODE_ENV === 'production';

// Pino estructurado: rápido y formato JSON automático para ingestar en Elasticsearch/Datadog
const logger = pino({
  level: process.env.LOG_LEVEL || 'info', // 'info', 'warn', 'error', 'debug'
  transport: !isProduction 
    ? {
        // Pretty print solo en local/dev
        target: 'pino-pretty',
        options: {
          ignore: 'pid,hostname', // limpia salida
          translateTime: 'SYS:standard'
        }
      }
    : undefined // En prod será JSON crudo ultra-rápido a stdout
});

module.exports = logger;
