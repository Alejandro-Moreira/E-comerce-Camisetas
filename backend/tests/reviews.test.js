const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/db');

let tokenCliente;
let testProductId;

beforeAll(async () => {
  // Purga de tablas auxiliares de test e Inyección controlada
  await pool.query('DELETE FROM product_reviews');
  await pool.query('DELETE FROM productos WHERE nombre = "Test Review Shirt"');
  await pool.query('DELETE FROM usuarios WHERE email = "tester_review@saas.com"');

  // Insertar usuario
  const [u] = await pool.query(`INSERT INTO usuarios (nombre, email, password, rol) VALUES ('Tester', 'tester_review@saas.com', 'hasheada', 'cliente')`);
  const userId = u.insertId;

  // Insertar producto
  const [p] = await pool.query(`INSERT INTO productos (nombre, descripcion, precio, stock, categoria) VALUES ('Test Review Shirt', 'Description', 20, 10, 'Basica')`);
  testProductId = p.insertId;

  // Mockear Token (Si usamos el token firmable)
  const jwt = require('jsonwebtoken');
  tokenCliente = jwt.sign({ id: userId, rol: 'cliente' }, process.env.JWT_SECRET || 'super_secret_dev_key', { expiresIn: '1h' });
});

afterAll(async () => {
  await pool.query('DELETE FROM product_reviews');
  await pool.query('DELETE FROM productos WHERE id = ?', [testProductId]);
  await pool.query('DELETE FROM usuarios WHERE email = "tester_review@saas.com"');
});

describe('Product Reviews System Core', () => {

  it('Debe rechazar review sin auth', async () => {
    const res = await request(app).post('/api/reviews').send({ productId: testProductId, rating: 5 });
    expect(res.status).toBe(403);
  });

  it('Debe aceptar la creacion de la primera reseña', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${tokenCliente}`)
      .send({ productId: testProductId, rating: 4, comment: 'Excelente tela' });
    
    expect(res.status).toBe(201);
  });

  it('Debe sobreescribir la reseña anterior del mismo usuario (UPSERT) en vez de duplicar', async () => {
    // Al disparar nuevamente, el AVG no debe bajar si fuera duplo, y el comment debe sobrescribirse.
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${tokenCliente}`)
      .send({ productId: testProductId, rating: 2, comment: 'Me arrepenti, es mala' });
    
    expect(res.status).toBe(201);

    const summaryReq = await request(app).get(`/api/reviews/summary/${testProductId}`);
    expect(summaryReq.body.data.total).toBe(1);
    expect(summaryReq.body.data.average).toBe(2);
    expect(summaryReq.body.data.distribution['2']).toBe(1);
    expect(summaryReq.body.data.distribution['4']).toBe(0);
  });

  it('Debe rechazar un rating fuera del rango 1-5', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${tokenCliente}`)
      .send({ productId: testProductId, rating: 6 });
    
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('INVALID_RATING');
  });
});
