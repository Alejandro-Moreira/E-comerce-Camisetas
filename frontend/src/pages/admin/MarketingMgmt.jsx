import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Megaphone, Tag, Zap, Bell, Star, Gift, BarChart2,
  Plus, Send, ToggleLeft, ToggleRight, Mail, TrendingUp, Users
} from 'lucide-react';

const CAMPANAS_MOCK = [
  { id: 1, nombre: 'Black Friday 2026', tipo: 'Descuento', descuento: '30%', activa: true,  inicio: '2026-11-25', fin: '2026-11-28', usos: 142 },
  { id: 2, nombre: 'Bienvenida Nuevo Cliente', tipo: 'Bundle', descuento: '2×1', activa: true,  inicio: '2026-01-01', fin: '2026-12-31', usos: 67 },
  { id: 3, nombre: 'Verano Exclusivo', tipo: 'Flash', descuento: '15%', activa: false, inicio: '2026-03-20', fin: '2026-04-01', usos: 28 },
];

const LOYALTY_MOCK = [
  { nivel: 'Bronce', minCompras: 1,  color: 'bg-amber-100 text-amber-700 border-amber-200',   beneficio: '5% descuento' },
  { nivel: 'Plata',  minCompras: 5,  color: 'bg-gray-100 text-gray-600 border-gray-200',       beneficio: '10% descuento + envío gratis' },
  { nivel: 'Oro',    minCompras: 10, color: 'bg-yellow-100 text-yellow-700 border-yellow-200', beneficio: '15% + acceso anticipado' },
  { nivel: 'VIP',    minCompras: 20, color: 'bg-purple-100 text-purple-700 border-purple-200', beneficio: '20% + producto regalo' },
];

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
    <div className={`p-3 rounded-xl ${bg} shrink-0`}><Icon className={`w-5 h-5 ${color}`} strokeWidth={2.5} /></div>
    <div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
    </div>
  </div>
);

