const pool = require('../config/db');
const { logAudit } = require('../utils/auditLogger');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const AppError = require('../utils/AppError');
const CacheService = require('../services/cacheService');

// Invalidación general de namespace para revisiones de producto
const invalidateReviewCache = async (productId) => {
  await CacheService.invalidatePattern(`cache:reviews:product:${productId}`);
  await CacheService.invalidatePattern(`cache:reviews:summary:${productId}`);
};

exports.upsertReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!productId || rating === undefined) {
      throw new AppError('INVALID_INPUT', 'product_id y rating son requeridos', 400);
    }
    
    if (rating < 1 || rating > 5) {
      throw new AppError('INVALID_RATING', 'El rating debe estar entre 1 y 5', 400);
    }

    // Usamos INSERT ... ON DUPLICATE KEY UPDATE para evadir redundancia nativamente
    const query = `
      INSERT INTO product_reviews (product_id, usuario_id, rating, comment)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      rating = VALUES(rating), 
      comment = VALUES(comment), 
      actualizado_en = CURRENT_TIMESTAMP
    `;
    
    await pool.execute(query, [productId, userId, rating, comment || null]);
    
    // Anclaje al framework SRE de Auditoría
    await logAudit({
      userId: userId,
      action: 'UPSERT_REVIEW',
      entity: 'PRODUCT_REVIEW',
      entityId: productId,
      metadata: { rating },
      ip: req.ip
    });

    await invalidateReviewCache(productId);

    successResponse(res, null, 'Reseña enviada exitosamente', 201);
  } catch(err) {
    if (err instanceof AppError) return errorResponse(res, err.errorCode, err.message, err.statusCode);
    errorResponse(res, 'SERVER_ERROR', 'Error salvaguardando la reseña', 500);
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [rows] = await pool.execute(`
      SELECT r.id, r.rating, r.comment, r.creado_en as createdAt, u.nombre as userName
      FROM product_reviews r
      INNER JOIN usuarios u ON r.usuario_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.creado_en DESC
      LIMIT ? OFFSET ?
    `, [productId, limit.toString(), offset.toString()]); // Pasamos strings para no confundir a mysql2
    
    const [[{ total }]] = await pool.execute('SELECT COUNT(*) as total FROM product_reviews WHERE product_id = ?', [productId]);

    successResponse(res, {
      data: rows,
      meta: {
        total: Number(total),
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }, 'Reseñas indexadas recuperadas');
  } catch(err) {
    errorResponse(res, 'SERVER_ERROR', 'Error recuperando reseñas', 500);
  }
};

exports.getReviewSummary = async (req, res) => {
  try {
    const { productId } = req.params;

    // Ejecutamos agrupación bruta en BD aislando impacto de memoria
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        IFNULL(AVG(rating), 0) as average,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as \`5\`,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as \`4\`,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as \`3\`,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as \`2\`,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as \`1\`
      FROM product_reviews
      WHERE product_id = ?
    `, [productId]);

    const row = stats[0];
    
    const summary = {
      average: Number(parseFloat(row.average).toFixed(1)),
      total: Number(row.total),
      distribution: {
        5: Number(row['5']),
        4: Number(row['4']),
        3: Number(row['3']),
        2: Number(row['2']),
        1: Number(row['1'])
      }
    };

    successResponse(res, summary, 'Distribución matemática exitosa');
  } catch(err) {
    errorResponse(res, 'SERVER_ERROR', 'Fallo generando el bloque sumario estadístico', 500);
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params; // ID iteracion
    
    // Recuperamos base metadata para el cache flush
    const [rows] = await pool.execute('SELECT product_id FROM product_reviews WHERE id = ?', [id]);
    if (rows.length === 0) throw new AppError('NOT_FOUND', 'Reseña inexistente', 404);
    
    const productId = rows[0].product_id;

    await pool.execute('DELETE FROM product_reviews WHERE id = ?', [id]);
    
    await logAudit({
      userId: req.user.id,
      action: 'DELETE_REVIEW_MODERATION',
      entity: 'PRODUCT_REVIEW',
      entityId: id,
      ip: req.ip
    });

    await invalidateReviewCache(productId);
    
    successResponse(res, null, 'Reseña exterminada por la moderación');
  } catch (err) {
    if (err instanceof AppError) return errorResponse(res, err.errorCode, err.message, err.statusCode);
    errorResponse(res, 'SERVER_ERROR', 'Error exterminando revisión');
  }
};
