import React, { useContext, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Package, LogOut, Store,
  Users, Warehouse, Truck, Megaphone, HeadphonesIcon, Settings, BarChart3,
  ChevronDown, ChevronRight, AlertTriangle
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const navGroups = [
  {
    label: 'General',
    items: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Gestión',
    items: [
      { name: 'Productos', path: '/admin/productos', icon: Package },
      { name: 'Pedidos', path: '/admin/pedidos', icon: ShoppingBag },
      { name: 'Inventario', path: '/admin/inventario', icon: Warehouse },
      { name: 'Clientes', path: '/admin/usuarios', icon: Users },
    ]
  },
  {
    label: 'Operaciones',
    items: [
      { name: 'Envíos',   path: '/admin/envios',  icon: Truck },
      { name: 'Soporte',  path: '/admin/soporte', icon: HeadphonesIcon },
    ]
  },
  {
    label: 'Crecimiento',
    items: [
      { name: 'Marketing', path: '/admin/marketing', icon: Megaphone },
      { name: 'Reportes',  path: '/admin/reportes',  icon: BarChart3 },
    ]
  },
  {
    label: 'Sistema',
    items: [
      { name: 'Configuración', path: '/admin/configuracion', icon: Settings },
    ]
  },
];

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState({});

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

  const isActive = (path) =>
    path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(path);

  const currentPage = navGroups
    .flatMap(g => g.items)
    .find(item => isActive(item.path))?.name || 'Panel';

  const toggleGroup = (label) => {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">

      {/* SIDEBAR */}
      <div className="w-64 flex-shrink-0 text-white flex flex-col shadow-2xl relative z-20"
        style={{ background: 'linear-gradient(160deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)' }}>

        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/10 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center mr-3 shrink-0">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-black tracking-wide text-white">T-Shirt SaaS</span>
            <p className="text-[9px] text-purple-300 uppercase tracking-widest font-bold">Panel Admin</p>
          </div>
        </div>

        {/* Nav Groups */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-2">
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex items-center justify-between w-full px-2 py-1.5 text-[9px] font-black text-purple-300 uppercase tracking-widest hover:text-white transition-colors"
              >
                <span>{group.label}</span>
                {collapsed[group.label]
                  ? <ChevronRight className="w-3 h-3" />
                  : <ChevronDown className="w-3 h-3" />}
              </button>

              {!collapsed[group.label] && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                          active
                            ? 'bg-white/20 text-white shadow-inner font-bold border border-white/15'
                            : 'text-purple-200 hover:bg-white/10 hover:text-white font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-purple-300 group-hover:text-white'} transition-colors`} />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[8px] font-black uppercase tracking-widest bg-white/15 text-purple-200 px-1.5 py-0.5 rounded-full border border-white/10">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-white/10 shrink-0 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/10 border border-white/10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-black text-sm shrink-0">
              {user.nombre?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{user.nombre}</p>
              <p className="text-[9px] text-purple-300 font-black uppercase tracking-widest">{user.rol}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-purple-200 rounded-xl hover:bg-red-500/20 hover:text-red-200 transition-all group"
          >
            <LogOut className="w-4 h-4 mr-2.5 opacity-70 group-hover:opacity-100" />
            <span className="text-sm font-semibold">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/50">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-gray-100 shadow-sm shrink-0">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">{currentPage}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm font-semibold text-gray-500 hover:text-purple-600 transition-colors bg-gray-100 hover:bg-purple-50 px-4 py-2 rounded-xl flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              Ver Tienda
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
