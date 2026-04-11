const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Rutas Públicas (Los clientes las ven)
router.get('/recommendations/:userId', productController.getRecommendations);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Rutas Protegidas (Sólo el admin interactúa con el inventario)
// Habilitamos `.single('imagen')` para interceptar la imagen
router.post('/', verifyToken, authorizeRole('admin'), upload.single('imagen'), productController.createProduct);

// En PUT también lo permitimos para cuando actualiza la foto
router.put('/:id', verifyToken, authorizeRole('admin'), upload.single('imagen'), productController.updateProduct);

router.delete('/:id', verifyToken, authorizeRole('admin'), productController.deleteProduct);

module.exports = router;
