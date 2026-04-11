const pool = require('../config/db');

exports.createPedido = async (usuario_id, total, direccion, ciudad, pais) => {
  const [result] = await pool.query(
    'INSERT INTO pedidos (usuario_id, total, estado, direccion, ciudad, pais) VALUES (?, ?, ?, ?, ?, ?)',
    [usuario_id, total, 'pendiente', direccion, ciudad, pais || 'Ecuador']
  );
  return result.insertId;
};

exports.insertDetalles = async (values) => {
  await pool.query(
    'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio, talla) VALUES ?',
    [values]
  );
};

exports.updateEstado = async (id, estado) => {
  await pool.query("UPDATE pedidos SET estado = ? WHERE id = ?", [estado, id]);
};

exports.findByUserId = async (usuario_id) => {
  const [rows] = await pool.query('SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY fecha DESC', [usuario_id]);
  return rows;
};

exports.findAll = async () => {
  const [rows] = await pool.query(`
    SELECT p.*, u.nombre as cliente_nombre, u.email as cliente_email
    FROM pedidos p 
    JOIN usuarios u ON p.usuario_id = u.id 
    ORDER BY p.fecha DESC
  `);
  return rows;
};
