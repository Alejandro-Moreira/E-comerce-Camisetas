const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const pool = require('./config/db');

const app = express();

// Permite peticiones desde el frontend con múltiples origenes
const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['*'];
app.use(cors({
  origin: function(origin, callback) {
    if (process.env.NODE_ENV === 'test') return callback(null, true);
    
    // Si no hay origen (por ej: postman, curl) o coincide estricto
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS denegado para el origen: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Middlewares globales de Seguridad
app.use(helmet({ crossOriginResourcePolicy: false }));

// xss-clean nativo falla en Express 5 por req.query read-only getter. Interceptamos interiormente:
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/<[^>]*>?/gm, ''); // Purificador XSS Básico
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    });
  };
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
});
app.disable('x-powered-by'); // Seguridad por oscuridad extra

const { metricsMiddleware, register } = require('./middlewares/prometheus');

// Logging Profesional
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Middleware Global de Observabilidad (Prometheus)
app.use(metricsMiddleware);

// Ruta Exclusiva de Recolección de Métricas Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

const { RedisStore } = require('rate-limit-redis');
const redisClient = require('./config/redis');

// Tolerancia: Prevención de fuerza bruta (Rate Limiting Distribuido con Redis)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 3000, 
  standardHeaders: true, // Retorna info del limite al cliente
  legacyHeaders: false,
  store: new RedisStore({
    // @ts-expect-error - rate-limit-redis tipados pueden pelear con node-redis
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: 'rl:',
  }),
  message: { success: false, error: 'RATE_LIMIT_EXCEEDED', message: 'Exceso de tráfico bloqueado por seguridad perimetral.' }
});
app.use('/api/', limiter);

// Parsea el body limitando el payload para prevenir denegación de servicio (10kb max)
app.use(express.json({ limit: '10kb' }));

// Exponer la carpeta uploads para que React lea las URLs
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ruta base para testeo y Monitoreo de Producción Profundo (Deep Health Check)
app.get('/api/health', async (req, res) => {
  try {
    // Validamos conexión en vivo a la DB
    await pool.query('SELECT 1');
    res.json({ status: 'ok', message: 'API & Base de Datos E-commerce operando a la perfección' });
  } catch (err) {
    console.error('[HealthCheck Error]:', err.message);
    res.status(503).json({ status: 'error', message: 'Servicio No Disponible (Problema de Base de Datos)' });
  }
});

// Conectamos todas las rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/productos', require('./routes/productRoutes'));
app.use('/api/pedidos', require('./routes/orderRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/usuarios', require('./routes/userRoutes'));
app.use('/api/system', require('./routes/monitoringRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Manejo de rutas que no existen
app.use((req, res) => {
  const { errorResponse } = require('./utils/responseHandler');
  errorResponse(res, 'NOT_FOUND', 'Ruta no encontrada', 404);
});

const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

module.exports = app;
