const promClient = require('prom-client');

// Se inicializan los recolectores de métricas base de Node
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Métrica para total de requests y códigos de estado (4xx, 5xx, etc)
const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total de requests HTTP recibidos',
  labelNames: ['method', 'route', 'status_code'],
});
register.registerMetric(httpRequestCounter);

// Métrica explícita para contabilidad de Fallos
const httpErrorCounter = new promClient.Counter({
  name: 'http_errors_total',
  help: 'Total de fallos clasificados por tipo (4xx, 5xx)',
  labelNames: ['method', 'route', 'status_code']
});
register.registerMetric(httpErrorCounter);

// Métrica para tiempo de respuesta en SEGUNDOS (Estándar de Prometheus)
const httpRequestDurationSeconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duración de requests HTTP en segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 5] // Ajustado a estandar en Segundos
});
register.registerMetric(httpRequestDurationSeconds);

// Middleware que envoltura cada request
const metricsMiddleware = (req, res, next) => {
  const startEpoch = Date.now();
  
  res.on('finish', () => {
    // Calculo en segundos
    const durationSegundos = (Date.now() - startEpoch) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    // Contadores Universales
    httpRequestCounter.inc({
      method: req.method,
      route: route,
      status_code: res.statusCode
    });

    // Histogramas por Endpoint
    httpRequestDurationSeconds.observe({
      method: req.method,
      route: route,
      status_code: res.statusCode
    }, durationSegundos);
    
    // Registro explícito condicional para Errores (400 - 599)
    if (res.statusCode >= 400) {
      httpErrorCounter.inc({
        method: req.method,
        route: route,
        status_code: res.statusCode
      });
    }
  });
  
  next();
};

module.exports = {
  register,
  metricsMiddleware
};
