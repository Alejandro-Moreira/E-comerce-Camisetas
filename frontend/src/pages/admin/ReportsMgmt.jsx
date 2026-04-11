import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const COLORS = ['#7c3aed', '#9333ea', '#a855f7', '#c084fc', '#e879f9'];

const abandonedMock = [
  { hora: '08:00', carritos: 3 },
  { hora: '10:00', carritos: 7 },
  { hora: '12:00', carritos: 5 },
  { hora: '14:00', carritos: 11 },
  { hora: '16:00', carritos: 8 },
  { hora: '18:00', carritos: 14 },
  { hora: '20:00', carritos: 6 },
];

const comparativaMock = [
  { metrica: 'Ventas', actual: 1240, anterior: 980 },
  { metrica: 'Pedidos', actual: 34, anterior: 27 },
  { metrica: 'Clientes', actual: 18, anterior: 14 },
  { metrica: 'Ticket Prom.', actual: 36, anterior: 36 },
];

export default function ReportsMgmt() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const salesData = (stats?.ventasRecientes || []).map(item => ({
    fecha: item.fecha_corta,
    ventas: parseFloat(item.diario).toFixed(2)
  }));

  const topProducts = (stats?.topProducts || []).map((p, i) => ({
    name: p.name.length > 16 ? p.name.slice(0, 16) + '…' : p.name,
    ventas: parseInt(p.ventas)
  }));

  const kpis = stats ? [
    {
      label: 'Ingresos Totales',
      value: `$${parseFloat(stats.totalVentas).toFixed(2)}`,
      change: '+12.4%',
      positive: true,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Pedidos Totales',
      value: stats.totalPedidos,
      change: '+8.1%',
      positive: true,
      icon: ShoppingBag,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Ticket Promedio',
      value: `$${parseFloat(stats.ticketPromedio || 0).toFixed(2)}`,
      change: '-2.3%',
      positive: false,
      icon: TrendingUp,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
    },
    {
      label: 'Clientes Activos',
      value: stats.totalClientes,
      change: '+5.7%',
      positive: true,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ] : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Header con selector de período */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900">Reportes y Análisis</h2>
          <p className="text-sm text-gray-400 font-medium mt-0.5">Métricas en tiempo real del negocio</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${period === p ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              {p === '7d' ? 'Última semana' : p === '30d' ? 'Último mes' : 'Últimos 90 días'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards con comparativa */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} strokeWidth={2.5} />
                </div>
                <span className={`inline-flex items-center gap-0.5 text-xs font-black ${kpi.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                  {kpi.positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {kpi.change}
                </span>
              </div>
              <p className="text-3xl font-black text-gray-900 tracking-tight">{kpi.value}</p>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 mt-2 uppercase">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Gráfico de ventas + Top productos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-black text-gray-900 mb-5">Flujo de Ingresos (Últimos 7 días)</h3>
          <div className="h-64">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    formatter={(val) => [`$${val}`, 'Ventas']}
                  />
                  <Area type="monotone" dataKey="ventas" stroke="#7c3aed" strokeWidth={3} fill="url(#colorVentas)" dot={{ r: 4, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <span className="text-gray-400 font-semibold text-sm">Sin datos de ventas aún</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-black text-gray-900 mb-5">Top Prendas</h3>
          <div className="h-64">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} width={80} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} formatter={(val) => [val, 'Unidades']} />
                  <Bar dataKey="ventas" radius={[0, 8, 8, 0]}>
                    {topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <span className="text-gray-400 font-semibold text-sm">Sin historial</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparativa + Carritos abandonados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Comparativa períodos */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-black text-gray-900">Comparativa: Esta Semana vs. Anterior</h3>
            <span className="text-xs bg-blue-100 text-blue-700 font-black px-3 py-1.5 rounded-full border border-blue-200 uppercase tracking-widest">Demo</span>
          </div>
          <div className="space-y-3">
            {comparativaMock.map((item, i) => {
              const pct = Math.round(((item.actual - item.anterior) / item.anterior) * 100);
              const positive = pct >= 0;
              return (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <span className="font-bold text-gray-700">{item.metrica}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400 font-medium">Anterior: <strong className="text-gray-600">{item.anterior}</strong></span>
                    <span className="text-base font-black text-gray-900">{item.actual}</span>
                    <span className={`inline-flex items-center gap-0.5 text-xs font-black ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
                      {positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {Math.abs(pct)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carritos Abandonados */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-black text-gray-900">Carritos Abandonados (Hoy)</h3>
            <span className="text-xs bg-amber-100 text-amber-700 font-black px-3 py-1.5 rounded-full border border-amber-200 uppercase tracking-widest">Demo</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={abandonedMock}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hora" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} formatter={(val) => [val, 'Carritos']} />
                <Bar dataKey="carritos" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-400 font-medium mt-3 text-center">Total estimado hoy: <strong className="text-gray-700">54 carritos no convertidos</strong></p>
        </div>
      </div>

    </div>
  );
}
