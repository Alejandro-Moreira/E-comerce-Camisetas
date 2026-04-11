const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// La ruta recibe latidos de clicks del frontend.
router.post('/track-click', analyticsController.trackClick);

module.exports = router;
