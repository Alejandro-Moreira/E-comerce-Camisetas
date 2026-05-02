const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrar() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1752717932m',
    database: process.env.DB_DATABASE || 'ecommerce_camisetas',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('Iniciando migración manual...');

    // 1. Añadir verificado a usuarios
    try {
      await pool.query('ALTER TABLE usuarios ADD COLUMN verificado TINYINT(1) DEFAULT 0');
      console.log('✅ Columna verificado añadida a usuarios');
    } catch(e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('⚠️ Columna verificado ya existe');
      else console.error('Error con verificado:', e);
    }

    // 2. Añadir talla a detalle_pedido
    try {
      await pool.query('ALTER TABLE detalle_pedido ADD COLUMN talla VARCHAR(10) DEFAULT "N/A"');
      console.log('✅ Columna talla añadida a detalle_pedido');
    } catch(e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('⚠️ Columna talla ya existe');
      else console.error('Error con talla:', e);
    }

    // 3. Crear email_verification_tokens
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabla email_verification_tokens lista');

    // 4. Crear password_resets
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        expiracion DATETIME NOT NULL,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabla password_resets lista');

    // 5. Crear user_clicks
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_clicks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id VARCHAR(50) DEFAULT 'Anonimo',
        page VARCHAR(255),
        x INT,
        y INT,
        timestamp DATETIME,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla user_clicks lista');

    // 6. Optimización de Producción: Índices
    try {
      await pool.query('CREATE INDEX idx_usuarios_email ON usuarios(email)');
      console.log('✅ Índice de optimización creado en usuarios(email)');
    } catch(e) {
      if (e.code === 'ER_DUP_KEYNAME') console.log('⚠️ Índice idx_usuarios_email ya existe');
      else console.error('Error con índice:', e);
    }
    try {
      await pool.query('CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id)');
      console.log('✅ Índice de optimización creado en pedidos(usuario_id)');
    } catch(e) {
      if (e.code === 'ER_DUP_KEYNAME') console.log('⚠️ Índice idx_pedidos_usuario ya existe');
      else console.error('Error con índice:', e);
    }
    try {
      await pool.query('CREATE INDEX idx_pedidos_estado_fecha ON pedidos(estado, fecha)');
      console.log('✅ Índice compuesto de optimización creado en pedidos(estado, fecha)');
    } catch(e) {
      if (e.code === 'ER_DUP_KEYNAME') console.log('⚠️ Índice idx_pedidos_estado_fecha ya existe');
      else console.error('Error con índice:', e);
    }

    // 7. Sistema Funcional de Auditoría con Alta Indexación
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT,
        action VARCHAR(100) NOT NULL,
        entity VARCHAR(100),
        entity_id INT,
        metadata JSON,
        ip_address VARCHAR(45),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_audit_usuario (usuario_id),
        INDEX idx_audit_action (action),
        INDEX idx_audit_creado_en (creado_en)
      )
    `);
    console.log('✅ Tabla audit_logs optimizada con índices B-Tree lista.');

    // 8. Infraestructura de Seguridad: Rotación Continua de Refresh Tokens
    await pool.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        token VARCHAR(500) NOT NULL UNIQUE,
        expiracion TIMESTAMP NOT NULL,
        revocado BOOLEAN DEFAULT FALSE,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_rt_usuario (usuario_id),
        INDEX idx_rt_token (token(255))
      )
    `);
    console.log('✅ Tabla refresh_tokens de rotación fría construida.');

    // 9. Sistema de Interacción Pública: Product Reviews (Calificaciones)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        usuario_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_product_review (product_id, usuario_id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES productos(id) ON DELETE CASCADE,
        INDEX idx_reviews_product (product_id),
        INDEX idx_reviews_user (usuario_id),
        INDEX idx_reviews_rating (rating)
      )
    `);
    console.log('✅ Tabla product_reviews parametrizada con constricciones Unicas implementada.');

    // 10. Persistencia de Favoritos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favoritos (
        usuario_id INT NOT NULL,
        producto_id INT NOT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (usuario_id, producto_id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
        INDEX idx_favoritos_usuario (usuario_id)
      )
    `);
    console.log('✅ Tabla favoritos lista.');

    // 11. Persistencia de Carrito de Compras
    await pool.query(`
      CREATE TABLE IF NOT EXISTS carrito (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        producto_id INT NOT NULL,
        cantidad INT NOT NULL DEFAULT 1,
        talla VARCHAR(10) NOT NULL DEFAULT 'Única',
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_product_talla (usuario_id, producto_id, talla),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
        INDEX idx_carrito_usuario (usuario_id)
      )
    `);
    console.log('✅ Tabla carrito lista.');

    console.log('Migración completada exitosamente.');

  } catch(e) {
    console.error('Error general en la migración:', e);
  } finally {
    await pool.end();
  }
}

migrar();
