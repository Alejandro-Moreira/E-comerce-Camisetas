const orderRepository = require('../repositories/orderRepository');
const AppError = require('../utils/AppError');
let stripe;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') && !process.env.STRIPE_SECRET_KEY.includes('reemplazar')) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

exports.processOrder = async (usuario_id, items, total, direccion, ciudad, pais) => {
  if (!items || items.length === 0) {
    throw new AppError('VALIDATION_ERROR', 'El carrito está vacío, imposible procesar', 400);
  }

  const pedido_id = await orderRepository.createPedido(usuario_id, total, direccion, ciudad, pais);
  const values = items.map(item => [pedido_id, item.id, item.cantidad, item.precio, item.talla || 'N/A']);
  await orderRepository.insertDetalles(values);

  if (stripe) {
    const amountInCents = Math.round(Number(total) * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: { pedido_id: pedido_id.toString(), usuario_id: usuario_id.toString() }
    });
    return { clientSecret: paymentIntent.client_secret, pedido_id };
  }

  return { pedido_id };
};

exports.confirmPayment = async (id) => {
  await orderRepository.updateEstado(id, 'pagado');
};

exports.updateStatus = async (id, estado) => {
  await orderRepository.updateEstado(id, estado);
};

exports.getUserOrders = async (usuario_id) => {
  return await orderRepository.findByUserId(usuario_id);
};

exports.getAllOrders = async () => {
  return await orderRepository.findAll();
};
