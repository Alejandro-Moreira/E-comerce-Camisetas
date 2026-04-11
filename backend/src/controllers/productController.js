const productService = require('../services/productService');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const AppError = require('../utils/AppError');

exports.getProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    successResponse(res, products, 'Productos obtenidos');
  } catch (err) {
    if (err instanceof AppError) return errorResponse(res, err.errorCode, err.message, err.statusCode);
    errorResponse(res, 'SERVER_ERROR', 'Error obteniendo productos');
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductDetails(req.params.id);
    successResponse(res, product, 'Producto encontrado');
  } catch (err) {
    if (err instanceof AppError) return errorResponse(res, err.errorCode, err.message, err.statusCode);
    errorResponse(res, 'SERVER_ERROR', 'Error obteniendo producto');
  }
};

exports.createProduct = async (req, res) => {
  try {
    const host = `${req.protocol}://${req.get('host')}`;
    const productId = await productService.createProduct(req.body, host, req.file);
    successResponse(res, { productId }, 'Producto registrado exitosamente', 201);
  } catch (err) {
    if (err instanceof AppError) return errorResponse(res, err.errorCode, err.message, err.statusCode);
    errorResponse(res, 'SERVER_ERROR', 'Error al crear producto');
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const host = `${req.protocol}://${req.get('host')}`;
    const imagenUrl = await productService.updateProduct(req.params.id, req.body, host, req.file);
    successResponse(res, { imagenUrl }, 'Producto actualizado');
  } catch (err) {
    if (err instanceof AppError) return errorResponse(res, err.errorCode, err.message, err.statusCode);
    errorResponse(res, 'SERVER_ERROR', 'Error al actualizar producto');
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    successResponse(res, null, 'Producto eliminado correctamente');
  } catch (err) {
    if (err instanceof AppError) return errorResponse(res, err.errorCode, err.message, err.statusCode);
    errorResponse(res, 'SERVER_ERROR', 'Error al eliminar producto');
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const recommendations = await productService.getRecommendationsForUser(req.params.userId);
    successResponse(res, recommendations, 'Recomendaciones calculadas');
  } catch (err) {
    if (err instanceof AppError) return errorResponse(res, err.errorCode, err.message, err.statusCode);
    errorResponse(res, 'SERVER_ERROR', 'Error en motor de recomendaciones');
  }
};
