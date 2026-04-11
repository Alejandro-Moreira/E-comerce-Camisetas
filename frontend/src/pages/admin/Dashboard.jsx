import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, Server, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { io } from 'socket.io-client';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [sysInfo, setSysInfo] = useState(null);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  
  // Paginación y Tabla
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ state: '', search: '' });
  const [loadingOrders, setLoadingOrders] = useState(true);

    // Inicializar WebSocket Seguro para métricas en tiempo real
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    // Incorporando Seguridad JWT en Handshake
    const token = localStorage.getItem('token');
    const socket = io(socketUrl, {
      auth: { token }
    });

    socket.on('NEW_ORDER', (orderData) => {
      setNewOrderAlert(orderData);
      fetchOrders(1, filters);
      setTimeout(() => setNewOrderAlert(null), 5000);
    });

    socket.on('connect_error', (err) => {
      console.warn("WebSocket Denegado:", err.message);
    });

    return () => socket.disconnect();
  // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const [statsRes, sysRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/system/system-info')
        ]);
        setStats(statsRes.data);
        setSysInfo(sysRes.data);
      } catch (err) {
        console.error("Error al cargar datos senior:", err);
      }
    };
    fetchKPIs();
  }, []);

  const fetchOrders = async (page, currFilters = filters) => {
    setLoadingOrders(true);
    try {
      // Inyección de parámetros REST puros evitando objetos anidados para escalabilidad
      const url = `/dashboard/orders?page=${page}&limit=${pagination.limit}&estado=${currFilters.state}&search=${currFilters.search}`;
      const res = await api.get(url);
      setOrders(res.data.orders);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Error al paginar:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders(pagination.page, filters);
  // eslint-disable-next-line
  }, [pagination.page]);

  const handleFilterSearch = (e) => {
    e.preventDefault();
    fetchOrders(1, filters);
  };

  const COLORS = ['#7c3aed', '#9333ea', '#a855f7', '#c084fc', '#e879f9'];

  // Skeleton Loader (UX Avanzado)
  if (!stats || !sysInfo) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-gray-200 rounded-2xl"></div>
          <div className="h-80 bg-gray-200 rounded-2xl"></div>
        </div>
        <div className="h-96 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  const statCards = [
    { name: 'Ingresos Totales', value: `$${parseFloat(stats.totalVentas).toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { name: 'Pedidos Totales', value: stats.totalPedidos, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { name: 'Ticket Promedio', value: `$${parseFloat(stats.ticketPromedio || 0).toFixed(2)}`, icon: TrendingUp, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100' },
    { name: 'Clientes Activos', value: stats.totalClientes, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  ];

  const salesData = stats.ventasRecientes.map(item => ({ fecha: item.fecha_corta, ventas: parseFloat(item.diario).toFixed(2) }));
  const topProducts = (stats.topProducts || []).map((p) => ({ name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name, ventas: parseInt(p.ventas) }));
  const statusColor = sysInfo?.status === 'OPERATIONAL' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header con Badge de System Info */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Métricas Principales</h2>
        <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
          <Server className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-600">Sistema:</span>
          <span className="relative flex h-3 w-3 ml-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusColor} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${statusColor}`}></span>
          </span>
          <span className="text-sm font-bold text-gray-700 ml-1">{sysInfo?.status}</span>
        </div>
        
        {/* Real-time Order Alert Banner */}
        {newOrderAlert && (
          <div className="absolute top-full right-4 mt-2 bg-purple-600 text-white px-6 py-3 rounded-xl shadow-lg ring-1 ring-black/5 animate-in slide-in-from-top-2 fade-in z-50">
            <div className="flex items-center space-x-3">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <p className="font-bold text-sm">¡Nuevo Pedido Recibido!</p>
              <p className="text-sm bg-purple-500 px-2 py-1 rounded">#{newOrderAlert.id}</p>
              <p className="text-sm font-black">${parseFloat(newOrderAlert.total).toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`bg-white rounded-2xl p-6 shadow-sm border ${stat.border} flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                <p className="text-xs font-bold tracking-widest text-gray-400 mt-2 uppercase">{stat.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-lg font-black text-gray-900 mb-6">Flujo de Ingresos (Últimos 7 días)</h3>
          <div className="h-72">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Line type="monotone" dataKey="ventas" stroke="#7c3aed" strokeWidth={3} dot={{ r: 5, fill: '#7c3aed', strokeWidth: 2, stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-lg font-black text-gray-900 mb-6">Top Prendas Vendidas</h3>
          <div className="h-72">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} width={90} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="ventas" radius={[0, 8, 8, 0]}>
                    {topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>
      </div>

      {/* Advanced Data Table con Paginación Server-Side */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center bg-gray-50/50 space-y-4 md:space-y-0">
          <h3 className="text-lg font-black text-gray-900">Registro Global de Pedidos</h3>
          <form className="flex space-x-2" onSubmit={handleFilterSearch}>
            <input 
              type="text" 
              placeholder="Buscar por correo..." 
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-500 transition-colors w-full md:w-64"
            />
            <select 
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-500 transition-colors bg-white"
            >
              <option value="">Cualquier Estado</option>
              <option value="completado">Completados</option>
              <option value="pendiente">Pendientes</option>
            </select>
            <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-purple-700 transition">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
        
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <th className="p-4 pl-6">ID Pedido</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Total</th>
                <th className="p-4 pr-6">Estado</th>
              </tr>
            </thead>
            <tbody>
              {loadingOrders ? (
                 <tr>
                   <td colSpan="5" className="p-8 text-center text-gray-400">
                     <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
                   </td>
                 </tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-gray-900">#{order.id}</td>
                  <td className="p-4 text-gray-600 text-sm">{order.cliente || 'Anónimo'}</td>
                  <td className="p-4 text-gray-500 text-sm">{new Date(order.fecha).toLocaleDateString()}</td>
                  <td className="p-4 font-bold text-gray-900 text-sm">${parseFloat(order.total).toFixed(2)}</td>
                  <td className="p-4 pr-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.estado === 'completado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginación UI */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50/30">
          <div>
            Mostrando página <span className="font-bold text-gray-900">{pagination.page}</span> de <span className="font-bold text-gray-900">{pagination.totalPages}</span> ({pagination.total} registros)
          </div>
          <div className="flex space-x-2">
            <button 
              disabled={pagination.page <= 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
