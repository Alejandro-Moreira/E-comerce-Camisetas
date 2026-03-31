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
Asegúrate de contar con Node.js y un gestor activo como XAMPP (Apache + MySQL) inicializado.

### 1. Clona e instala
```bash
git clone https://github.com/Alejandro-Moreira/TuRepoAca.git
cd E-commerce
```

### 2. Levanta el Cerebro (Back-end)
Abre tu consola:
```bash
cd backend
npm install
```
Renombra el `.env.example` (o crea un `.env`) ajustándolo a tu entorno:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_DATABASE=ecommerce_camisetas

PORT=3002
STRIPE_SECRET_KEY=sk_test_...
SESSION_SECRET=string_largo_secreto
```
Y arráncalo:
```bash
npm start
```

### 3. Levanta la Piel (Front-end)
En otra terminal nueva dedicada:
```bash
cd frontend
npm install
npm run dev
```

---
Diseñado y orquestado por **[Alejandro Moreira](https://github.com/Alejandro-Moreira)**.  
*© Todos los derechos reservados.*
# E-comerce-Camisetas
