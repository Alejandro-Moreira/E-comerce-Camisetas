const orderService = require('../services/orderService');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const AppError = require('../utils/AppError');
const redisClient = require('../config/redis');
const logger = require('../utils/logger');

const CacheService = require('../services/cacheService');

// Función interna para barrer namespaces de pedidos y stats
const invalidateOrdersCache = async () => {
  await CacheService.invalidatePattern('cache:orders:*');
  await CacheService.invalidatePattern('cache:dashboard:*');
};

exports.createOrder = async (req, res) => {
  try {
    const { items, total, direccion, ciudad, pais } = req.body;
    const result = await orderService.processOrder(req.user.id, items, total, direccion, ciudad, pais);
    await invalidateOrdersCache();
    
    // Notificación en Tiempo Real vía Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to('admins').emit('NEW_ORDER', {
        id: result.pedido_id || 'N/A',
        total: total,
        estado: 'pendiente'
      });
    }

    successResponse(res, result, 'Pedido inicializado', 201);
  } catch (err) {
    if (err instanceof AppError) return errorResponse(res, err.errorCode, err.message, err.statusCode);
    errorResponse(res, 'SERVER_ERROR', 'Fallo al asentar la logística');
  }
};

exports.confirmOrderPayment = async (req, res) => {
  try {
    await orderService.confirmPayment(req.params.id);
    await invalidateOrdersCache();
    successResponse(res, null, 'Pago confirmado y pedido actualizado');
  } catch (err) {
    if (err instanceof AppError) return errorResponse(res, err.errorCode, err.message, err.statusCode);
    errorResponse(res, 'SERVER_ERROR', 'Error confirmando pedido');
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getUserOrders(req.user.id);
    successResponse(res, orders, 'Historial obtenido');
  } catch (err) {
    if (err instanceof AppError) return errorResponse(res, err.errorCode, err.message, err.statusCode);
    errorResponse(res, 'SERVER_ERROR', 'Error obteniendo historial');
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    successResponse(res, orders, 'Pedidos globales obtenidos');
  } catch (err) {
    if (err instanceof AppError) return errorResponse(res, err.errorCode, err.message, err.statusCode);
    errorResponse(res, 'SERVER_ERROR', 'Error obteniendo pedidos');
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { estado } = req.body;
    await orderService.updateStatus(req.params.id, estado);
    await invalidateOrdersCache();
    
    // Trace action securely in Audit framework
    const { logAudit } = require('../utils/auditLogger');
    await logAudit({
      userId: req.user.id,
      action: 'UPDATE_ORDER_STATUS',
      entity: 'ORDER',
      entityId: req.params.id,
      metadata: { new_status: estado },
      ip: req.ip
    });

    successResponse(res, null, 'Estado actualizado exitosamente');
  } catch (err) {
    if (err instanceof AppError) return errorResponse(res, err.errorCode, err.message, err.statusCode);
    errorResponse(res, 'SERVER_ERROR', 'Error actualizando estado');
  }
};
