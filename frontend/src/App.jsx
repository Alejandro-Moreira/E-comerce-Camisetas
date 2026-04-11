import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Footer from './components/Footer';

// Módulos SPA de Seguridad
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import useAnalytics from './hooks/useAnalytics';

// Importaremos los screens de admin próximamente
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductsMgmt from './pages/admin/ProductsMgmt';
import OrdersMgmt from './pages/admin/OrdersMgmt';
import UsersMgmt from './pages/admin/UsersMgmt';
import InventoryMgmt from './pages/admin/InventoryMgmt';
import ReportsMgmt from './pages/admin/ReportsMgmt';
import ShippingMgmt from './pages/admin/ShippingMgmt';
import MarketingMgmt from './pages/admin/MarketingMgmt';
import SupportMgmt from './pages/admin/SupportMgmt';
import StoreSettings from './pages/admin/StoreSettings';

// Handlers de acceso y vistas independientes
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import ProductDetail from './pages/ProductDetail';

function App() {
  // Inicialización Global: Rastreador Neuronal delegada de capa
  useAnalytics();

  return (
    <AuthProvider>
      <FavoritesProvider>
        <CartProvider>
          <BrowserRouter>
          {/* Componente flotante para notificaciones Globales */}
          <Toaster position="top-center" reverseOrder={false} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            
            {/* Recuperaciones y Verificaciones */}
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="productos" element={<ProductsMgmt />} />
              <Route path="pedidos" element={<OrdersMgmt />} />
              <Route path="usuarios" element={<UsersMgmt />} />
              <Route path="inventario" element={<InventoryMgmt />} />
              <Route path="reportes" element={<ReportsMgmt />} />
              <Route path="envios" element={<ShippingMgmt />} />
              <Route path="marketing" element={<MarketingMgmt />} />
              <Route path="soporte" element={<SupportMgmt />} />
              <Route path="configuracion" element={<StoreSettings />} />
            </Route>

            {/* Error Handlers / Boundaries */}
            <Route path="/forbidden" element={<Forbidden />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;
