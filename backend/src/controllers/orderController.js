const pool = require('../config/db');
// Configuramos stripe una vez cargadas las variables en server/app.js o localmente si ya están:
let stripe;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') && !process.env.STRIPE_SECRET_KEY.includes('reemplazar')) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// Crear un pedido y un Payment Intent para Stripe
exports.createOrder = async (req, res) => {
  try {
    const { items, total, direccion, ciudad, pais } = req.body;
    const usuario_id = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    // Insertar pedido pendiente con Detalles de Envío
    const [result] = await pool.query(
      'INSERT INTO pedidos (usuario_id, total, estado, direccion, ciudad, pais) VALUES (?, ?, ?, ?, ?, ?)',
      [usuario_id, total, 'pendiente', direccion, ciudad, pais || 'Ecuador']
    );
    const pedido_id = result.insertId;

    // Insertar detalle iterando incluyendo Talla Seleccionada
    const values = items.map(item => [pedido_id, item.id, item.cantidad, item.precio, item.talla || 'N/A']);
    await pool.query(
      'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio, talla) VALUES ?',
      [values]
    );

    // Integración Stripe
    if (stripe) {
      const amountInCents = Math.round(Number(total) * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata: { pedido_id: pedido_id.toString(), usuario_id: usuario_id.toString() }
      });

      return res.json({
        clientSecret: paymentIntent.client_secret,
        pedido_id
      });
    }

    res.status(201).json({ message: 'Pedido creado logísticamente', pedido_id });

  } catch (err) {
    console.error('Error al crear orden:', err);
    res.status(500).json({ error: 'Fallo al asentar la logística' });
  }
};

// Confirmar pago (Llamado tras éxito de Stripe)
exports.confirmOrderPayment = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE pedidos SET estado = 'pagado' WHERE id = ?", [id]);
    res.json({ message: 'Pago confirmado y pedido actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error confirmando pedido' });
  }
};

// Obtener pedidos del cliente para su "Historial"
exports.getMyOrders = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const [rows] = await pool.query('SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY fecha DESC', [usuario_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo historial' });
  }
};

// Obtener TODOS los pedidos (Dashboard Administrador)
exports.getAllOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, u.nombre as cliente_nombre, u.email as cliente_email
      FROM pedidos p 
      JOIN usuarios u ON p.usuario_id = u.id 
      ORDER BY p.fecha DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo pedidos' });
  }
};

// Cambiar estado del pedido a 'enviado' o 'entregado' (ADMIN)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    await pool.query('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, id]);
    res.json({ message: 'Estado del pedido actualizado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando estado' });
  }
};
