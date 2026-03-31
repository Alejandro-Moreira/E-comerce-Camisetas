import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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
      // Enviar items adaptando talla y el nuevo total (Productos + Envío)
      const { data } = await axios.post('http://localhost:3002/api/pedidos/create', { 
        items: cart.map(c => ({ id: c.id, cantidad: c.cantidad, precio: c.precio, talla: c.tallaSelec })),
        total: totalFacturar,
        direccion, ciudad, pais
      }, {
        headers: { Authorization: `Bearer ${token}` }
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
      toast.error(err.response?.data?.error || 'Falló la creación del pedido');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-gray-50/50 relative">
         <Link to="/" className="absolute top-8 left-8 sm:left-12 inline-flex items-center text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors"><ArrowRight className="w-5 h-5 mr-2 rotate-180"/> Seguir Comprando</Link>
         <div className="bg-white p-12 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center max-w-md w-full text-center">
            <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
               <ShoppingCart className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Tu cesta está vacía</h2>
            <p className="text-gray-500 font-medium mb-8">Descubre la colección de alta gama y añade tu primera prenda.</p>
            <a href="/" className="px-8 py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-purple-600 transition-all shadow-md active:scale-95">Explorar Catálogo</a>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8 sm:py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Columna Izquierda: Listado de Productos */}
        <div className="flex-grow space-y-6">
          <Link to="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors mb-2"><ArrowRight className="w-4 h-4 mr-1 rotate-180"/> Seguir Explorando</Link>
          <div className="flex items-center gap-3 mb-2">
             <h1 className="text-3xl font-black text-gray-900 tracking-tight">Cesta de Compras</h1>
             <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">{cart.length} prendas</span>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
            {cart.map((item, index) => (
              <div key={item.cartId || `${item.id}-${index}`} className="flex flex-col sm:flex-row items-center p-6 gap-6 hover:bg-gray-50/50 transition-colors group">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl flex-shrink-0 border border-gray-200 p-2 overflow-hidden flex items-center justify-center">
                   {item.imagen ? <img src={item.imagen} alt={item.nombre} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"/> : <ShoppingCart className="text-gray-300 w-8 h-8"/>}
                </div>
                
                <div className="flex-grow flex flex-col sm:flex-row justify-between w-full">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-lg font-black text-gray-900 leading-tight group-hover:text-purple-700 transition-colors">{item.nombre}</h3>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Variante Exacta Elegida</p>
                    <div className="flex gap-2 mt-2">
                       <span className="bg-purple-100 text-purple-800 text-xs font-black px-3 py-1 rounded-md border border-purple-200">Talla {item.tallaSelec}</span>
                       <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-md border border-gray-200 capitalize">{item.color}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 sm:gap-10 sm:justify-end">
                    <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 p-1">
                      <button onClick={() => updateQuantity(item.cartId, item.cantidad - 1)} className="p-2 hover:bg-white rounded-lg hover:shadow-sm transition-all text-gray-600 hover:text-gray-900"><Minus className="w-4 h-4" /></button>
                      <span className="w-8 text-center font-black text-gray-900 text-sm select-none">{item.cantidad}</span>
                      <button onClick={() => updateQuantity(item.cartId, item.cantidad + 1)} className="p-2 hover:bg-white rounded-lg hover:shadow-sm transition-all text-gray-600 hover:text-gray-900"><Plus className="w-4 h-4" /></button>
                    </div>
                    
                    <div className="text-right flex flex-col sm:items-end w-24">
                      <span className="text-sm font-bold text-gray-400 line-through decoration-gray-300">${(parseFloat(item.precio) * 1.25).toFixed(2)}</span>
                      <span className="text-xl font-black text-gray-900 tracking-tighter">${parseFloat(item.precio).toFixed(2)}</span>
                    </div>
                    
                    <button onClick={() => removeFromCart(item.cartId)} className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-xl active:bg-red-100">
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
           <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 mb-6 tracking-tight"><MapPin className="text-purple-600 w-5 h-5"/> Destino Logístico</h2>
              
              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Avenida, Calle e Intersección</label>
                    <input type="text" value={direccion} onChange={e=>setDireccion(e.target.value)} required placeholder="Ej: Av. Principal 123" className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm transition-all"/>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex-1">
                       <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Ciudad</label>
                       <input type="text" value={ciudad} onChange={e=>setCiudad(e.target.value)} required placeholder="Ej: Quito" className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm transition-all"/>
                    </div>
                    <div className="flex-1">
                       <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">País</label>
                       <input type="text" value={pais} onChange={e=>setPais(e.target.value)} required className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium text-sm transition-all"/>
                    </div>
                 </div>
              </div>
           </div>

           {/* Resumen Monetario */}
           <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 sticky top-24">
              <h2 className="text-lg font-black text-gray-900 mb-6 tracking-tight">Resumen Financiero</h2>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between items-center text-gray-600 font-medium">
                  <span>Subtotal Ropa</span>
                  <span className="font-bold text-gray-900">${totalProductos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600 font-medium pb-4 border-b border-gray-100">
                  <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-purple-600"/> Envio Plano (Courier Nacional)</span>
                  <span className="font-bold text-gray-900">${FRACTION_LOGISTICS.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-end pt-2">
                  <span className="text-base font-black text-gray-900">Monto Afecto (Total)</span>
                  <div className="text-right">
                    <span className="block text-3xl font-black text-purple-600 tracking-tighter leading-none">${totalFacturar.toFixed(2)}</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1 block">Impuestos incluidos USD</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCheckout} 
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-purple-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-wait transition-all active:scale-95 group"
              >
                {loading ? 'Certificando conexión segura...' : 'Proceder al Pago Seguro'} 
                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>}
              </button>
              
              <p className="text-center text-[10px] text-gray-400 mt-4 font-bold uppercase tracking-widest leading-relaxed">
                 Al procesar, aceptas nuestras Políticas de Devolución. Conexión Cifrada SSL 256-bit.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}
