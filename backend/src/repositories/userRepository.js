const db = require('../config/db');

exports.findAllUsers = async () => {
  const [rows] = await db.promise().query(`
    SELECT 
      u.id,
      u.nombre,
      u.email,
      u.rol,
      u.verificado,
      u.creado_en,
      COUNT(DISTINCT p.id) AS total_pedidos,
      IFNULL(SUM(p.total), 0) AS gasto_total
    FROM usuarios u
    LEFT JOIN pedidos p ON p.usuario_id = u.id
    GROUP BY u.id
    ORDER BY u.creado_en DESC
  `);
  return rows;
};

exports.updateRole = async (id, rol) => {
  await db.promise().query(`UPDATE usuarios SET rol = ? WHERE id = ?`, [rol, id]);
};
