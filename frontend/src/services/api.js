import axios from 'axios';

const api = axios.create({
  // Utiliza variables de entorno para Producción (VITE_API_URL) o cae en localhost para desarrollo
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3002/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    // Retornamos directamente el 'data' extraído del wrapper estructurado.
    // Asumiendo respuesta: { success: true, data: { ... }, message: "..." }
    if (response.data && response.data.success) {
      return response.data;
    }
    return response;
  },
  (error) => {
    // Si la respuesta proviene del backend con nuestro contrato estandarizado
    if (error.response && error.response.data && error.response.data.success === false) {
      return Promise.reject(new Error(error.response.data.message || 'Error en servidor'));
    }
    // Errores genéricos de red (backend caído, etc)
    return Promise.reject(new Error(error.message || 'Error de conexión'));
  }
);

export default api;
