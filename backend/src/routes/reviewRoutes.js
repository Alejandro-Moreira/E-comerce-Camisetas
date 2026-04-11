const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');
const cacheMiddleware = require('../middlewares/cache');

// Rutas Públicas (Los clientes las ven y se apoyan en el caché)
// Caching de 5 minutos, se invalidan auto cuando alguien postea
router.get('/:productId', cacheMiddleware('cache:reviews:product', 300), reviewController.getProductReviews);
router.get('/summary/:productId', cacheMiddleware('cache:reviews:summary', 300), reviewController.getReviewSummary);

// Rutas Protegidas (Clientes emiten Reseñas)
router.post('/', verifyToken, authorizeRole('cliente'), reviewController.upsertReview);

// Moderación exclusiva para Admin
router.delete('/:id', verifyToken, authorizeRole('admin'), reviewController.deleteReview);

module.exports = router;
