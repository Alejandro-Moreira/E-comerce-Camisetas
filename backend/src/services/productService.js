const productRepository = require('../repositories/productRepository');
const AppError = require('../utils/AppError');

exports.getAllProducts = async () => {
  return await productRepository.findAll();
};

exports.getProductDetails = async (id) => {
  const product = await productRepository.findById(id);
  if (!product) throw new AppError('PRODUCT_NOT_FOUND', 'El producto consultado no existe en inventario', 404);
  return product;
};

exports.createProduct = async (productData, fileProtocolHost, fileData) => {
  const { nombre, descripcion, precio, stock, talla, color } = productData;
  let imagenUrl = null;
  if (fileData) {
    imagenUrl = `${fileProtocolHost}/uploads/${fileData.filename}`;
  }

  const finalPrecio = parseFloat(precio) || 0;
  const finalStock = parseInt(stock) || 0;

  return await productRepository.create(nombre, descripcion, finalPrecio, finalStock, imagenUrl, talla, color);
};

exports.updateProduct = async (id, productData, fileProtocolHost, fileData) => {
  const { nombre, descripcion, precio, stock, talla, color, imagenUrlActual } = productData;
  let imagenUrl = imagenUrlActual || null;
  
  if (fileData) {
    imagenUrl = `${fileProtocolHost}/uploads/${fileData.filename}`;
  }

  const finalPrecio = parseFloat(precio) || 0;
  const finalStock = parseInt(stock) || 0;

  await productRepository.update(id, nombre, descripcion, finalPrecio, finalStock, imagenUrl, talla, color);
  return imagenUrl;
};

exports.deleteProduct = async (id) => {
  await productRepository.delete(id);
};

exports.getRecommendationsForUser = async (userId) => {
  let recommended = [];

  let type = 'global';

  if (userId && userId !== 'null' && userId !== 'undefined') {
    const compras = await productRepository.getUserPurchaseHistoryPrefixes(userId);
    if (compras.length > 0) {
      const palabras = compras.map(c => c.nombre.split(' ')[0].replace(/[^a-zA-Z0-9]/g, ''));
      if (palabras.length > 0) {
        recommended = await productRepository.findSimilarProductsByNames(palabras, userId);
        if (recommended.length > 0) type = 'personalized';
      }
    }
  }

  if (recommended.length === 0) {
    recommended = await productRepository.getTopSellingProductsGlobal();
  }

  return { type, products: recommended };
};
