const pool = require('../config/db');

// Obtener todos los productos
exports.getProducts = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos ORDER BY creado_en DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo productos' });
  }
};

// Obtener un producto
exports.getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo producto' });
  }
};

// Crear producto con Multer (FormData)
exports.createProduct = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, talla, color } = req.body;
    let imagenUrl = null;

    if (req.file) {
       // Construir ruta pública de la imagen
       imagenUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // FormData envía los valores como string siempre. Aquí los convertimos:
    const finalPrecio = parseFloat(precio) || 0;
    const finalStock = parseInt(stock) || 0;

    const [result] = await pool.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock, imagen, talla, color) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre, descripcion, finalPrecio, finalStock, imagenUrl, talla, color]
    );
    res.status(201).json({ message: 'Producto registrado exitosamente', productId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fallo guardando en base de datos el producto creado' });
  }
};

// Actualizar producto y reemplazar imagen existente si se manda otra
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, talla, color } = req.body;

    let imagenUrl = req.body.imagenUrlActual || null; // Frontend inyecta la vieja si no hay cambios

    if (req.file) {
       // Subió una foto nueva, la machacamos:
       imagenUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const finalPrecio = parseFloat(precio) || 0;
    const finalStock = parseInt(stock) || 0;

    await pool.query(
      'UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=?, imagen=?, talla=?, color=? WHERE id=?',
      [nombre, descripcion, finalPrecio, finalStock, imagenUrl, talla, color, id]
    );
    res.json({ message: 'Detalles del producto actualizados correctamente', imagenUrl });
    } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error BD: ' + err.message });
  }
};

// Eliminar producto
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM productos WHERE id=?', [id]);
    res.json({ message: 'Producto borrado del catálogo permanente' });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando producto' });
  }
};
