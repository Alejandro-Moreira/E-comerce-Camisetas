const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/', cartController.updateQuantity);
router.delete('/', cartController.removeFromCart);
router.post('/sync', cartController.syncCart);

module.exports = router;
