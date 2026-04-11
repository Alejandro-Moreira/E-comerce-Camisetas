/**
 * Envía una respuesta estandarizada de éxito.
 * @param {Object} res - Express response object
 * @param {any} data - Carga útil de datos
 * @param {string} message - Mensaje claro para el usuario
 * @param {number} statusCode - Código HTTP, por defecto 200
 */
const successResponse = (res, data, message = 'Operación realizada correctamente', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Envía una respuesta estandarizada de error.
 * @param {Object} res - Express response object
 * @param {string} errorCode - Código estandarizado de error (ej: INVALID_CREDENTIALS)
 * @param {string} message - Mensaje claro indicando la anomalía
 * @param {number} statusCode - Código HTTP, por defecto 500
 */
const errorResponse = (res, errorCode, message, statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    message,
    errorCode 
  });
};

module.exports = {
  successResponse,
  errorResponse
};
