import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { DollarSign, PackageCheck, Send, Archive } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrdersMgmt() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/pedidos');
      setOrders(res.data);
    } catch (err) {
      toast.error(err.message || "Error al cargar pedios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, estado) => {
    try {
      await api.put(`/pedidos/${id}/status`, { estado });
      toast.success(`Estado actualizado a: ${estado}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.message || "Error actualizando estado de la logística");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pagado': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'enviado': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'entregado': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'cancelado': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-amber-100 text-amber-800 border border-amber-200';
    }
  };

  if (loading) return (
     <div className="flex justify-center items-center py-20">
       <div className="w-10 h-10 border-4 border-t-purple-600 border-gray-200 rounded-full animate-spin"></div>
     </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Centro de Logística y Envíos</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold uppercase tracking-widest text-[10px] border-b border-gray-100">
                <th className="p-5">Localizador / Fecha</th>
                <th className="p-5">Datos del Comprador</th>
                <th className="p-5">Total Facturado</th>
                <th className="p-5">Status Logístico</th>
                <th className="p-5 text-right">Mover a...</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-purple-50/30 transition-colors group">
                  <td className="p-5">
                    <div className="font-black text-gray-900 tracking-wider">#ORD-{order.id.toString().padStart(5, '0')}</div>
                    <div className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">{new Date(order.fecha).toLocaleDateString()}</div>
                  </td>
                  <td className="p-5">
                    <div className="font-extrabold text-gray-800">{order.cliente_nombre}</div>
                    <div className="text-xs text-purple-600 font-semibold mt-0.5">{order.cliente_email}</div>
                  </td>
                  <td className="p-5 font-black text-gray-900 text-lg">
                    ${parseFloat(order.total).toFixed(2)}
                  </td>
                  <td className="p-5">
                    <span className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm ${getStatusColor(order.estado)}`}>
                      {order.estado}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      {order.estado === 'pendiente' && <button onClick={() => updateStatus(order.id, 'pagado')} title="Forzar Pago Confirmado" className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 font-bold rounded-xl shrink-0 transition-colors border border-emerald-100 shadow-sm"><DollarSign className="w-4 h-4"/></button>}
                      {order.estado === 'pagado' && <button onClick={() => updateStatus(order.id, 'enviado')} title="Marcar en Camino (Enviado)" className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 font-bold rounded-xl shrink-0 transition-colors border border-blue-100 shadow-sm"><Send className="w-4 h-4"/></button>}
                      {order.estado === 'enviado' && <button onClick={() => updateStatus(order.id, 'entregado')} title="Logística Completada" className="p-2.5 bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 font-bold rounded-xl shrink-0 transition-colors border border-purple-100 shadow-sm"><PackageCheck className="w-4 h-4"/></button>}
                      {['pendiente', 'pagado'].includes(order.estado) && <button onClick={() => {if(window.confirm('¿Anular esta orden por completo?')) updateStatus(order.id, 'cancelado')}} title="Cancelar Todo" className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold rounded-xl shrink-0 transition-colors border border-red-100 shadow-sm"><Archive className="w-4 h-4"/></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan="5" className="p-12 text-center font-bold text-gray-400 uppercase tracking-widest text-sm">No hay registros de compras</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
