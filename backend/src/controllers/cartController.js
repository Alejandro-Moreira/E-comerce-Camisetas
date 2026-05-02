const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHandler');

exports.getCart = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id as cart_item_id, c.producto_id as id, c.cantidad, c.talla,
             p.nombre, p.precio, p.imagen, p.stock
      FROM carrito c
      JOIN productos p ON c.producto_id = p.id
      WHERE c.usuario_id = ?
    `, [req.user.id]);
    
    // Formateamos para que coincida con el formato del frontend (precio como número, cantidad como quantity)
    const cartItems = rows.map(r => ({
      ...r,
      precio: parseFloat(r.precio),
      quantity: r.cantidad
    }));

    successResponse(res, cartItems, 'Carrito obtenido');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'SERVER_ERROR', 'Error al obtener carrito');
  }
};

exports.addToCart = async (req, res) => {
  const { productoId, cantidad, talla } = req.body;
  const usuarioId = req.user.id;
  try {
    const [existing] = await pool.query('SELECT id, cantidad FROM carrito WHERE usuario_id = ? AND producto_id = ? AND talla = ?', [usuarioId, productoId, talla]);
    
    if (existing.length > 0) {
      await pool.query('UPDATE carrito SET cantidad = cantidad + ? WHERE id = ?', [cantidad, existing[0].id]);
    } else {
      await pool.query('INSERT INTO carrito (usuario_id, producto_id, cantidad, talla) VALUES (?, ?, ?, ?)', [usuarioId, productoId, cantidad, talla]);
    }
    
    successResponse(res, null, 'Producto añadido al carrito');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'SERVER_ERROR', 'Error al añadir al carrito');
  }
};

exports.updateQuantity = async (req, res) => {
  const { productoId, talla, cantidad } = req.body;
  const usuarioId = req.user.id;
  try {
    if (cantidad <= 0) {
      await pool.query('DELETE FROM carrito WHERE usuario_id = ? AND producto_id = ? AND talla = ?', [usuarioId, productoId, talla]);
    } else {
      await pool.query('UPDATE carrito SET cantidad = ? WHERE usuario_id = ? AND producto_id = ? AND talla = ?', [cantidad, usuarioId, productoId, talla]);
    }
    successResponse(res, null, 'Cantidad actualizada');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'SERVER_ERROR', 'Error al actualizar cantidad');
  }
};

exports.removeFromCart = async (req, res) => {
  const { productoId, talla } = req.body;
  const usuarioId = req.user.id;
  try {
    await pool.query('DELETE FROM carrito WHERE usuario_id = ? AND producto_id = ? AND talla = ?', [usuarioId, productoId, talla]);
    successResponse(res, null, 'Producto eliminado del carrito');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'SERVER_ERROR', 'Error al eliminar del carrito');
  }
};

exports.syncCart = async (req, res) => {
  const { localCart } = req.body;
  const usuarioId = req.user.id;
  try {
    if (localCart && Array.isArray(localCart) && localCart.length > 0) {
      for (const item of localCart) {
        const talla = item.tallaEscogida || item.talla || 'Única';
        const cantidad = item.quantity || 1;
        
        const [existing] = await pool.query('SELECT id FROM carrito WHERE usuario_id = ? AND producto_id = ? AND talla = ?', [usuarioId, item.id, talla]);
        if (existing.length > 0) {
          await pool.query('UPDATE carrito SET cantidad = cantidad + ? WHERE id = ?', [cantidad, existing[0].id]);
        } else {
          await pool.query('INSERT INTO carrito (usuario_id, producto_id, cantidad, talla) VALUES (?, ?, ?, ?)', [usuarioId, item.id, cantidad, talla]);
        }
      }
    }
    
    const [rows] = await pool.query(`
      SELECT c.id as cart_item_id, c.producto_id as id, c.cantidad, c.talla,
             p.nombre, p.precio, p.imagen, p.stock
      FROM carrito c
      JOIN productos p ON c.producto_id = p.id
      WHERE c.usuario_id = ?
    `, [usuarioId]);
    
    const cartItems = rows.map(r => ({
      ...r,
      precio: parseFloat(r.precio),
      quantity: r.cantidad,
      tallaEscogida: r.talla
    }));

    successResponse(res, cartItems, 'Carrito sincronizado');
  } catch (error) {
    console.error(error);
    errorResponse(res, 'SERVER_ERROR', 'Error al sincronizar carrito');
  }
};
