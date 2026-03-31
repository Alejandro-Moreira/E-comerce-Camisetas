const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares globales
// Permite peticiones desde el frontend (Vite correrá en localhost:5173 por defecto)
app.use(cors());
// Parsea el body de las peticiones a JSON
app.use(express.json());

// Exponer la carpeta uploads para que React lea las URLs
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ruta base para testeo
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API E-commerce corriendo a la perfección' });
});

// Conectamos todas las rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/productos', require('./routes/productRoutes'));
app.use('/api/pedidos', require('./routes/orderRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Manejo de rutas que no existen
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;
