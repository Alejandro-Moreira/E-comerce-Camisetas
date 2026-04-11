require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const request = require('supertest');
const app = require('../src/app');

describe('System Health & Rate Limits API', () => {

  it('GET /api/health should respond with ok and check database connection', async () => {
    // Para simplificar la ejecución aislada, simulamos el endpoint o comprobamos solo la respuesta HTTP general si no requiere validación DB
    const pool = require('../src/config/db');
    jest.spyOn(pool, 'query').mockResolvedValue([[{ '1': 1 }]]);

    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/auth/login should trigger rate limiter strictly after 5 attempts', async () => {
    // Almacenamos peticiones para forzar el rate limit
    for(let i = 0; i < 5; i++) {
        await request(app).post('/api/auth/login').send({ email: 'test@invalid.com', password: '123' });
    }
    
    // El sexto intento debe ser bloqueado
    const blockedRes = await request(app).post('/api/auth/login').send({ email: 'test@invalid.com', password: '123' });
    expect(blockedRes.statusCode).toBe(429); // Too Many Requests
    expect(blockedRes.body.error).toBe('TOO_MANY_ATTEMPTS');
  });

});
