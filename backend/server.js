require('dotenv').config();
const app = require('./src/app');
const pool = require('./src/config/db');
const validateEnv = require('./src/config/envValidator');

// 1. Validar entorno
validateEnv();

const PORT = process.env.PORT || 5000;

// Primero comprobamos que la base de datos responde. Si está ok, levantamos el server.
pool.getConnection()
  .then(async (connection) => {
    console.log('Conexión a MySQL exitosa');
    // Garantiza que el admin maestro siempre esté verificado al reiniciar
    await connection.query('UPDATE usuarios SET verificado = 1 WHERE email = ?', ['admin@admin.com']);
    connection.release();
    
    const http = require('http');
    const { Server } = require('socket.io');
    const jwt = require('jsonwebtoken');

    const httpServer = http.createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['*'],
        methods: ["GET", "POST"]
      }
    });

    // Inyectarlo en la app express para acceder desde los Controladores
    app.set('io', io);

    // Middleware de Seguridad para capa WebSocket
    io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.auth;
      if (!token) return next(new Error('WEBSOCKET_UNAUTHORIZED: Token required'));
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
      } catch (err) {
        next(new Error('WEBSOCKET_FORBIDDEN: JWT Invalid'));
      }
    });

    io.on('connection', (socket) => {
      console.log(`[Socket.io] Auth Cliente conectado: ${socket.user.email} (${socket.user.rol})`);
      
      // Auto-join basado en el Rol interceptado, imposible de falsificar por el frontend
      if (socket.user.rol === 'admin' || socket.user.rol === 'operador') {
        socket.join('admins');
        console.log(`[Socket.io] Uniendo ${socket.user.email} al anillo de Operaciones`);
      } else {
        // Cuarto personal para updates de pedidos
        socket.join(`user_${socket.user.id}`);
      }

      socket.on('disconnect', () => console.log(`[Socket.io] Desconectado: ${socket.id}`));
    });

    const server = httpServer.listen(PORT, () => {
      console.log(`Servidor backend (con Sockets Seguros) corriendo en http://localhost:${PORT}`);
    });

    // Arrancamos el Subsistema Worker (BullMQ asíncrono)
    require('./src/workers/index');
    const { enqueueJob } = require('./src/workers/queue');
    // Despachamos un backup preventivo no bloqueante al inicio
    enqueueJob('RUN_DB_BACKUP', { context: 'SYSTEM_BOOT' }).catch(console.error);

    // Cierre Graceful (Producción)
    const gracefulShutdown = () => {
      console.log('Iniciando apagado seguro (Graceful Shutdown)...');
      server.close(() => {
        console.log('Servidor HTTP cerrado.');
        // Cerramos el pool de conexiones a la base de datos MySQL
        pool.end((err) => {
          if (err) {
            console.error('Error cerrando conexiones a la Base de Datos:', err);
            return process.exit(1);
          }
          console.log('Conexiones a Base de Datos liberadas con éxito. Hasta pronto.');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  })
  .catch((err) => {
    console.error('Error conectando a la base de datos:', err.message);
    console.error('Por favor verifica que MySQL esté encendido y exista la base de datos "ecommerce_camisetas"');
    process.exit(1);
  });
