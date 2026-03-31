const app = require('./src/app');
const pool = require('./src/config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Primero comprobamos que la base de datos responde. Si está ok, levantamos el server.
pool.getConnection()
  .then((connection) => {
    console.log('✅ Conexión a MySQL exitosa');
    connection.release(); // liberamos
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error conectando a la base de datos:', err.message);
    console.error('Por favor verifica que MySQL esté encendido y exista la base de datos "ecommerce_camisetas"');
    process.exit(1);
  });
