const { Queue } = require('bullmq');
const redisClient = require('../config/redis');

const connection = {
  host: process.env.DB_HOST || '127.0.0.1', 
  port: 6379
};

const sysQueue = new Queue('SysTasksQueue', { connection });
const dlqQueue = new Queue('DeadLetterTasksQueue', { connection });

// Función para encolar un proceso asíncrono
const enqueueJob = async (jobName, payload, options = {}) => {
  return await sysQueue.add(jobName, payload, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
    ...options
  });
};

module.exports = {
  sysQueue,
  dlqQueue,
  enqueueJob,
  connection
};
