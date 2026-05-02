-- CREAR BASE DE DATOS
CREATE DATABASE IF NOT EXISTS ecommerce_camisetas;
USE ecommerce_camisetas;

-- TABLA: USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'cliente') DEFAULT 'cliente',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA: PRODUCTOS (Unificada con Variantes para acoplarse al Backend actual)
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  stock INT DEFAULT 0,
  imagen VARCHAR(255),
  talla VARCHAR(10) DEFAULT 'ALL',
  color VARCHAR(50) DEFAULT 'MIX',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA: PEDIDOS
CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,

  estado ENUM('pendiente','pagado','enviado','entregado','cancelado') 
    DEFAULT 'pendiente',

  -- Integración con Stripe u otros
  stripe_session_id VARCHAR(255),

  -- Datos de envío (opcionales por si los incorporas a futuro)
  direccion TEXT,
  ciudad VARCHAR(100),
  pais VARCHAR(100),

  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (usuario_id) 
    REFERENCES usuarios(id) 
    ON DELETE CASCADE
);

-- TABLA: DETALLE DEL PEDIDO (Acoplado directo a 'productos')
CREATE TABLE IF NOT EXISTS detalle_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  producto_id INT NOT NULL, 
  cantidad INT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  talla VARCHAR(10) DEFAULT 'N/A',

  FOREIGN KEY (pedido_id) 
    REFERENCES pedidos(id) 
    ON DELETE CASCADE,

  FOREIGN KEY (producto_id) 
    REFERENCES productos(id) 
    ON DELETE CASCADE
);

-- Si la tabla ya existía sin la columna talla
ALTER TABLE detalle_pedido ADD COLUMN IF NOT EXISTS talla VARCHAR(10) DEFAULT 'N/A';

-- ÍNDICES (RENDIMIENTO)
CREATE INDEX idx_usuario_email ON usuarios(email);
CREATE INDEX idx_producto_nombre ON productos(nombre);
CREATE INDEX idx_pedido_usuario ON pedidos(usuario_id);

-- Omitimos la tabla producto_variantes ya que la arquitectura React/Node actual usa un modelo de producto plano. 

-- ==========================================
-- DATOS DE PRUEBA
-- ==========================================

-- Insertar Usuario Administrador (Password: admin123)
-- El string largo es "admin123" ya encriptado por BCrypt para que funcione el login
INSERT INTO usuarios (nombre, email, password, rol)
VALUES ('Admin Principal', 'admin@test.com', '$2b$10$QOa6/qJqYy5T9c.B8/86z.Z5Jj7yI8y/L9Uu9d3yY2q/43wO3y.', 'admin');

-- Insertar algunos productos de ejemplo emulando las variantes en registros independientes
INSERT INTO productos (nombre, descripcion, precio, stock, imagen, talla, color)
VALUES 
('Camiseta Oversize Noir', 'Camiseta estilo urbano oversize de lujo', 25.00, 50, '', 'M', 'Negro'),
('Camiseta Oversize Noir', 'Camiseta estilo urbano oversize de lujo', 25.00, 40, '', 'L', 'Negro'),
('Camiseta Oversize Blanco', 'Camiseta estilo urbano oversize de lujo', 23.00, 30, '', 'M', 'Blanco'),
('Camiseta Básica Classic', 'Camiseta clásica para uso diario premium', 20.00, 60, '', 'S', 'Rojo'),
('Camiseta Básica Classic', 'Camiseta clásica para uso diario premium', 22.00, 45, '', 'M', 'Azul');

-- Pedido de prueba
INSERT INTO pedidos (usuario_id, total, estado, direccion, ciudad, pais)
VALUES (1, 50.00, 'pendiente', 'Av. Siempre Viva 123', 'Quito', 'Ecuador');

-- Detalle del pedido de prueba (2 unidades de la Camiseta ID 1)
INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio)
VALUES (1, 1, 2, 25.00);

-- ==========================================
-- ESTRUCTURAS AVANZADAS (AUTH & SYS LOGS)
-- ==========================================

-- Añadir estado de validación al usuario si no existiera
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS verificado TINYINT(1) DEFAULT 0;

-- TABLA: VERIFICACIÓN DE CORREOS
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- TABLA: RECUPERACIÓN CONTRASEÑA
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expiracion DATETIME NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- TABLA: HEATMAP CLICKS (Tolerancia Alta)
CREATE TABLE IF NOT EXISTS user_clicks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id VARCHAR(50) DEFAULT 'Anonimo',
  page VARCHAR(255),
  x INT,
  y INT,
  timestamp DATETIME,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA: FAVORITOS
CREATE TABLE IF NOT EXISTS favoritos (
  usuario_id INT NOT NULL,
  producto_id INT NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, producto_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  INDEX idx_favoritos_usuario (usuario_id)
);

-- TABLA: CARRITO
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
);
