import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import StarRating from '../ui/StarRating';
import { X, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function PostPurchaseReviewModal({ items, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Group items by product ID (since user can only leave one review per product, even if different sizes)
  const uniqueProductsMap = new Map();
  items.forEach(item => {
    if (!uniqueProductsMap.has(item.id)) {
      uniqueProductsMap.set(item.id, item);
    }
  });
  const productsToReview = Array.from(uniqueProductsMap.values());

  const currentProduct = productsToReview[currentIndex];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      return toast.error("Por favor selecciona una calificación válida entre 1 y 5 estrellas.");
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/reviews`, {
        productId: currentProduct.id,
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      toast.success(`Reseña enviada para ${currentProduct.nombre}`);
      
      // Pasar al siguiente producto o cerrar si es el último
      if (currentIndex + 1 < productsToReview.length) {
        setCurrentIndex(currentIndex + 1);
        setRating(0);
        setComment("");
      } else {
        toast.success("¡Gracias por reseñar tu compra!", { icon: '🌟' });
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Algo salió mal enviando la reseña");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (currentIndex + 1 < productsToReview.length) {
      setCurrentIndex(currentIndex + 1);
      setRating(0);
      setComment("");
    } else {
      onClose();
    }
  };

  if (!currentProduct) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-slide-up">
        
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-purple-600 to-crystal-blue-500 p-6 text-white text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-white/90" />
          <h2 className="text-2xl font-black tracking-tight">¡Pedido Exitoso!</h2>
          <p className="text-sm font-medium mt-1 text-white/90">¿Te gustaría reseñar tu compra?</p>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6 p-3 bg-gray-50 rounded-2xl border border-gray-100">
            {currentProduct.imagen ? (
              <img src={currentProduct.imagen} alt={currentProduct.nombre} className="w-16 h-16 object-contain mix-blend-multiply" />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
            )}
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Producto {currentIndex + 1} de {productsToReview.length}</p>
              <h3 className="font-bold text-gray-900 leading-tight">{currentProduct.nombre}</h3>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-5 text-center">
              <label className="block text-gray-600 mb-3 font-medium text-sm">¿Cómo calificarías este producto?</label>
              <div className="flex justify-center">
                <StarRating rating={rating} onRatingChange={setRating} sizeClass="w-10 h-10" />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-600 mb-2 font-medium text-sm">Comentario (opcional)</label>
              <textarea 
                rows="3" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none resize-none text-sm"
                placeholder="¿Qué te pareció?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
            </div>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={handleSkip}
                className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Omitir
              </button>
              <button 
                type="submit" 
                disabled={submitting || rating === 0}
                className="flex-[2] py-3 bg-gray-900 text-white font-bold rounded-xl shadow-md hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Enviando...' : 'Publicar Reseña'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
