import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Trash2, ShoppingCart, MapPin, Truck, Plus, Minus, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

// Clave pública de prueba
const stripePromise = loadStripe('pk_test_reemplazar_por_tu_api_key_de_prueba');

// Costo de logística fijo ($5.00)
const FRACTION_LOGISTICS = 5.00;

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  
  // Estados para envío local
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [pais, setPais] = useState('Ecuador');
  const [loading, setLoading] = useState(false);

  const totalProductos = getCartTotal();
  const totalFacturar = cart.length > 0 ? totalProductos + FRACTION_LOGISTICS : 0.00;

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para comprar');
      return;
    }
    if (cart.length === 0) return;
    if (!direccion || !ciudad || !pais) {
      toast.error('Llena por favor los campos de dirección de envío', { icon: '🚚' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const data = await api.post('/pedidos/create', { 
        items: cart.map(c => ({ id: c.id, cantidad: c.cantidad, precio: c.precio, talla: c.tallaSelec })),
        total: totalFacturar,
        direccion, ciudad, pais
      });

      if (data.clientSecret) {
         // Lógica reservada para Stripe (cuando esté lista la API KEY)
         const stripe = await stripePromise;
         toast.success("Redirigiendo a pasarela segura...", { icon: '💳' });
         // ... (stripe confirm)
         toast.success('Pedido registrado para pasarela externa.');
      } else {
         toast.success('Pedido procesado con éxito (Modo Pruebas).', {
           style: { border: '1px solid #10b981', padding: '16px', color: '#065f46', background: '#ecfdf5' },
           icon: '🎉'
         });
         clearCart();
      }
    } catch (err) {
      toast.error(err.message || 'Falló la creación del pedido');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-transparent relative">
         <Link to="/" className="absolute top-8 left-8 sm:left-12 inline-flex items-center text-sm font-bold text-gray-600 hover:text-crystal-blue-700 transition-colors"><ArrowRight className="w-5 h-5 mr-2 rotate-180"/> Seguir Comprando</Link>
         <div className="glass-panel p-12 rounded-[2rem] flex flex-col items-center max-w-md w-full text-center">
            <div className="w-24 h-24 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center mb-6 border border-white/50 shadow-sm">
               <ShoppingCart className="w-10 h-10 text-crystal-blue-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Tu cesta está vacía</h2>
            <p className="text-gray-700 font-medium mb-8">Descubre la colección de alta gama y añade tu primera prenda.</p>
            <a href="/" className="px-8 py-3.5 glass-btn font-bold rounded-xl active:scale-95">Explorar Catálogo</a>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-8 sm:py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Columna Izquierda: Listado de Productos */}
        <div className="flex-grow space-y-6">
          <Link to="/" className="inline-flex items-center text-sm font-bold text-gray-600 hover:text-crystal-blue-700 transition-colors mb-2"><ArrowRight className="w-4 h-4 mr-1 rotate-180"/> Seguir Explorando</Link>
          <div className="flex items-center gap-3 mb-2">
             <h1 className="text-3xl font-black text-gray-900 tracking-tight">Cesta de Compras</h1>
             <span className="bg-white/40 border border-white/50 text-gray-800 px-3 py-1 rounded-full text-sm font-bold shadow-sm">{cart.length} prendas</span>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden divide-y divide-white/20">
            {cart.map((item, index) => (
              <div key={item.cartId || `${item.id}-${index}`} className="flex flex-col sm:flex-row items-center p-6 gap-6 hover:bg-white/20 transition-colors group">
                <div className="w-24 h-24 bg-white/40 backdrop-blur-md rounded-2xl flex-shrink-0 border border-white/50 p-2 overflow-hidden flex items-center justify-center shadow-sm">
                   {item.imagen ? <img src={item.imagen} alt={item.nombre} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"/> : <ShoppingCart className="text-crystal-blue-300 w-8 h-8"/>}
                </div>
                
                <div className="flex-grow flex flex-col sm:flex-row justify-between w-full">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-lg font-black text-gray-900 leading-tight group-hover:text-crystal-blue-800 transition-colors">{item.nombre}</h3>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1">Variante Exacta Elegida</p>
                    <div className="flex gap-2 mt-2">
                       <span className="bg-crystal-blue-100 text-crystal-blue-800 text-xs font-black px-3 py-1 rounded-md border border-crystal-blue-200">Talla {item.tallaSelec}</span>
                       <span className="bg-white/50 text-gray-700 text-xs font-bold px-3 py-1 rounded-md border border-white/50 capitalize">{item.color}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 sm:gap-10 sm:justify-end">
                    <div className="flex items-center bg-white/40 rounded-xl border border-white/50 p-1 shadow-sm">
                      <button onClick={() => updateQuantity(item.cartId, item.cantidad - 1)} className="p-2 hover:bg-white/60 rounded-lg transition-all text-gray-700"><Minus className="w-4 h-4" /></button>
                      <span className="w-8 text-center font-black text-gray-900 text-sm select-none">{item.cantidad}</span>
                      <button onClick={() => updateQuantity(item.cartId, item.cantidad + 1)} className="p-2 hover:bg-white/60 rounded-lg transition-all text-gray-700"><Plus className="w-4 h-4" /></button>
                    </div>
                    
                    <div className="text-right flex flex-col sm:items-end w-24">
                      <span className="text-sm font-bold text-gray-500 line-through decoration-gray-400">${(parseFloat(item.precio) * 1.25).toFixed(2)}</span>
                      <span className="text-xl font-black text-gray-900 tracking-tighter">${parseFloat(item.precio).toFixed(2)}</span>
                    </div>
                    
                    <button onClick={() => removeFromCart(item.cartId)} className="text-gray-500 hover:text-red-500 transition-colors p-2 hover:bg-white/50 border border-transparent hover:border-red-200 rounded-xl">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columna Derecha: Formulario & Resumen */}
        <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col gap-6">
           
           {/* Widget Dirección */}
           <div className="glass-panel rounded-3xl p-6 sm:p-8">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 mb-6 tracking-tight"><MapPin className="text-crystal-blue-600 w-5 h-5"/> Destino Logístico</h2>
              
              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black tracking-widest text-gray-600 uppercase">Avenida, Calle e Intersección</label>
                    <input type="text" value={direccion} onChange={e=>setDireccion(e.target.value)} required placeholder="Ej: Av. Principal 123" className="w-full mt-1 px-4 py-3 glass-input rounded-xl text-sm"/>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex-1">
                       <label className="text-[10px] font-black tracking-widest text-gray-600 uppercase">Ciudad</label>
                       <input type="text" value={ciudad} onChange={e=>setCiudad(e.target.value)} required placeholder="Ej: Quito" className="w-full mt-1 px-4 py-3 glass-input rounded-xl text-sm"/>
                    </div>
                    <div className="flex-1">
                       <label className="text-[10px] font-black tracking-widest text-gray-600 uppercase">País</label>
                       <input type="text" value={pais} onChange={e=>setPais(e.target.value)} required className="w-full mt-1 px-4 py-3 glass-input rounded-xl text-sm"/>
                    </div>
                 </div>
              </div>
           </div>

           {/* Resumen Monetario */}
           <div className="glass-panel rounded-3xl p-6 sm:p-8 sticky top-24">
              <h2 className="text-lg font-black text-gray-900 mb-6 tracking-tight">Resumen Financiero</h2>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between items-center text-gray-700 font-medium">
                  <span>Subtotal Ropa</span>
                  <span className="font-bold text-gray-900">${totalProductos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700 font-medium pb-4 border-b border-white/20">
                  <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-crystal-blue-600"/> Envio Plano (Nacional)</span>
                  <span className="font-bold text-gray-900">${FRACTION_LOGISTICS.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-end pt-2">
                  <span className="text-base font-black text-gray-900">Monto Afecto (Total)</span>
                  <div className="text-right">
                    <span className="block text-3xl font-black text-crystal-blue-700 tracking-tighter leading-none">${totalFacturar.toFixed(2)}</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1 block">Impuestos incluidos USD</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCheckout} 
                disabled={loading}
                className="w-full glass-btn py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait group"
              >
                {loading ? 'Certificando conexión...' : 'Proceder al Pago Seguro'} 
                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>}
              </button>
              
              <p className="text-center text-[10px] text-gray-600 mt-4 font-bold uppercase tracking-widest leading-relaxed">
                 Al procesar, aceptas nuestras Políticas de Devolución. Conexión Cifrada SSL 256-bit.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}
