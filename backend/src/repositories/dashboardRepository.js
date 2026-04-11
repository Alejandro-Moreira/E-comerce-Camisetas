const pool = require('../config/db');

exports.getTotalSalesAndOrders = async () => {
  const [ventasRow] = await pool.query('SELECT SUM(total) as total_ventas, COUNT(*) as total_pedidos FROM pedidos WHERE estado IN ("pagado", "enviado", "entregado")');
  return ventasRow[0];
};

exports.getTotalCustomers = async () => {
  const [clientesRow] = await pool.query('SELECT COUNT(*) as total_clientes FROM usuarios WHERE rol = "cliente" AND verificado = 1');
  return clientesRow[0].total_clientes;
};

exports.getTotalProducts = async () => {
  const [productosRow] = await pool.query('SELECT COUNT(*) as total_productos FROM productos');
  return productosRow[0].total_productos;
};

exports.getRecentSales = async () => {
  const [ventasRecientesRow] = await pool.query(`
    SELECT DATE(fecha) as fecha_corta, SUM(total) as diario 
    FROM pedidos 
    WHERE estado IN ("pagado", "enviado", "entregado")
    GROUP BY DATE(fecha) 
    ORDER BY DATE(fecha) DESC 
    LIMIT 7
  `);
  return ventasRecientesRow;
};

exports.getTopProducts = async () => {
  const [topProductsRow] = await pool.query(`
    SELECT p.nombre as name, SUM(dp.cantidad) as ventas 
    FROM detalle_pedido dp 
    JOIN productos p ON dp.producto_id = p.id 
    GROUP BY dp.producto_id 
    ORDER BY ventas DESC 
    LIMIT 5
  `);
  return topProductsRow;
};
