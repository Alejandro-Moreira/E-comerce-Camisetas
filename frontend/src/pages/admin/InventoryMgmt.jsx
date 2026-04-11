import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Package, AlertTriangle, Search, TrendingDown, CheckCircle, Shirt, Filter } from 'lucide-react';

const stockStatus = (stock) => {
  if (stock === 0) return { label: 'Agotado', classes: 'bg-red-100 text-red-700 border-red-200' };
  if (stock < 10) return { label: 'Stock Bajo', classes: 'bg-amber-100 text-amber-700 border-amber-200' };
  return { label: 'Disponible', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
};

const MOVIMIENTOS_MOCK = [
  { tipo: 'Entrada', cantidad: 50, producto: 'Camiseta Oversize Noir', fecha: '2026-04-01', motivo: 'Reposición proveedor' },
  { tipo: 'Salida', cantidad: 12, producto: 'Camiseta Básica Classic', fecha: '2026-04-02', motivo: 'Ventas procesadas' },
  { tipo: 'Ajuste', cantidad: -3, producto: 'Camiseta Oversize Blanco', fecha: '2026-04-03', motivo: 'Control de calidad' },
  { tipo: 'Entrada', cantidad: 30, producto: 'Camiseta Básica Classic', fecha: '2026-04-03', motivo: 'Reposición proveedor' },
];

export default function InventoryMgmt() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  useEffect(() => {
    api.get('/productos')
      .then(res => setProducts(res.data))
      .catch(() => toast.error('Error al cargar inventario'))
      .finally(() => setLoading(false));
  }, []);

  const agotados = products.filter(p => p.stock === 0).length;
  const stockBajo = products.filter(p => p.stock > 0 && p.stock < 10).length;
  const totalUnidades = products.reduce((acc, p) => acc + (p.stock || 0), 0);

  let filtered = products.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );
  if (filterStatus === 'agotado') filtered = filtered.filter(p => p.stock === 0);
  if (filterStatus === 'bajo') filtered = filtered.filter(p => p.stock > 0 && p.stock < 10);
  if (filterStatus === 'ok') filtered = filtered.filter(p => p.stock >= 10);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Productos', value: products.length, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Unidades Totales', value: totalUnidades, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Stock Bajo (<10)', value: stockBajo, icon: TrendingDown, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Agotados', value: agotados, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
              <div className={`p-3 rounded-xl ${stat.bg} shrink-0`}>
                <Icon className={`w-5 h-5 ${stat.color}`} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerta si hay stock bajo */}
      {(agotados > 0 || stockBajo > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-amber-900">⚠️ Alerta de Inventario Crítico</p>
            <p className="text-sm text-amber-700 mt-1 font-medium">
              Tienes <strong>{agotados}</strong> producto(s) agotado(s) y <strong>{stockBajo}</strong> con stock bajo. Considera reponer tu inventario.
            </p>
          </div>
        </div>
      )}

      {/* Tabla Inventario */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-gray-900">Control de Stock</h2>
            <p className="text-sm text-gray-400 font-medium mt-0.5">{filtered.length} productos</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="todos">Todos</option>
              <option value="ok">Disponibles</option>
              <option value="bajo">Stock Bajo</option>
              <option value="agotado">Agotados</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Producto</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Talla</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Color</th>
                  <th className="text-center px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(product => {
                  const status = stockStatus(product.stock);
                  return (
                    <tr key={product.id} className={`hover:bg-gray-50/50 transition-colors ${product.stock === 0 ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {product.imagen
                              ? <img src={product.imagen} alt={product.nombre} className="w-full h-full object-cover" />
                              : <Shirt className="w-5 h-5 text-gray-400" />
                            }
                          </div>
                          <span className="font-bold text-gray-900">{product.nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-600">{product.talla || '—'}</td>
                      <td className="px-6 py-4 font-bold text-gray-600">{product.color || '—'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-xl font-black ${product.stock === 0 ? 'text-red-500' : product.stock < 10 ? 'text-amber-600' : 'text-gray-900'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black border uppercase tracking-wider ${status.classes}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-gray-900">${parseFloat(product.precio).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historial de Movimientos (Mock Visual) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-gray-900">Historial de Movimientos</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5 uppercase tracking-widest">Últimas 4 transacciones</p>
          </div>
          <span className="text-xs bg-amber-100 text-amber-700 font-black px-3 py-1.5 rounded-full border border-amber-200 uppercase tracking-widest">Demo</span>
        </div>
        <div className="divide-y divide-gray-50">
          {MOVIMIENTOS_MOCK.map((mov, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between group hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full shrink-0 ${mov.tipo === 'Entrada' ? 'bg-emerald-500' : mov.tipo === 'Salida' ? 'bg-red-400' : 'bg-amber-400'}`}></div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{mov.producto}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{mov.motivo} · {mov.fecha}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-lg font-black ${mov.tipo === 'Entrada' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {mov.tipo === 'Entrada' ? '+' : ''}{mov.cantidad} uds.
                </span>
                <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${mov.tipo === 'Entrada' ? 'text-emerald-500' : mov.tipo === 'Salida' ? 'text-red-400' : 'text-amber-500'}`}>{mov.tipo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
