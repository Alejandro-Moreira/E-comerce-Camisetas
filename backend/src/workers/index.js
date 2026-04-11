const { Worker } = require('bullmq');
const { connection, dlqQueue } = require('./queue');
const logger = require('../utils/logger');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const sysWorker = new Worker('SysTasksQueue', async (job) => {
  logger.info(`[Worker] Inicializando Job ID: ${job.id} [${job.name}]`);

  switch (job.name) {
    case 'SEND_WELCOME_EMAIL':
      logger.info(`[Worker] Enviando correo asíncrono a: ${job.data.email}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      break;

    case 'RUN_DB_BACKUP':
      logger.info('[Worker] Executando volcado asíncrono...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      break;

    case 'FAULTY_JOB':
      throw new Error('Forced Fatal Execution Error');

    default:
      logger.warn(`[Worker] Job Name no reconocido: ${job.name}`);
  }

  return { success: true, processedAt: new Date() };
}, { connection });

sysWorker.on('completed', (job) => {
  logger.info(`[Worker] Job ${job.id} origin ${job.name} ha completado exitosamente!`);
});

sysWorker.on('failed', async (job, err) => {
  logger.error(`[Worker] Job ${job.id} falló por completo: ${err.message}`);
  // Dead Letter Queueing after max retries
  if (job.attemptsMade >= job.opts.attempts) {
    logger.warn(`[Worker DLQ Switch] Job ${job.id} enviado al Purgatorio (DLQ).`);
    await dlqQueue.add(`DLQ_${job.name}`, {
      originalData: job.data,
      failReason: err.message,
      failedAt: new Date()
    });
  }
});

module.exports = sysWorker;
