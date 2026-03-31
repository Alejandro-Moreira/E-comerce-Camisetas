import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, LogOut, Store } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || user.rol !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow border border-gray-100">
           <Store className="w-16 h-16 text-purple-600 mx-auto mb-4" />
           <h2 className="text-2xl font-black mb-2 text-gray-900">Acceso Privado</h2>
           <p className="text-gray-500 mb-6">Esta área es exclusiva para administradores.</p>
           <Link to="/" className="inline-block bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 transition">Volver a la tienda</Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Productos', path: '/admin/productos', icon: Package },
    { name: 'Pedidos', path: '/admin/pedidos', icon: ShoppingBag },
  ];

  const currentPage = navItems.find(item => item.path === location.pathname || (item.path !== '/admin' && location.pathname.startsWith(item.path)))?.name || 'Panel de Control';

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      <div className="w-64 flex-shrink-0 text-white flex flex-col transition-all duration-300 shadow-xl bg-gradient-purple relative z-20">
        <div className="h-20 flex flex-col justify-center px-6 border-b border-white/10 shrink-0">
          <div className="flex items-center">
            <Store className="w-6 h-6 mr-3 text-white" />
            <span className="text-xl font-black tracking-widest uppercase text-white shadow-sm">T-Shirt SaaS</span>
          </div>
          <span className="text-xs font-semibold text-purple-200 uppercase tracking-widest mt-1 opacity-70">Admin Control</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
          <div className="px-2 pb-4 text-[10px] font-black text-purple-200 uppercase tracking-widest opacity-80">Menú Principal</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link key={item.name} to={item.path} 
                className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive ? 'bg-white/15 text-white shadow-inner font-bold border border-white/10' : 'text-purple-100 hover:bg-white/10 hover:text-white font-medium'
                }`}>
                <Icon className={`w-5 h-5 mr-3 transition-opacity ${isActive ? 'opacity-100 text-purple-200' : 'opacity-70 group-hover:opacity-100'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-white/10 shrink-0">
           <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-purple-100 rounded-xl hover:bg-white/10 transition-colors group">
             <LogOut className="w-5 h-5 mr-3 opacity-70 group-hover:opacity-100 text-red-300" />
             <span className="group-hover:text-white font-semibold">Cerrar Sesión</span>
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/50 relative z-10">
        <header className="h-20 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm shrink-0 sticky top-0">
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">
             {currentPage}
          </h1>
          <div className="flex items-center gap-5">
            <div className="flex flex-col items-end">
               <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Activo como</span>
               <span className="text-sm font-black text-purple-700">{user.nombre}</span>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <Link to="/" className="text-sm font-semibold text-gray-500 hover:text-purple-600 transition-colors bg-gray-100 hover:bg-purple-50 px-4 py-2 rounded-lg flex items-center gap-2">
              <Store className="w-4 h-4" />
              Ver Tienda Frontal
            </Link>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 relative">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
