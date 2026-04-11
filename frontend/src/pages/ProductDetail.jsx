import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import ReviewsModule from '../components/reviews/ReviewsModule';
import { CartContext } from '../context/CartContext';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    api.get(`/productos/${id}`)
      .then(res => {
        // Backend returns single object or nested depending on controller
        setProduct(res.data.data || res.data);
      })
      .catch(() => toast.error("Prenda no encontrada"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600 border-gray-200"></div></div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 text-center py-40 font-sans">
        <h2 className="text-3xl font-black text-gray-400">Producto sin clasificar.</h2>
        <Link to="/" className="text-purple-600 mt-4 block font-bold">Volver al catálogo</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, 'Única');
    toast.success(`${product.nombre} añadido a tu bóveda de compra`);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans pb-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link to="/" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Catálogo Principal
        </Link>
        
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row">
          {/* Visual Side */}
          <div className="md:w-1/2 min-h-[400px] bg-gray-100 flex justify-center items-center p-8">
             {product.imagen ? (
                <img src={product.imagen} alt={product.nombre} className="w-full h-full object-contain max-h-[500px]" />
              ) : (
                <div className="text-gray-300 font-bold">Sin Fotografía Base</div>
              )}
          </div>
          
          {/* Purchasing Context Side */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-4xl font-black text-gray-900 leading-tight mb-4">{product.nombre}</h1>
            <p className="text-3xl font-black text-purple-600 mb-6">${parseFloat(product.precio || 0).toFixed(2)}</p>
            <p className="text-gray-600 leading-relaxed mb-10 text-lg">
              {product.descripcion || 'Sin descripción provista por el artesano principal de la marca.'}
            </p>
            
            <button
               onClick={handleAddToCart}
               disabled={product.stock === 0}
               className="w-full py-4 bg-gray-900 text-white font-black text-lg rounded-2xl disabled:opacity-50 flex items-center justify-center hover:bg-black hover:shadow-lg hover:shadow-gray-900/20 transition-all hover:-translate-y-1"
            >
               <ShoppingBag className="w-6 h-6 mr-3" /> 
               {product.stock === 0 ? "Agotado en Base de Datos" : "Agregar a mi Colección"}
            </button>
            <p className="text-xs text-gray-400 font-bold text-center mt-4 uppercase tracking-widest">
              Stock actual: {product.stock} disponibles
            </p>
          </div>
        </div>

        {/* Integration Zone for Independent React Reviews Component */}
        <ReviewsModule productId={product.id} />
        
      </main>
    </div>
  );
}
