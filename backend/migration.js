const pool = require('./src/config/db');

async function runMigration() {
  try {
    console.log('Iniciando Migración de Seguridad V2...');

    // 1. Añadir columna 'verificado' a usuarios (DEFAULT 1 para que el admin actual no se bloquee)
    try {
      await pool.query('ALTER TABLE usuarios ADD COLUMN verificado BOOLEAN DEFAULT 1');
      console.log('✔️ Columna "verificado" añadida a usuarios');
    } catch(e) { console.log('⚡ La columna "verificado" ya existía o hubo un aviso ligero'); }

    // 2. Crear tabla de Verificaciones de Correo
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    console.log('✔️ Tabla "email_verification_tokens" inicializada');

    // 3. Crear tabla de Recuperación de Contraseña
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expiracion TIMESTAMP NOT NULL,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    console.log('✔️ Tabla "password_resets" inicializada');

    console.log('Migración completada con éxito. Listo para Mailing.');
  } catch (error) {
    console.error('❌ Error Crítico en Migración:', error);
  } finally {
    process.exit();
  }
}

runMigration();
