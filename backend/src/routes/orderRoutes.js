const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

// Rutas para Usuarios
router.get('/my-orders', verifyToken, orderController.getMyOrders);
router.post('/create', verifyToken, orderController.createOrder); // Crea orden y paymentIntent
router.put('/:id/confirm', verifyToken, orderController.confirmOrderPayment);

// Rutas para Administradores
router.get('/', verifyToken, verifyAdmin, orderController.getAllOrders);
router.put('/:id/status', verifyToken, verifyAdmin, orderController.updateOrderStatus);

module.exports = router;
