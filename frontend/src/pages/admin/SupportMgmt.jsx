import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  HeadphonesIcon, MessageSquare, Star, ThumbsUp, ThumbsDown,
  Search, CheckCircle, Clock, AlertCircle, Shirt
} from 'lucide-react';

const TICKETS_MOCK = [
  { id: 'TKT-001', cliente: 'Ana Torres',    email: 'ana@email.com',  asunto: 'Mi pedido aún no llega',           prioridad: 'Alta',  estado: 'Abierto',      fecha: '2026-04-03', avatar: 'A' },
  { id: 'TKT-002', cliente: 'Carlos Vera',   email: 'cv@email.com',   asunto: 'Talla incorrecta enviada',         prioridad: 'Alta',  estado: 'En Progreso',  fecha: '2026-04-02', avatar: 'C' },
  { id: 'TKT-003', cliente: 'María López',   email: 'ml@email.com',   asunto: '¿Cuándo llega mi reembolso?',      prioridad: 'Media', estado: 'En Progreso',  fecha: '2026-04-01', avatar: 'M' },
  { id: 'TKT-004', cliente: 'Juan Morales',  email: 'jm@email.com',   asunto: 'Código de descuento no funciona',  prioridad: 'Baja',  estado: 'Resuelto',     fecha: '2026-03-30', avatar: 'J' },
  { id: 'TKT-005', cliente: 'Lucía Paredes', email: 'lp@email.com',   asunto: 'Quiero cambiar talla a XL',        prioridad: 'Baja',  estado: 'Resuelto',     fecha: '2026-03-29', avatar: 'L' },
];

const RESENAS_MOCK = [
  { id: 1, cliente: 'Ana Torres',  producto: 'Camiseta Oversize Noir',   rating: 5, comentario: 'Calidad excelente, llegó en perfectas condiciones. Super recomendada.', fecha: '2026-04-02', aprobada: true },
  { id: 2, cliente: 'Carlos Vera', producto: 'Camiseta Básica Classic',  rating: 4, comentario: 'Buen producto pero la talla M me quedó un poco ajustada.', fecha: '2026-04-01', aprobada: true },
  { id: 3, cliente: 'Pedro Silva', producto: 'Camiseta Oversize Blanco', rating: 2, comentario: 'El color no era exactamente como en la foto.', fecha: '2026-04-01', aprobada: false },
];

const prioridadBadge = (p) => ({
  Alta:  'bg-red-100 text-red-700 border-red-200',
  Media: 'bg-amber-100 text-amber-700 border-amber-200',
  Baja:  'bg-gray-100 text-gray-500 border-gray-200',
}[p] || 'bg-gray-100 text-gray-500 border-gray-200');

const estadoBadge = (e) => ({
  'Abierto':      { classes: 'bg-red-100 text-red-700 border-red-200',             icon: AlertCircle },
  'En Progreso':  { classes: 'bg-amber-100 text-amber-700 border-amber-200',       icon: Clock },
  'Resuelto':     { classes: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
}[e] || { classes: 'bg-gray-100 text-gray-500 border-gray-200', icon: Clock });

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
    ))}
  </div>
);

