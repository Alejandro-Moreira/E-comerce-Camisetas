import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Settings, CreditCard, Globe, FileText, Truck, Percent, Save, Store, Shield } from 'lucide-react';

const METODOS_PAGO = [
  { id: 'stripe', nombre: 'Stripe', activo: true, logo: '💳', estado: 'Conectado' },
  { id: 'paypal', nombre: 'PayPal', activo: false, logo: '🅿️', estado: 'No configurado' },
  { id: 'transfer', nombre: 'Transferencia Bancaria', activo: false, logo: '🏦', estado: 'No configurado' },
];

const TARIFAS_ENVIO = [
  { pais: 'Ecuador (local)', tarifa: '$0.00', tiempo: 'Mismo día' },
  { pais: 'Ecuador (nacional)', tarifa: '$4.50', tiempo: '2-3 días' },
  { pais: 'Colombia / Perú', tarifa: '$9.00', tiempo: '4-6 días' },
  { pais: 'Estados Unidos', tarifa: '$18.00', tiempo: '7-12 días' },
  { pais: 'Europa', tarifa: '$22.00', tiempo: '10-15 días' },
];

export default function StoreSettings() {
  const [tab, setTab] = useState('general');
  const [config, setConfig] = useState({
    nombreTienda: 'T-Shirt SaaS',
    email: 'soporte@tshirtsaas.com',
    telefono: '+593 900 123 456',
    moneda: 'USD',
    idioma: 'Español',
    iva: '12',
    envioGratis: '50',
    politicaDevolucion: 'Aceptamos devoluciones dentro de los 30 días posteriores a la entrega. El producto debe estar en su embalaje original y sin uso.',
    terminosCondiciones: 'Al realizar una compra en T-Shirt SaaS, el cliente acepta nuestros términos de servicio y política de privacidad.',
  });
  const [pagos, setPagos] = useState(METODOS_PAGO);

  const handleSave = (seccion) => {
    toast.success(`Configuración de ${seccion} guardada correctamente ✅`);
  };

  const togglePago = (id) => {
    setPagos(prev => prev.map(p => p.id === id ? { ...p, activo: !p.activo } : p));
    toast.success('Método de pago actualizado');
  };

  const tabs = [
    { key: 'general',   label: 'General',  icon: Store },
    { key: 'pagos',     label: 'Pagos',    icon: CreditCard },
    { key: 'envio',     label: 'Envíos',   icon: Truck },
    { key: 'impuestos', label: 'Impuestos',icon: Percent },
    { key: 'politicas', label: 'Políticas',icon: FileText },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex flex-wrap gap-1">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t.key ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* General */}
      {tab === 'general' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-black text-gray-900">Información de la Tienda</h3>
            <p className="text-sm text-gray-400 mt-0.5 font-medium">Datos generales visibles para tus clientes</p>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { label: 'Nombre de la Tienda', key: 'nombreTienda', type: 'text', icon: Store },
              { label: 'Email de Soporte',   key: 'email',         type: 'email', icon: Globe },
              { label: 'Teléfono',           key: 'telefono',      type: 'text', icon: Shield },
              { label: 'Moneda',             key: 'moneda',        type: 'text', icon: CreditCard },
            ].map(f => {
              const Icon = f.icon;
              return (
                <div key={f.key}>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">{f.label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={f.type}
                      value={config[f.key]}
                      onChange={e => setConfig({ ...config, [f.key]: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-6 border-t border-gray-100 flex justify-end">
            <button onClick={() => handleSave('general')} className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-700 transition-all shadow-md">
              <Save className="w-4 h-4" /> Guardar Cambios
            </button>
          </div>
        </div>
      )}

      {/* Pagos */}
      {tab === 'pagos' && (
        <div className="space-y-4">
          {pagos.map(p => (
            <div key={p.id} className={`bg-white rounded-2xl border shadow-sm p-5 flex items-center justify-between gap-4 transition-all hover:shadow-md ${p.activo ? 'border-purple-100' : 'border-gray-100'}`}>
              <div className="flex items-center gap-4">
                <span className="text-3xl">{p.logo}</span>
                <div>
                  <p className="font-black text-gray-900">{p.nombre}</p>
                  <p className={`text-xs font-bold mt-0.5 ${p.activo ? 'text-emerald-600' : 'text-gray-400'}`}>{p.estado}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => toast(`Configurar ${p.nombre} — conectar con API de pagos`, { icon: '💳' })}
                  className="text-xs font-bold text-purple-600 hover:text-purple-800 px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all">
                  Configurar
                </button>
                <button onClick={() => togglePago(p.id)}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${p.activo ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                  {p.activo ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Envíos */}
      {tab === 'envio' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-black text-gray-900">Tarifas de Envío</h3>
              <p className="text-sm text-gray-400 mt-0.5 font-medium">Configura los costos por región</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Envío Gratis desde</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-black text-gray-700">$</span>
                <input
                  type="number"
                  value={config.envioGratis}
                  onChange={e => setConfig({ ...config, envioGratis: e.target.value })}
                  className="w-20 text-center border border-gray-200 rounded-xl py-2 text-sm font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Destino</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tarifa Base</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tiempo Estimado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {TARIFAS_ENVIO.map((t, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{t.pais}</td>
                    <td className="px-6 py-4 font-black text-purple-700">{t.tarifa}</td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{t.tiempo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 border-t border-gray-100 flex justify-end">
            <button onClick={() => handleSave('envíos')} className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-700 transition-all shadow-md">
              <Save className="w-4 h-4" /> Guardar Tarifas
            </button>
          </div>
        </div>
      )}

      {/* Impuestos */}
      {tab === 'impuestos' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div>
            <h3 className="font-black text-gray-900 mb-1">Configuración de Impuestos</h3>
            <p className="text-sm text-gray-400 font-medium">Define el IVA aplicable a los productos</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">IVA (%)</label>
              <input
                type="number" min="0" max="30"
                value={config.iva}
                onChange={e => setConfig({ ...config, iva: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Tipo de Impuesto</label>
              <select className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>Incluido en el precio</option>
                <option>Excluido del precio</option>
                <option>Exento</option>
              </select>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-bold text-amber-800">⚠️ Ecuador: El IVA estándar actualmente es del 15%. Verifica con tu contador antes de cambiar.</p>
          </div>
          <div className="flex justify-end">
            <button onClick={() => handleSave('impuestos')} className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-700 transition-all shadow-md">
              <Save className="w-4 h-4" /> Guardar Impuestos
            </button>
          </div>
        </div>
      )}

      {/* Políticas */}
      {tab === 'politicas' && (
        <div className="space-y-4">
          {[
            { key: 'politicaDevolucion', label: 'Política de Devoluciones', icon: Truck },
            { key: 'terminosCondiciones', label: 'Términos y Condiciones', icon: FileText },
          ].map(p => {
            const Icon = p.icon;
            return (
              <div key={p.key} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                  <Icon className="w-5 h-5 text-purple-500" />
                  <h3 className="font-black text-gray-900">{p.label}</h3>
                </div>
                <div className="p-5">
                  <textarea
                    rows={5}
                    value={config[p.key]}
                    onChange={e => setConfig({ ...config, [p.key]: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 resize-none"
                  />
                </div>
                <div className="p-5 border-t border-gray-100 flex justify-end">
                  <button onClick={() => handleSave(p.label)} className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-700 transition-all shadow-md">
                    <Save className="w-4 h-4" /> Guardar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
