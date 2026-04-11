const dashboardService = require('../services/dashboardService');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const AppError = require('../utils/AppError');

exports.getStats = async (req, res) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    successResponse(res, stats, 'Estadísticas obtenidas correctamente', 200);
  } catch (err) {
    console.error('[DASHBOARD ERROR]:', err.message);
    if (err instanceof AppError) return errorResponse(res, err.errorCode, err.message, err.statusCode);
    errorResponse(res, 'STATS_FETCH_ERROR', 'Error al obtener estadísticas del dashboard', 500);
  }
};

exports.getPaginatedOrders = async (req, res, next) => {
  try {
    const pool = require('../config/db'); // Require direct to pool if not in service
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const offset = (page - 1) * limit;
    
    // Filtros dinámicos
    const estadoStr = req.query.estado || '';
    const searchStr = req.query.search || '';

    let whereClause = 'WHERE 1=1';
    let queryParamsCount = [];
    let queryParamsData = [];

    if (estadoStr) {
      whereClause += ' AND p.estado = ?';
      queryParamsCount.push(estadoStr);
      queryParamsData.push(estadoStr);
    }
    if (searchStr) {
      whereClause += ' AND u.email LIKE ?';
      const likeStr = `%${searchStr}%`;
      queryParamsCount.push(likeStr);
      queryParamsData.push(likeStr);
    }

    // Obtener total filtrado
    const countQuery = `
      SELECT COUNT(p.id) as total 
      FROM pedidos p 
      LEFT JOIN usuarios u ON p.usuario_id = u.id 
      ${whereClause}
    `;
    const [countRows] = await pool.query(countQuery, queryParamsCount);
    const total = countRows[0].total;

    // Obtener paginados usando JOINs para traer el email del usuario
    const dataQuery = `
      SELECT p.id, p.fecha, p.total, p.estado, u.email as cliente 
      FROM pedidos p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      ${whereClause}
      ORDER BY p.fecha DESC
      LIMIT ? OFFSET ?
    `;
    
    queryParamsData.push(limit, offset);
    const [orders] = await pool.query(dataQuery, queryParamsData);

    return successResponse(res, {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }, 'Pedidos recuperados exitosamente');
  } catch (error) {
    next(error);
  }
};
