# Plataforma E-Commerce

![App Overview](https://img.shields.io/badge/Stack-MERN_Variante-purple?style=for-the-badge) ![React](https://img.shields.io/badge/React_Vite-141516?style=for-the-badge&logo=react&logoColor=61DAFB) ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

Un sistema de comercio electrónico fluido y extremadamente visual construido pensando en UX (Experiencia de Usuario) y robustez algorítmica. El cliente cuenta con una tienda conmutada sin recargas (Single Page Application) mientras que el administrador posee su propio cuartel general de gestión de stocks y variantes.

## Características Principales
* **Navegación Intuitiva**: Menú tipo toggle SPA con barra de búsqueda general y filtrado algorítmico interno.
* **Sistema de Tallas (S, M, L, XL)**: Las tarjetas y el inventario están forzados a registrar la escala de talla seleccionada en los pedidos. 
* **Favoritos Inteligentes**: Implementación de localStorage para conservar la Wishlist activa del cliente en su navegador.
* **Interfaz Administrativa**: Portal corporativo para subir directamente imágenes JPG/PNG de ropa y asociarlas a una base de datos validada.
* **Logística Automatizada**: Captura de provincia y ciudad acotando aranceles fijos aduaneros.

## Stack Tecnológico
**Front-End**
* React 18 + Vite
* Tailwind CSS
* React Router DOM v6
* React Hot Toast (UX Alerts)

**Back-End**
* Node.js & Express.js
* Autenticación JWT + Bcrypt
* Multer (Inyección de metadatos Media)
* Base de Datos Relacional: MySQL2 (Promesas)

## Despliegue Local Rápido

### Prerrequisitos
- Node.js (v20 o superior).
- Servidor MySQL.
- Servidor Redis (o Docker Desktop activo en Windows/Mac para levantarlo).

### Paso 1: Configurar Dependencias del Proyecto
Abre tu consola de comandos en la ruta principal. Debes instalar los paquetes de los dos motores individualmente:

```bash
# Instalamos la lógica de la API
cd backend
npm install

# Instalamos la capa Visual
cd ../frontend
npm install
```

### Paso 2: Infraestructura Local (Docker)
Si corres un entorno de desarrollo usando la plantilla provista, levanta los contenedores de motor base posicionándote en la raíz del proyecto:
```bash
docker-compose up -d redis mysql
```
*(Nota: Si usas MySQL de XAMPP / Local en el puerto 3306, solo enciende redis: `docker-compose up -d redis`)*.

### Paso 3: Inicializar la Base de Datos
El proyecto cuenta con comandos constructores de esquemas propios. Posiciónate en `backend/` y dispara el script constructor que forjará tablas relacionales, FKs e Índices.
```bash
cd backend
node migrador.js
```

### Paso 4: Levantar los Servidores

**Para el Servidor API (Backend)** *(escuchando en `http://localhost:3002`)*:
```bash
cd backend
npm start
``` 

**Para la Aplicación Web (Frontend)** *(escuchando en Vite Proxy `http://localhost:5173`)*:
```bash
# En otra ventana de terminal paralela
cd frontend
npm run dev
```

---
Diseñado y orquestado por **[Alejandro Moreira](https://github.com/Alejandro-Moreira)**.  
*© Todos los derechos reservados.*
# E-comerce-Camisetas
