const pool = require('./src/config/db');

async function fixDB() {
  try {
    await pool.query('ALTER TABLE productos ADD COLUMN talla VARCHAR(100) DEFAULT ""');
    console.log('[OK] Columna talla añadida a productos.');
  } catch (e) {
    console.log('Talla ya existe en productos.');
  }
  
  try {
    await pool.query('ALTER TABLE productos ADD COLUMN color VARCHAR(50) DEFAULT ""');
    console.log('[OK] Columna color añadida a productos.');
  } catch (e) {
    console.log('Color ya existe en productos.');
  }

  process.exit();
}
fixDB();