export default function SupportMgmt() {
  const [tickets, setTickets]   = useState(TICKETS_MOCK);
  const [resenas, setResenas]   = useState(RESENAS_MOCK);
  const [tab, setTab]           = useState('tickets');
  const [search, setSearch]     = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply]       = useState('');

  const abiertos   = tickets.filter(t => t.estado === 'Abierto').length;
  const enProgreso = tickets.filter(t => t.estado === 'En Progreso').length;
  const resueltos  = tickets.filter(t => t.estado === 'Resuelto').length;
  const avgRating  = (resenas.reduce((a, r) => a + r.rating, 0) / resenas.length).toFixed(1);

  const filteredTickets = tickets
    .filter(t =>
      t.cliente.toLowerCase().includes(search.toLowerCase()) ||
      t.asunto.toLowerCase().includes(search.toLowerCase())
    )
    .filter(t => filterEstado === 'todos' || t.estado === filterEstado);

  const resolveTicket = (id) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, estado: 'Resuelto' } : t));
    setSelectedTicket(null);
    toast.success('Ticket marcado como resuelto ✅');
  };

  const handleReply = (e) => {
    e.preventDefault();
    toast.success('Respuesta enviada al cliente ✉️');
    setReply('');
  };

  const toggleResena = (id) => {
    setResenas(prev => prev.map(r => r.id === id ? { ...r, aprobada: !r.aprobada } : r));
    toast.success('Estado de reseña actualizado');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tickets Abiertos', value: abiertos,   icon: AlertCircle, color: 'text-red-600',    bg: 'bg-red-50' },
          { label: 'En Progreso',      value: enProgreso,  icon: Clock,       color: 'text-amber-600',  bg: 'bg-amber-50' },
          { label: 'Resueltos',        value: resueltos,   icon: CheckCircle, color: 'text-emerald-600',bg: 'bg-emerald-50' },
          { label: 'Rating Promedio',  value: `${avgRating} ★`, icon: Star,  color: 'text-yellow-600', bg: 'bg-yellow-50' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all">
              <div className={`p-3 rounded-xl ${s.bg} shrink-0`}>
                <Icon className={`w-5 h-5 ${s.color}`} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'tickets', label: 'Tickets de Soporte' },
          { key: 'resenas', label: 'Reseñas de Productos' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-sm font-bold transition-all border-b-2 -mb-px rounded-t-xl ${
              tab === t.key
                ? 'border-purple-600 text-purple-700 bg-purple-50'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}>
            {t.label}
            {t.key === 'tickets' && abiertos > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{abiertos}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Tickets */}
      {tab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Lista de tickets */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 font-medium"
                />
              </div>
              <select
                value={filterEstado}
                onChange={e => setFilterEstado(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 bg-gray-50 focus:outline-none"
              >
                <option value="todos">Todos</option>
                <option value="Abierto">Abiertos</option>
                <option value="En Progreso">En Progreso</option>
                <option value="Resuelto">Resueltos</option>
              </select>
            </div>

            <div className="space-y-2">
              {filteredTickets.map(t => {
                const { classes } = estadoBadge(t.estado);
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`w-full text-left bg-white rounded-2xl border shadow-sm p-4 hover:shadow-md transition-all ${
                      selectedTicket?.id === t.id ? 'border-purple-300 ring-2 ring-purple-100' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-sm shrink-0">
                        {t.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className="text-xs font-black text-purple-600">{t.id}</p>
                          <span className={`text-[9px] font-black uppercase border px-1.5 py-0.5 rounded-full ${classes}`}>{t.estado}</span>
                        </div>
                        <p className="font-bold text-gray-900 text-sm truncate">{t.asunto}</p>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">{t.cliente} · {t.fecha}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredTickets.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <HeadphonesIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-bold">Sin tickets</p>
                </div>
              )}
            </div>
          </div>

          {/* Detalle del ticket */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-black text-purple-600">{selectedTicket.id}</span>
                      <span className={`text-[10px] font-black uppercase border px-2 py-0.5 rounded-full ${prioridadBadge(selectedTicket.prioridad)}`}>
                        {selectedTicket.prioridad}
                      </span>
                    </div>
                    <h3 className="font-black text-gray-900">{selectedTicket.asunto}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">{selectedTicket.cliente} · {selectedTicket.email}</p>
                  </div>
                  {selectedTicket.estado !== 'Resuelto' && (
                    <button
                      onClick={() => resolveTicket(selectedTicket.id)}
                      className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shrink-0"
                    >
                      <CheckCircle className="w-4 h-4" /> Resolver
                    </button>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-xs">
                        {selectedTicket.avatar}
                      </div>
                      <span className="text-sm font-black text-gray-900">{selectedTicket.cliente}</span>
                      <span className="text-xs text-gray-400">{selectedTicket.fecha}</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      {selectedTicket.asunto}. Por favor necesito ayuda con esto urgentemente. Llevo esperando varios días y no tengo novedades.
                    </p>
                  </div>

                  <form onSubmit={handleReply} className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Tu Respuesta</label>
                    <textarea
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      rows={4}
                      placeholder="Escribe tu respuesta al cliente..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 resize-none"
                    />
                    <button type="submit" className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-700 transition-all">
                      <MessageSquare className="w-4 h-4" /> Enviar Respuesta
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-64 flex flex-col items-center justify-center gap-3 text-gray-400">
                <HeadphonesIcon className="w-12 h-12 opacity-30" />
                <p className="font-bold">Selecciona un ticket para responder</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Reseñas */}
      {tab === 'resenas' && (
        <div className="space-y-4">
          {resenas.map(r => (
            <div
              key={r.id}
              className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col sm:flex-row gap-4 transition-all hover:shadow-md ${
                !r.aprobada ? 'opacity-60 border-dashed' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-sm shrink-0">
                  {r.cliente.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-black text-gray-900 text-sm">{r.cliente}</span>
                    <StarRating rating={r.rating} />
                    <span className="text-xs text-gray-400">{r.fecha}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Shirt className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-bold text-gray-500">{r.producto}</span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{r.comentario}</p>
                </div>
              </div>
              <div className="flex sm:flex-col gap-2 shrink-0">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border self-start ${
                  r.aprobada ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}>
                  {r.aprobada ? 'Publicada' : 'Oculta'}
                </span>
                <button
                  onClick={() => toggleResena(r.id)}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                    r.aprobada
                      ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}
                >
                  {r.aprobada
                    ? <><ThumbsDown className="w-3.5 h-3.5" /> Ocultar</>
                    : <><ThumbsUp className="w-3.5 h-3.5" /> Aprobar</>
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
