import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Truck, Package, MapPin, Clock, CheckCircle, XCircle, Search,
  ArrowRight, RefreshCw, RotateCcw, AlertCircle, ExternalLink
} from 'lucide-react';

const estadoEnvio = (estado) => {
  const map = {
    pendiente:  { label: 'Pendiente',  classes: 'bg-gray-100 text-gray-600 border-gray-200',     icon: Clock },
    pagado:     { label: 'Pagado',     classes: 'bg-blue-100 text-blue-700 border-blue-200',      icon: CheckCircle },
    enviado:    { label: 'En Tránsito', classes: 'bg-amber-100 text-amber-700 border-amber-200', icon: Truck },
    entregado:  { label: 'Entregado',  classes: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
    cancelado:  { label: 'Cancelado',  classes: 'bg-red-100 text-red-700 border-red-200',         icon: XCircle },
  };
  return map[estado] || map.pendiente;
};

const TRANSPORTISTAS_MOCK = [
  { nombre: 'DHL Express', activo: true, logo: '🟡', tiempoEst: '24-48h', costo: '$8.50' },
  { nombre: 'FedEx',       activo: true, logo: '🟣', tiempoEst: '24-72h', costo: '$9.20' },
  { nombre: 'Correos EC',  activo: false, logo: '🔵', tiempoEst: '3-5 días', costo: '$4.00' },
];

const DEVOLUCIONES_MOCK = [
  { id: 'DEV-001', cliente: 'Carlos Martínez', producto: 'Camiseta Oversize Noir', motivo: 'Talla incorrecta', estado: 'Pendiente', fecha: '2026-04-02', monto: '$25.00' },
  { id: 'DEV-002', cliente: 'Ana Torres',      producto: 'Camiseta Básica Classic', motivo: 'Defecto de fábrica', estado: 'Aprobado', fecha: '2026-04-01', monto: '$20.00' },
  { id: 'DEV-003', cliente: 'Luis Pérez',      producto: 'Camiseta Oversize Blanco', motivo: 'No era lo esperado', estado: 'Completado', fecha: '2026-03-30', monto: '$23.00' },
];

export default function ShippingMgmt() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [tab, setTab] = useState('pedidos');

  useEffect(() => {
    api.get('/pedidos')
      .then(res => setOrders(res.data))
      .catch((err) => toast.error(err.message || 'Error al cargar pedidos'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    const matchSearch = String(o.id).includes(search) || (o.ciudad || '').toLowerCase().includes(search.toLowerCase());
    const matchEstado = filterEstado === 'todos' || o.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const enTransito = orders.filter(o => o.estado === 'enviado').length;
  const entregados = orders.filter(o => o.estado === 'entregado').length;
  const pendientes  = orders.filter(o => o.estado === 'pendiente' || o.estado === 'pagado').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'En Tránsito',  value: enTransito, icon: Truck,        color: 'text-amber-600',   bg: 'bg-amber-50' },
          { label: 'Entregados',   value: entregados, icon: CheckCircle,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pendientes',   value: pendientes,  icon: Clock,         color: 'text-blue-600',    bg: 'bg-blue-50' },
          { label: 'Devoluciones', value: DEVOLUCIONES_MOCK.length, icon: RotateCcw, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
              <div className={`p-3 rounded-xl ${s.bg} shrink-0`}><Icon className={`w-5 h-5 ${s.color}`} strokeWidth={2.5} /></div>
              <div>
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {[
          { key: 'pedidos', label: 'Seguimiento de Pedidos' },
          { key: 'transportistas', label: 'Transportistas' },
          { key: 'devoluciones', label: 'Devoluciones' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
              tab === t.key
                ? 'border-purple-600 text-purple-700 bg-purple-50 rounded-t-xl'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-t-xl'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Pedidos */}
      {tab === 'pedidos' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ID o ciudad..." className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50" />
            </div>
            <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 bg-gray-50 focus:outline-none">
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="enviado">En Tránsito</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          {loading ? (
            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['# Pedido', 'Estado', 'Destino', 'Total', 'Fecha', 'Guía'].map(h => (
                      <th key={h} className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(order => {
                    const status = estadoEnvio(order.estado);
                    const StatusIcon = status.icon;
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-black text-gray-900">#{order.id.toString().padStart(4, '0')}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${status.classes}`}>
                            <StatusIcon className="w-3 h-3" /> {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {order.ciudad || '—'}{order.pais ? `, ${order.pais}` : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-black text-gray-900">${parseFloat(order.total).toFixed(2)}</td>
                        <td className="px-6 py-4 text-gray-500 font-medium">{new Date(order.fecha).toLocaleDateString('es-EC')}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toast('Generación de guía disponible con transportista real', { icon: 'ℹ️' })}
                            className="flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Generar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="font-bold">Sin pedidos que coincidan</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Transportistas */}
      {tab === 'transportistas' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TRANSPORTISTAS_MOCK.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{t.logo}</span>
                  <span className="font-black text-gray-900 text-base">{t.nombre}</span>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${t.activo ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                  {t.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Tiempo Est.</p>
                  <p className="font-black text-gray-900">{t.tiempoEst}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Costo Base</p>
                  <p className="font-black text-gray-900">{t.costo}</p>
                </div>
              </div>
              <button
                onClick={() => toast('Integración con API del transportista — próximamente', { icon: '🚚' })}
                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${t.activo ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {t.activo ? 'Configurar' : 'Activar'}
              </button>
            </div>
          ))}
          <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-6 flex flex-col items-center justify-center gap-3 text-center hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => toast('Añadir nuevo transportista — próximamente', { icon: '➕' })}>
            <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-2xl">+</div>
            <p className="font-bold text-gray-500 text-sm">Añadir Transportista</p>
          </div>
        </div>
      )}

      {/* Tab: Devoluciones */}
      {tab === 'devoluciones' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-black text-gray-900">Gestión de Devoluciones</h3>
            <span className="text-xs bg-amber-100 text-amber-700 font-black px-3 py-1.5 rounded-full border border-amber-200 uppercase tracking-widest">Demo</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['ID', 'Cliente', 'Producto', 'Motivo', 'Monto', 'Estado', 'Acción'].map(h => (
                    <th key={h} className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {DEVOLUCIONES_MOCK.map((dev, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-black text-purple-700">{dev.id}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{dev.cliente}</td>
                    <td className="px-6 py-4 text-gray-600">{dev.producto}</td>
                    <td className="px-6 py-4 text-gray-500">{dev.motivo}</td>
                    <td className="px-6 py-4 font-black text-gray-900">{dev.monto}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        dev.estado === 'Completado' ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : dev.estado === 'Aprobado' ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'bg-amber-100 text-amber-700 border-amber-200'
                      }`}>{dev.estado}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => toast('Procesar reembolso — conectar con pasarela de pago', { icon: '💳' })} className="text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5" /> Procesar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
