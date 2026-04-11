const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');
const cacheMiddleware = require('../middlewares/cache');

router.get('/stats', verifyToken, authorizeRole('admin'), cacheMiddleware('cache:dashboard:stats', 30), dashboardController.getStats);
router.get('/orders', verifyToken, authorizeRole('admin'), cacheMiddleware('cache:orders:paginated', 30), dashboardController.getPaginatedOrders);

module.exports = router;
