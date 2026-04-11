const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, authorizeRole('admin'), userController.getAllUsers);
router.put('/:id/rol', verifyToken, authorizeRole('admin'), userController.updateUserRole);

module.exports = router;
