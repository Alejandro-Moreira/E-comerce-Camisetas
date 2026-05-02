const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

exports.getFavorites = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT producto_id FROM favoritos WHERE usuario_id = ?', [req.user.id]);
    const favoriteIds = rows.map(r => r.producto_id);
    successResponse(res, favoriteIds, 'Favoritos obtenidos');
  } catch (error) {
    errorResponse(res, 'SERVER_ERROR', 'Error al obtener favoritos');
  }
};

exports.toggleFavorite = async (req, res) => {
  const { productoId } = req.body;
  const usuarioId = req.user.id;
  try {
    const [existing] = await pool.query('SELECT * FROM favoritos WHERE usuario_id = ? AND producto_id = ?', [usuarioId, productoId]);
    if (existing.length > 0) {
      await pool.query('DELETE FROM favoritos WHERE usuario_id = ? AND producto_id = ?', [usuarioId, productoId]);
      successResponse(res, { isFavorite: false }, 'Eliminado de favoritos');
    } else {
      await pool.query('INSERT INTO favoritos (usuario_id, producto_id) VALUES (?, ?)', [usuarioId, productoId]);
      successResponse(res, { isFavorite: true }, 'Añadido a favoritos');
    }
  } catch (error) {
    errorResponse(res, 'SERVER_ERROR', 'Error al procesar favorito');
  }
};

exports.syncFavorites = async (req, res) => {
  const { localFavorites } = req.body;
  const usuarioId = req.user.id;
  try {
    if (localFavorites && Array.isArray(localFavorites) && localFavorites.length > 0) {
      const values = localFavorites.map(id => [usuarioId, id]);
      await pool.query('INSERT IGNORE INTO favoritos (usuario_id, producto_id) VALUES ?', [values]);
    }
    const [rows] = await pool.query('SELECT producto_id FROM favoritos WHERE usuario_id = ?', [usuarioId]);
    const favoriteIds = rows.map(r => r.producto_id);
    successResponse(res, favoriteIds, 'Favoritos sincronizados');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'SERVER_ERROR', 'Error al sincronizar favoritos');
  }
};
