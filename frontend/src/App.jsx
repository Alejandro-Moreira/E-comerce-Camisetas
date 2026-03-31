import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Footer from './components/Footer';

// Importaremos los screens de admin próximamente
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductsMgmt from './pages/admin/ProductsMgmt';
import OrdersMgmt from './pages/admin/OrdersMgmt';

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <CartProvider>
          <BrowserRouter>
          {/* Componente flotante para notificaciones Globales */}
          <Toaster position="top-center" reverseOrder={false} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="productos" element={<ProductsMgmt />} />
              <Route path="pedidos" element={<OrdersMgmt />} />
            </Route>

          </Routes>
          <Footer />
        </BrowserRouter>
        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;
