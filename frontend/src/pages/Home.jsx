import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { FavoritesContext } from '../context/FavoritesContext';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { ShoppingBag, Zap, Shirt, Heart, Phone, Mail, Clock, Info, Sparkles } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationType, setRecommendationType] = useState('global');
  const [loading, setLoading] = useState(true);
  const [selectedSizes, setSelectedSizes] = useState({});
  const { addToCart } = useContext(CartContext);
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);
  const { user } = useContext(AuthContext);

  const [searchParams] = useSearchParams();
  const rq = searchParams.get('q') || '';
  const tab = searchParams.get('tab') || 'todo';

  const [activeKeyword, setActiveKeyword] = useState('');

  useEffect(() => {
    api.get('/productos')
      .then(res => setProducts(res.data))
      .catch(() => toast.error("Catálogo Offline"))
      .finally(() => setLoading(false));
  }, []);

  // Motor Predictivo: carga recomendaciones basadas en historial de compras del usuario
  useEffect(() => {
    const userId = user?.id || 'null';
    api.get(`/productos/recommendations/${userId}`)
      .then(res => {
        setRecommendations(res.data?.products || res.data || []);
        setRecommendationType(res.data?.type || 'global');
      })
      .catch(() => {});
  }, [user]);

  const handleAddToCart = (product) => {
    const arrayTallas = product.talla ? product.talla.split(',').map(t => t.trim()).filter(Boolean) : ['Única'];
    const tallaEscogida = selectedSizes[product.id] || arrayTallas[0];
    addToCart(product, tallaEscogida);
    toast.success(`${product.nombre} añadido`, { icon: '🛍️', style: { borderRadius: '12px', background: '#333', color: '#fff', fontWeight: 'bold' } });
  };

  const currentTalla = (product) => selectedSizes[product.id] || (product.talla ? product.talla.split(',').map(t => t.trim()).filter(Boolean)[0] : 'Única');

  // SPA Logics:
  if (tab === 'servicio') {
    return (
      <div className="min-h-screen bg-transparent font-sans">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 animate-in fade-in duration-500">
          <div className="glass-panel p-12 rounded-3xl text-center">
            <Clock className="w-16 h-16 text-crystal-blue-600 mx-auto mb-6" />
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-4">Estamos para ayudarte</h2>
            <p className="text-lg text-gray-600 font-medium mb-10 max-w-xl mx-auto">Nuestro equipo táctico de soporte operativo resolverá tus dudas sobre tallas, envíos internacionales y reembolsos en minutos.</p>
            <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                <Phone className="w-8 h-8 text-pink-500 mb-3" />
                <span className="font-black text-xl text-gray-900">+593 900 123 456</span>
                <span className="text-sm font-bold text-gray-400 mt-1">Lunes a Viernes (08:00 - 18:00)</span>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                <Mail className="w-8 h-8 text-blue-500 mb-3" />
                <span className="font-black text-xl text-gray-900">soporte@tshirtsaas.com</span>
                <span className="text-sm font-bold text-gray-400 mt-1">Soporte Escrito 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Engine Filtros Dinámicos
  let filtered = [...products];

  // 1. Buscador Global
  if (rq) {
    const lp = rq.toLowerCase();
    filtered = filtered.filter(p => p.nombre.toLowerCase().includes(lp) || (p.descripcion && p.descripcion.toLowerCase().includes(lp)));
  }

  // 2. TABS
  if (tab === 'favoritos') {
    filtered = filtered.filter(p => isFavorite(p.id));
  } else if (tab === 'ofertas') {
    // Lógica visual: Las prendas de 22 dólares o menos entran a "Oferta Especial"
    filtered = filtered.filter(p => parseFloat(p.precio) <= 22);
  } else if (tab === 'categorias') {
    if (activeKeyword) {
      filtered = filtered.filter(p => p.nombre.toLowerCase().includes(activeKeyword) || (p.descripcion && p.descripcion.toLowerCase().includes(activeKeyword)));
    }
  }

  const renderProductCard = (product, isRecommendation = false) => {
    const rawPrice = parseFloat(product.precio);
    const isOferta = rawPrice <= 22;
    const arrayTallas = product.talla ? product.talla.split(',').map(t => t.trim()).filter(Boolean) : ['Única'];
    const fav = isFavorite(product.id);

    return (
      <div key={(isRecommendation ? 'rec-' : '') + product.id} className="flex flex-col glass-card rounded-[2rem] overflow-hidden relative group">

        {/* Me Gusta Flotante */}
        <button onClick={() => toggleFavorite(product.id)} className={`absolute top-4 right-4 z-30 p-2.5 rounded-full transition-all duration-300 shadow-sm border ${fav ? 'bg-white border-pink-200' : 'bg-white/40 border-white/50 hover:bg-white/60 backdrop-blur-md'}`}>
          <Heart className={`w-5 h-5 transition-colors ${fav ? 'fill-pink-500 text-pink-500 hover:scale-110' : 'text-gray-500'}`} />
        </button>

        {/* Badge Oferta Especial */}
        {isOferta && (
          <div className="absolute top-4 left-4 z-30 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">SALE </div>
        )}

        {/* Visual Link */}
        <Link to={`/producto/${product.id}`} className="block relative w-full h-72 bg-white/30 backdrop-blur-sm p-8 flex items-center justify-center group-hover:bg-white/40 transition-colors">
          {product.imagen ? (
            <img src={product.imagen} alt={product.nombre} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out" />
          ) : (
            <Shirt className="w-20 h-20 text-gray-200" />
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm z-20">
              <span className="bg-gray-900 text-white px-6 py-2 text-sm font-black tracking-widest uppercase rounded-full">AGOTADO</span>
            </div>
          )}
        </Link>
        
        {/* Datos */}
        <div className="p-6 sm:p-7 flex flex-col flex-grow bg-white/40 z-10 border-t border-white/40 backdrop-blur-md">
          <div className="flex-grow">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1.5">{product.color || 'Serie General'}</p>
            <Link to={`/producto/${product.id}`}>
              <h3 className="text-xl font-black text-gray-900 leading-tight mb-4 hover:text-crystal-blue-600 transition-colors">{product.nombre}</h3>
            </Link>

            <div className="bg-white/40 p-2 rounded-xl border border-white/50 focus-within:ring-2 focus-within:ring-crystal-blue-400 transition-all">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 px-1 block">Tamaño Físico</label>
              <select
                className="w-full bg-transparent text-sm font-bold text-gray-800 outline-none cursor-pointer px-1 py-1"
                value={currentTalla(product)}
                onChange={(e) => setSelectedSizes({ ...selectedSizes, [product.id]: e.target.value })}
              >
                {arrayTallas.map((t, idx) => <option key={idx} value={t}>Talla {t}</option>)}
              </select>
            </div>
          </div>

          {/* Comprar */}
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-end justify-between mb-1">
              <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest pb-1">Unidad</span>
              <p className="text-3xl font-black text-gray-900 tracking-tighter">
                <span className="text-sm text-purple-600 font-bold mr-0.5">$</span>{isNaN(rawPrice) ? '0.00' : rawPrice.toFixed(2)}
              </p>
            </div>

            <button
              onClick={() => handleAddToCart(product)}
              disabled={product.stock === 0}
              className="w-full glass-btn py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn"
            >
              <ShoppingBag className="w-5 h-5 group-hover/btn:scale-110 transition-transform" /> Agregar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-transparent font-sans">
      <Navbar />

      {/* Visual Dynamic Header depending on Tab */}
      {tab === 'todo' && !rq && (
        <div className="relative glass-panel mx-4 mt-6 rounded-[2rem] overflow-hidden shadow-lg shadow-crystal-blue-200/50">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-crystal-blue-300/30 to-transparent"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-16 flex flex-col items-start">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-crystal-blue-800 bg-white/60 mb-6 border border-white shadow-sm backdrop-blur-md">
              <Zap className="w-4 h-4 mr-2 text-crystal-blue-500" /> Catálogo en Vivo
            </span>
            <h1 className="text-5xl font-black tracking-tighter mb-4 text-gray-900 leading-[1.05]">
              Selección <span className="bg-clip-text text-transparent bg-gradient-to-r from-crystal-blue-500 to-sky-400">Premium</span>
            </h1>
          </div>
        </div>
      )}

      {tab === 'favoritos' && (
        <div className="glass-panel mx-4 mt-6 rounded-[2rem] shadow-lg shadow-pink-200/50 py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="w-20 h-20 bg-white/60 border border-white rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-sm">
              <Heart className="w-10 h-10 text-pink-500 fill-pink-500" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Tu Wishlist Personal</h1>
          </div>
        </div>
      )}

      {tab === 'ofertas' && (
        <div className="bg-amber-50/50 py-12 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-black text-amber-900 tracking-tight"> Flash Sale (-20%)</h1>
            <p className="font-bold text-amber-700 mt-3">Ropa en liquidación de fábrica a $22 USD o menos.</p>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {rq && <div className="mb-8 p-4 bg-gray-50 rounded-2xl flex border border-dashed border-gray-300 items-center justify-between"><span className="font-bold text-gray-700">🔍 Resultados para: <span className="text-purple-600 font-black">"{rq}"</span></span></div>}

        {/* Categories Chip Selector (A-Logic) */}
        {tab === 'categorias' && (
          <div className="mb-10 flex flex-wrap gap-3">
            <span className="py-2.5 font-bold text-gray-400 uppercase text-[10px] tracking-widest items-center flex mr-2">Categorías Disponibles  :</span>
            {['', 'Oversize', 'Básica', 'Deportivo', 'Street'].map(kw => (
              <button key={kw} onClick={() => setActiveKeyword(kw.toLowerCase())}
                className={`px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-all ${activeKeyword === kw.toLowerCase() ? 'bg-purple-600 text-white shadow-purple-500/30' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}>
                {kw === '' ? 'Todos' : kw}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600 border-gray-200"></div></div>
        ) : tab === 'favoritos' && !user ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300 animate-in fade-in">
            <h3 className="text-xl font-black text-gray-400 flex flex-col items-center justify-center gap-4"><Heart className="w-10 h-10" /> Inicia sesión para ver y gestionar tu Wishlist.</h3>
            <Link to="/login" className="mt-6 inline-flex bg-purple-600 text-white font-bold py-2 px-6 rounded-full hover:bg-purple-700 transition">Ir a Iniciar Sesión</Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300 animate-in fade-in">
            <h3 className="text-xl font-black text-gray-400 flex flex-col items-center justify-center gap-4"><Info className="w-10 h-10" /> Vacío. Intenta con otro término.</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom-6 duration-700">
            {filtered.map(product => renderProductCard(product, false))}
          </div>
        )}

        {/* === RIEL DE RECOMENDACIONES === */}
        {tab === 'todo' && !rq && recommendations.length > 0 && (
          <div className="mt-16 border-t border-gray-100 pt-10">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {recommendationType === 'personalized' ? 'Recomendado según tus compras' : 'Tendencias del Momento'}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendations.map(product => renderProductCard(product, true))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
