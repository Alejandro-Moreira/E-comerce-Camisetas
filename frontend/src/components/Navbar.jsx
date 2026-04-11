import React, { useContext, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, LogOut, Search, User, Heart } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [q, setQ] = useState(searchParams.get('q') || '');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartQuantity = cart.reduce((acc, item) => acc + item.cantidad, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/?q=${encodeURIComponent(q.trim())}`);
    else navigate(`/`);
  };

  return (
    <header className="w-full shadow-sm sticky top-0 z-50">
      <div className="bg-gray-900 border-b border-gray-800 text-white flex flex-col sm:flex-row items-center justify-between px-4 py-3 gap-4">

        <div className="flex items-center w-full sm:w-auto shrink-0 justify-between">
          <Link to="/" className="flex items-center gap-1 hover:opacity-80 transition-all">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">T-Shirt SaaS</span>
          </Link>

          <div className="flex sm:hidden items-center gap-2">
            <Link to="/?tab=favoritos" className="p-2"><Heart className="w-6 h-6 text-pink-400" /></Link>
            {(!user || user.rol !== 'admin') && (
              <Link to="/cart" className="relative p-2">
                <ShoppingCart className="w-6 h-6 text-gray-300" />
                {cartQuantity > 0 && <span className="absolute top-[0px] right-0 bg-purple-600 rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center">{cartQuantity}</span>}
              </Link>
            )}
            <button onClick={handleLogout} className="p-2"><LogOut className="w-6 h-6 text-gray-400" /></button>
          </div>
        </div>

        {/* Buscador Dinámico */}
        <div className="flex-1 w-full max-w-4xl order-3 sm:order-none">
          <form onSubmit={handleSearch} className="flex w-full rounded-xl overflow-hidden bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all shadow-inner">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Busca tallas, estilos, palabras clave..."
              className="w-full px-5 py-2.5 bg-transparent text-white outline-none font-medium text-sm placeholder:text-gray-500"
            />
            <button type="submit" className="bg-purple-600 hover:bg-purple-500 px-6 py-2.5 transition-colors flex items-center justify-center shrink-0">
              <Search className="w-5 h-5 text-white" />
            </button>
          </form>
        </div>

        <div className="hidden sm:flex items-center gap-6 shrink-0">
          <div className="flex flex-col text-right">
            {user ? (
              <>
                <span className="text-xs text-gray-400 font-medium tracking-wide">Bienvenido, {user.nombre?.split(' ')[0] || 'Usuario'}</span>
                <div className="flex items-center gap-3 mt-0.5">
                  {user.rol === 'admin' && (
                    <Link to="/admin" className="text-[10px] bg-white text-gray-900 px-2 py-0.5 rounded shadow-sm font-black uppercase tracking-widest hover:bg-gray-100 transition-colors">
                      Administrar Catálogo
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-sm font-bold text-gray-300 hover:text-red-400 transition-colors flex items-center gap-1"><LogOut className="w-4 h-4" /> Salir</button>
                </div>
              </>
            ) : (
              <>
                <span className="text-xs text-gray-400 font-medium tracking-wide">Hola, visitante</span>
                <div className="flex items-center gap-3 mt-0.5">
                  <Link to="/login" className="text-sm font-bold text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-1"><User className="w-4 h-4" /> Iniciar Sesión</Link>
                </div>
              </>
            )}
          </div>

          <Link to="/?tab=favoritos" title="Mis Favoritos" className="text-gray-400 hover:text-pink-500 transition-colors">
            <Heart className="w-6 h-6" />
          </Link>

          {(!user || user.rol !== 'admin') && (
            <Link to="/cart" className="flex items-center gap-2 group p-1.5 px-3 rounded-xl hover:bg-gray-800 transition-colors bg-gray-800/50 border border-gray-700/50 relative">
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                <span className="absolute -top-1.5 -right-2 bg-purple-600 text-white text-[10px] w-4 h-4 rounded-full font-bold flex flex-col items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  {cartQuantity}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">Carrito</span>
            </Link>
          )}

        </div>
      </div>

      {/* Cinta Dinámica Inteligente (SPA) */}
      <div className="bg-gray-50 border-b border-gray-200 text-gray-600 flex justify-center sm:justify-start items-center px-4 py-2 gap-2 sm:gap-6 text-xs sm:text-sm font-bold overflow-x-auto scrollbar-hide shadow-inner">
        <Link to="/" className="hover:text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors shrink-0"> Todo el Catálogo</Link>
        <Link to="/?tab=categorias" className="hover:text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors shrink-0">Categorías</Link>
        <Link to="/?tab=ofertas" className="hover:text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors shrink-0 flex items-center gap-1 text-purple-700 bg-purple-50/50">Ofertas</Link>
        <Link to="/?tab=favoritos" className="hover:text-pink-600 hover:bg-pink-50 px-3 py-1.5 rounded-lg transition-colors shrink-0 text-pink-600">Favoritos</Link>
        <Link to="/?tab=servicio" className="hover:text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors shrink-0">Servicio al Cliente</Link>
      </div>
    </header>
  );
}
