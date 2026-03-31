const pool = require('./src/config/db');
const bcrypt = require('bcrypt');

async function setup() {
  try {
    await pool.query('ALTER TABLE detalle_pedido ADD COLUMN talla VARCHAR(10) DEFAULT "N/A"');
    console.log('[OK] Columna Talla añadida a detalle de facturas.');
  } catch(e) { console.log('[SKIP] La columna talla ya existe.')}
  
  try {
    const hash = await bcrypt.hash('admin123', 10);
    const [existing] = await pool.query("SELECT * FROM usuarios WHERE email = 'admin@admin.com'");
    if (existing.length === 0) {
       await pool.query("INSERT INTO usuarios (nombre, email, password, rol) VALUES ('Admin Supremo', 'admin@admin.com', ?, 'admin')", [hash]);
    } else {
       await pool.query("UPDATE usuarios SET password = ? WHERE email = 'admin@admin.com'", [hash]);
    }
    console.log('[OK] Credenciales del Admin forzadas: admin@admin.com / password: admin123');
  } catch(e) { console.error('Error inyectando admin:', e) }
  process.exit();
}
setup();
