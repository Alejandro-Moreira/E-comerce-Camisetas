const pool = require('../config/db');

exports.saveClick = async (userId, page, x, y, timestamp) => {
  const [result] = await pool.query(
    'INSERT INTO user_clicks (usuario_id, page, x, y, timestamp) VALUES (?, ?, ?, ?, ?)',
    [userId, page, x, y, timestamp]
  );
  return result.insertId;
};

exports.deleteOlderThan = async (days) => {
  const [result] = await pool.query(
    'DELETE FROM user_clicks WHERE creado_en < NOW() - INTERVAL ? DAY',
    [days]
  );
  return result.affectedRows;
};
