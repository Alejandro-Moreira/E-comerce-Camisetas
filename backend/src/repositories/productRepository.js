const pool = require('../config/db');

exports.findAll = async () => {
  const [rows] = await pool.query('SELECT * FROM productos ORDER BY creado_en DESC');
  return rows;
};

exports.findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
  return rows[0];
};

exports.create = async (nombre, descripcion, precio, stock, imagenUrl, talla, color) => {
  const [result] = await pool.query(
    'INSERT INTO productos (nombre, descripcion, precio, stock, imagen, talla, color) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [nombre, descripcion, precio, stock, imagenUrl, talla, color]
  );
  return result.insertId;
};

exports.update = async (id, nombre, descripcion, precio, stock, imagenUrl, talla, color) => {
  await pool.query(
    'UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=?, imagen=?, talla=?, color=? WHERE id=?',
    [nombre, descripcion, precio, stock, imagenUrl, talla, color, id]
  );
};

exports.delete = async (id) => {
  await pool.query('DELETE FROM productos WHERE id=?', [id]);
};

// RECOMMENDATION ENGINE REPOSITORY LOGIC
exports.getUserPurchaseHistoryPrefixes = async (userId) => {
  const [compras] = await pool.query(`
    SELECT p.nombre 
    FROM detalle_pedido dp 
    JOIN pedidos ord ON dp.pedido_id = ord.id 
    JOIN productos p ON dp.producto_id = p.id 
    WHERE ord.usuario_id = ?
  `, [userId]);
  return compras;
};

exports.findSimilarProductsByNames = async (namePatterns, excludeUserId) => {
  const queries = namePatterns.map(p => `p.nombre LIKE '%${p}%'`).join(' OR ');
  
  let query = `SELECT p.* FROM productos p WHERE (${queries})`;
  const params = [];
  
  if (excludeUserId) {
    query += ` AND p.id NOT IN (
      SELECT dp.producto_id 
      FROM detalle_pedido dp 
      JOIN pedidos ord ON dp.pedido_id = ord.id 
      WHERE ord.usuario_id = ?
    )`;
    params.push(excludeUserId);
  }
  
  query += ` LIMIT 4`;
  const [similares] = await pool.query(query, params);
  return similares;
};

exports.getTopSellingProductsGlobal = async () => {
  const [topSeller] = await pool.query(`
    SELECT p.*, COALESCE(SUM(dp.cantidad), 0) as score 
    FROM productos p 
    LEFT JOIN detalle_pedido dp ON p.id = dp.producto_id 
    GROUP BY p.id 
    ORDER BY score DESC 
    LIMIT 4
  `);
  return topSeller;
};
