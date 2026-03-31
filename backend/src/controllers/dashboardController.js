const pool = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    // Total de ingresos (solo pedidos que han sido pagados, enviados o entregados)
    const [ventasRow] = await pool.query('SELECT SUM(total) as total_ventas FROM pedidos WHERE estado IN ("pagado", "enviado", "entregado")');
    const totalVentas = parseFloat(ventasRow[0].total_ventas) || 0;

    // Métricas totales
    const [pedidosRow] = await pool.query('SELECT COUNT(*) as total_pedidos FROM pedidos');
    const totalPedidos = pedidosRow[0].total_pedidos;

    const [clientesRow] = await pool.query('SELECT COUNT(*) as total_clientes FROM usuarios WHERE rol = "cliente"');
    const totalClientes = clientesRow[0].total_clientes;

    const [productosRow] = await pool.query('SELECT COUNT(*) as total_productos FROM productos');
    const totalProductos = productosRow[0].total_productos;

    // Resumen simplificado de últimas 5 ventas para gráfico simple en dashboard
    const [ventasRecientesRow] = await pool.query(`
      SELECT DATE(fecha) as fecha_corta, SUM(total) as diario 
      FROM pedidos 
      WHERE estado IN ("pagado", "enviado", "entregado")
      GROUP BY DATE(fecha) 
      ORDER BY DATE(fecha) DESC 
      LIMIT 7
    `);

    res.json({
      totalVentas,
      totalPedidos,
      totalClientes,
      totalProductos,
      ventasRecientes: ventasRecientesRow.reverse() // Para el Chart.js del Dashboard
    });
  } catch (err) {
    console.error('Error calculando stats dashboard:', err);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
};
