const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');
const cacheMiddleware = require('../middlewares/cache');

// Se protegen las rutas detrás de Auth y RBAC (Nivel Senior)
router.get('/metrics', verifyToken, authorizeRole('admin'), cacheMiddleware('cache:metrics:global', 60), monitoringController.getMetrics);
router.get('/system-info', verifyToken, authorizeRole('admin'), cacheMiddleware('cache:metrics:system', 20), monitoringController.getSystemInfo);

module.exports = router;
