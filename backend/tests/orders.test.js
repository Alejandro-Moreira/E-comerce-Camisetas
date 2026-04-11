require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const request = require('supertest');
const app = require('../src/app');

// Mock del pool de base de datos MySQL (Patrón Advanced Mocking)
jest.mock('../src/config/db', () => ({
  query: jest.fn(),
  execute: jest.fn()
}));

const db = require('../src/config/db');

describe('Orders and Payment Gateway High-Concurrency Simulator', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  const getFakeToken = () => {
    const jwt = require('jsonwebtoken');
    return 'Bearer ' + jwt.sign({ id: 1, rol: 'cliente' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  };

  test('POST /api/pedidos - Fails gracefully under DB connection drop', async () => {
    // Forzamos la falla
    db.execute.mockRejectedValueOnce(new Error('Connection dropped'));

    const res = await request(app)
      .post('/api/pedidos')
      .set('Authorization', getFakeToken())
      .send({
        items: [{ id: 1, cantidad: 2, precio: 20 }],
        total: 40,
        direccion: 'Calle Falsa 123',
        ciudad: 'SimCity',
        pais: 'Simulation'
      });

    // Como falla DB entra al bloque catch y devuelve SERVER_ERROR
    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('SERVER_ERROR');
  });

  test('POST /api/pedidos - Crea el pedido exitosamente (Happy Path Mock)', async () => {
    // DB responde exitosamente:
    // 1. insert order
    db.execute.mockResolvedValueOnce([{ insertId: 999 }]); 
    // 2. insert items loop
    db.execute.mockResolvedValueOnce([{ insertId: 1 }]); 
    
    // AuthMock ya fue evitado por getFakeToken()
    const res = await request(app)
      .post('/api/pedidos')
      .set('Authorization', getFakeToken())
      .send({
        items: [{ id: 1, cantidad: 2, precio: 20 }],
        total: 40,
        direccion: 'Calle Real 1',
        ciudad: 'Neo Tokyo',
        pais: 'Japan'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    // Tiene que resolver la ID mapeada por Stripe/BD Mock
    expect(res.body.data.pedido_id).toBe(999);
  });
});