export default function MarketingMgmt() {
  const [campanas, setCampanas] = useState(CAMPANAS_MOCK);
  const [tab, setTab] = useState('campanas');
  const [newsletter, setNewsletter] = useState({ asunto: '', cuerpo: '' });

  const toggleCampana = (id) => {
    setCampanas(prev => prev.map(c => c.id === id ? { ...c, activa: !c.activa } : c));
    toast.success('Estado de campaña actualizado');
  };

  const handleNewsletter = (e) => {
    e.preventDefault();
    toast.success('Newsletter enviado a todos los suscriptores ✉️');
    setNewsletter({ asunto: '', cuerpo: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Tag}       label="Campañas Activas" value={campanas.filter(c => c.activa).length} color="text-purple-600" bg="bg-purple-50" />
        <StatCard icon={BarChart2} label="Usos Totales"    value={campanas.reduce((a, c) => a + c.usos, 0)} color="text-blue-600"   bg="bg-blue-50" />
        <StatCard icon={Users}     label="Suscriptores"    value="284"  color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={TrendingUp} label="Conv. Cupones"  value="18.4%"color="text-pink-600"    bg="bg-pink-50" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'campanas',  label: 'Campañas y Ofertas' },
          { key: 'lealtad',   label: 'Programa de Lealtad' },
          { key: 'newsletter',label: 'Newsletter' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-sm font-bold transition-all border-b-2 -mb-px rounded-t-xl ${
              tab === t.key ? 'border-purple-600 text-purple-700 bg-purple-50' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Campañas */}
      {tab === 'campanas' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => toast('Crear nueva campaña — próximamente', { icon: '🎯' })}
              className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-700 transition-all shadow-md shadow-purple-500/20">
              <Plus className="w-4 h-4" /> Nueva Campaña
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {campanas.map((c) => (
              <div key={c.id} className={`bg-white rounded-2xl border shadow-sm p-6 flex flex-col gap-4 transition-all hover:shadow-md ${c.activa ? 'border-purple-100' : 'border-gray-100 opacity-70'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-black text-gray-900">{c.nombre}</p>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 mt-1 inline-block">{c.tipo}</span>
                  </div>
                  <button onClick={() => toggleCampana(c.id)} className="shrink-0 mt-0.5">
                    {c.activa
                      ? <ToggleRight className="w-8 h-8 text-purple-600" />
                      : <ToggleLeft className="w-8 h-8 text-gray-400" />}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-purple-600 to-pink-500 text-white rounded-xl px-4 py-2 text-xl font-black shadow-md">{c.descuento}</div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold">{c.inicio} → {c.fin}</p>
                    <p className="text-sm font-black text-gray-700 mt-0.5">{c.usos} usos registrados</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => toast(`Editar "${c.nombre}" — próximamente`, { icon: '✏️' })} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all">Editar</button>
                  <button onClick={() => toast(`Duplicar "${c.nombre}"`, { icon: '📋' })} className="flex-1 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition-all">Duplicar</button>
                </div>
              </div>
            ))}

            {/* Card Añadir */}
            <button onClick={() => toast('Nueva campaña — próximamente', { icon: '🎯' })}
              className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-6 flex flex-col items-center justify-center gap-3 text-center hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <p className="font-bold text-gray-400 text-sm">Nueva Campaña</p>
            </button>
          </div>
        </div>
      )}

      {/* Tab: Lealtad */}
      {tab === 'lealtad' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
              <h3 className="text-lg font-black">Sistema de Puntos T-Shirt SaaS</h3>
            </div>
            <p className="text-purple-100 text-sm font-medium">Premia a tus clientes más leales con descuentos exclusivos y beneficios especiales.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {LOYALTY_MOCK.map((nivel, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border mb-4 ${nivel.color}`}>{nivel.nivel}</span>
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-4 h-4 text-purple-400" />
                  <p className="text-sm font-bold text-gray-700">Desde {nivel.minCompras} compra{nivel.minCompras > 1 ? 's' : ''}</p>
                </div>
                <p className="text-sm font-black text-gray-900">{nivel.beneficio}</p>
                <button onClick={() => toast(`Editar nivel ${nivel.nivel} — próximamente`, { icon: '⭐' })} className="mt-4 w-full py-2 bg-gray-100 hover:bg-purple-100 hover:text-purple-700 text-gray-600 rounded-xl text-xs font-bold transition-all">Configurar</button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-black text-gray-900 mb-4">Reglas del Programa</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {[
                { label: 'Puntos por $1 gastado', val: '10 pts', icon: Zap },
                { label: '100 pts = Descuento $1', val: '$1.00',  icon: Tag },
                { label: 'Expiración de puntos',  val: '12 meses', icon: Bell },
              ].map((r, i) => {
                const Icon = r.icon;
                return (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-3">
                    <Icon className="w-5 h-5 text-purple-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{r.label}</p>
                      <p className="font-black text-gray-900 mt-0.5">{r.val}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Newsletter */}
      {tab === 'newsletter' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-5 h-5 text-purple-500" />
              <h3 className="font-black text-gray-900">Enviar Newsletter</h3>
            </div>
            <form onSubmit={handleNewsletter} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Asunto del Correo</label>
                <input
                  type="text" required
                  value={newsletter.asunto}
                  onChange={e => setNewsletter({ ...newsletter, asunto: e.target.value })}
                  placeholder="Ej: ¡Nuevos diseños disponibles esta semana! 👕"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Contenido del Mensaje</label>
                <textarea
                  required rows={7}
                  value={newsletter.cuerpo}
                  onChange={e => setNewsletter({ ...newsletter, cuerpo: e.target.value })}
                  placeholder="Escribe el cuerpo del newsletter aquí..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 resize-none"
                />
              </div>
              <button type="submit" className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-purple-700 transition-all shadow-md w-full justify-center">
                <Send className="w-4 h-4" /> Enviar a los 284 suscriptores
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-black text-gray-900 mb-4 text-sm">Estadísticas de Email</h3>
              {[
                { label: 'Tasa de apertura',    value: '42.1%', positive: true },
                { label: 'Tasa de clic',        value: '18.4%', positive: true },
                { label: 'Baja de suscripción', value: '1.2%',  positive: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <span className="text-sm font-medium text-gray-600">{s.label}</span>
                  <span className={`font-black text-base ${s.positive ? 'text-emerald-600' : 'text-red-500'}`}>{s.value}</span>
                </div>
              ))}
            </div>
            <div className="bg-purple-50 rounded-2xl border border-purple-100 p-5">
              <Bell className="w-5 h-5 text-purple-600 mb-2" />
              <p className="font-black text-purple-900 text-sm">Push Notifications</p>
              <p className="text-xs text-purple-600 font-medium mt-1">Integración con Web Push API disponible en Tanda 3.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
