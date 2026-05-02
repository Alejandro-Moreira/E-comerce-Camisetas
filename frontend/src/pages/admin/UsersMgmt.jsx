import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Users, Search, CheckCircle, XCircle, ShoppingBag, DollarSign, Shield, Mail } from 'lucide-react';

const roleBadge = (rol) => {
  const map = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    cliente: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return map[rol] || 'bg-gray-100 text-gray-500 border-gray-200';
};

export default function UsersMgmt() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsers(res.data);
    } catch (err) {
      toast.error(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId, newRol) => {
    setUpdatingId(userId);
    try {
      const res = await api.put(`/usuarios/${userId}/rol`, { rol: newRol });
      toast.success(res?.message || 'Rol actualizado correctamente');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, rol: newRol } : u));
      setSelectedUser(null);
    } catch (err) {
      toast.error(err.message || 'Error al actualizar rol');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter(u =>
    u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalClientes = users.filter(u => u.rol === 'cliente').length;
  const totalAdmins = users.filter(u => u.rol === 'admin').length;
  const totalVerificados = users.filter(u => u.verificado === 1).length;
  const totalIngresos = users.reduce((acc, u) => acc + parseFloat(u.gasto_total || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Clientes', value: totalClientes, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Administradores', value: totalAdmins, icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Cuentas Verificadas', value: totalVerificados, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Ingresos Totales', value: `$${totalIngresos.toFixed(2)}`, icon: DollarSign, color: 'text-pink-600', bg: 'bg-pink-50' },
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

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-gray-900">Clientes Registrados</h2>
            <p className="text-sm text-gray-400 font-medium mt-0.5">{filtered.length} usuarios encontrados</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
            />
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
                  <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pedidos</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Gasto Total</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rol</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-sm shrink-0">
                          {user.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.nombre}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.verificado ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> Verificado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <XCircle className="w-3 h-3" /> Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-gray-700">
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                        {user.total_pedidos}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-gray-900">${parseFloat(user.gasto_total).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black border uppercase tracking-wider ${roleBadge(user.rol)}`}>
                        {user.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {selectedUser === user.id ? (
                        <div className="flex items-center justify-end gap-2">
                          {['admin', 'cliente'].map(r => (
                            <button
                              key={r}
                              onClick={() => handleRoleChange(user.id, r)}
                              disabled={updatingId === user.id}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                user.rol === r
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                          <button onClick={() => setSelectedUser(null)} className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors">✕</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedUser(user.id)}
                          className="opacity-0 group-hover:opacity-100 px-4 py-1.5 bg-gray-100 hover:bg-purple-100 hover:text-purple-700 text-gray-600 rounded-lg text-xs font-bold transition-all"
                        >
                          Editar Rol
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-bold">Sin resultados para "{search}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
