const analyticsService = require('../services/analyticsService');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const AppError = require('../utils/AppError');

exports.trackClick = async (req, res) => {
  try {
    const { userId, page, x, y, timestamp } = req.body;
    await analyticsService.trackClick(userId, page, x, y, timestamp);

    successResponse(res, { status: 'tracked' }, 'Telemetría guardada exitosamente', 200);
  } catch (err) {
    console.error('[ANALYTICS ERROR]', err.message);
    if (err instanceof AppError) return errorResponse(res, err.errorCode, err.message, err.statusCode);
    errorResponse(res, 'TRACK_ERROR', 'No se pudo guardar la telemetría', 500);
  }
};
