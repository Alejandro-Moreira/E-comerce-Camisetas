const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/', favoritesController.getFavorites);
router.post('/toggle', favoritesController.toggleFavorite);
router.post('/sync', favoritesController.syncFavorites);

module.exports = router;
