const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { errorResponse } = require('../utils/responseHandler');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Loggear con Pino para observabilidad
  logger.error(err, `Error capturado en ${req.method} ${req.originalUrl}`);

  // Si proviene de nuestra clase custom
  if (err instanceof AppError) {
    return errorResponse(res, err.errorCode || 'ERROR_OPERACION', err.message, err.statusCode);
  }

  // Si es un error desconocido o interno (BD crash, null pointers)
  const isProd = process.env.NODE_ENV === 'production';
  const finalMsg = isProd ? 'Error interno de servidor controlado' : err.message;
  
  // Alerting System Simulacion: Trigger PagerDuty/Slack notification for unhandled 500
  logger.fatal(`[CRITICAL ALERT] 🚨 Disparando Alerta SRE para caída de servicio en ${req.originalUrl}. Causa detectada: ${err.message}`);

  return res.status(500).json({
    success: false,
    errorCode: 'SERVER_ERROR',
    message: finalMsg,
    ...(isProd ? {} : { stack: err.stack }) // Ocultamos el StackTrace en Producción
  });
};

module.exports = errorHandler;
