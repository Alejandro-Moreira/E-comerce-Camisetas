const pool = require('../config/db');
const { successResponse } = require('../utils/responseHandler');

exports.getMetrics = async (req, res, next) => {
  try {
    // Total de usuarios
    const [usuariosRows] = await pool.query('SELECT COUNT(*) as total FROM usuarios');
    const totalUsuarios = usuariosRows[0].total;

    // Total de pedidos
    const [pedidosRows] = await pool.query('SELECT COUNT(*) as total FROM pedidos');
    const totalPedidos = pedidosRows[0].total;

    // Pedidos por día (Últimos 7 días)
    const [graficaRows] = await pool.query(`
      SELECT DATE(fecha) as fecha, COUNT(*) as cantidad 
      FROM pedidos 
      WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(fecha)
      ORDER BY fecha ASC
    `);

    return successResponse(res, {
      totalUsuarios,
      totalPedidos,
      pedidosUltimos7Dias: graficaRows
    }, 'Métricas de negocio recuperadas');
  } catch (error) {
    next(error); // Delega al Global Error Handler centralizado
  }
};

exports.getSystemInfo = async (req, res, next) => {
  try {
    // Prueba de la DB
    await pool.query('SELECT 1');
    const dbStatus = 'connected';

    const memoryInfo = process.memoryUsage();
    
    return successResponse(res, {
      uptimeSeconds: process.uptime(),
      memoryRssMB: (memoryInfo.rss / 1024 / 1024).toFixed(2),
      memoryHeapMB: (memoryInfo.heapUsed / 1024 / 1024).toFixed(2),
      dbStatus,
      status: 'OPERATIONAL'
    }, 'Telemetría de Hardware e Infraestructura');
  } catch (error) {
    // Si la DB falla, pasamos un next y el errorHandler devolverá 500
    next(error);
  }
};
