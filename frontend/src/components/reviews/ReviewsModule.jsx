import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import StarRating from '../ui/StarRating';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ReviewsModule = ({ productId }) => {
  const { user } = useContext(AuthContext);
  const isAuthenticated = !!user;
  
  const [summary, setSummary] = useState({ average: 0, total: 0, distribution: {} });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Formulario temporal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Parámetros de vista
  const isClienteValido = isAuthenticated && user && user.rol === 'cliente';

  const fetchReviewsData = async () => {
    try {
      const apiOptions = {
        headers: isAuthenticated ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}
      }
      
      const resSummary = await axios.get(`${API_URL}/reviews/summary/${productId}`, apiOptions);
      setSummary(resSummary.data.data);

      const resList = await axios.get(`${API_URL}/reviews/${productId}?limit=5&page=1`, apiOptions);
      setReviews(resList.data.data.data || []);
    } catch (err) {
      console.error("Error sincronizando reseñas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchReviewsData();
  }, [productId, isAuthenticated]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (userRating < 1 || userRating > 5) {
      return toast.error("Por favor selecciona una calificación válida entre 1 y 5 estrellas.");
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/reviews`, {
        productId,
        rating: userRating,
        comment: userComment
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      toast.success(res.data.message || "¡Gracias por tu reseña! Ha sido posteada.");
      setIsFormOpen(false);
      setUserComment("");
      setUserRating(0);
      fetchReviewsData();
    } catch (err) {
      const msg = err.response?.data?.message || "Algo salió mal enviando la reseña";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm("¿Seguro que deseas eliminar tu reseña?")) return;
    try {
      await axios.delete(`${API_URL}/reviews/me/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success("Reseña eliminada");
      setIsFormOpen(false);
      fetchReviewsData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al eliminar reseña");
    }
  };

  const handleEditReview = (review) => {
    setUserRating(review.rating);
    setUserComment(review.comment || "");
    setIsFormOpen(true);
  };

  const DistributionBar = ({ stars, count, total }) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
      <div className="flex items-center text-sm mb-2">
        <div className="w-12 text-gray-600 font-medium">{stars} est</div>
        <div className="w-48 h-3 mx-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-yellow-400 rounded-full transition-all duration-1000"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="w-12 text-gray-500 text-right">{percentage}%</div>
      </div>
    );
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-100 h-64 rounded-2xl w-full"></div>;
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mt-12 w-full max-w-6xl mx-auto">
      <h3 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">Análisis de Compradores</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Lado Estadístico */}
        <div className="md:col-span-4 bg-gray-50 p-6 rounded-2xl">
          <div className="flex items-center mb-4">
            <h4 className="text-6xl font-black text-gray-900 mr-4">{summary.average}</h4>
            <div className="flex flex-col">
              <StarRating rating={summary.average} readOnly sizeClass="w-5 h-5" />
              <span className="text-gray-500 font-medium text-sm mt-1">{summary.total} reseñas verificadas</span>
            </div>
          </div>
          
          <div className="space-y-1 mt-6">
            <DistributionBar stars="5" count={summary.distribution["5"] || 0} total={summary.total} />
            <DistributionBar stars="4" count={summary.distribution["4"] || 0} total={summary.total} />
            <DistributionBar stars="3" count={summary.distribution["3"] || 0} total={summary.total} />
            <DistributionBar stars="2" count={summary.distribution["2"] || 0} total={summary.total} />
            <DistributionBar stars="1" count={summary.distribution["1"] || 0} total={summary.total} />
          </div>

          <div className="mt-8">
            {!isAuthenticated ? (
              <div className="text-sm bg-blue-50 text-blue-800 p-4 rounded-xl">
                Para dejar tu opinión sobre este aspecto, por favor Inicia Sesión primero.
              </div>
            ) : !isClienteValido ? (
              <div className="text-sm bg-red-50 text-red-800 p-4 rounded-xl">
                Solo los clientes verificados pueden validar este producto operativo.
              </div>
            ) : (
              <button 
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition-colors"
              >
                {isFormOpen ? 'Cancelar' : 'Escribir una reseña'}
              </button>
            )}
          </div>
        </div>

        {/* Lado Contenido Dinámico / Reviews */}
        <div className="md:col-span-8">
          {/* Formulario Render Condicional */}
          {isFormOpen && (
            <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-200 animate-fade-in text-sm">
              <h5 className="font-bold text-gray-800 mb-4 text-lg">Tu Experiencia</h5>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-gray-600 mb-2 font-medium">Calificación General</label>
                  <StarRating 
                    rating={userRating} 
                    onRatingChange={(v) => setUserRating(v)} 
                    sizeClass="w-8 h-8"
                  />
                  {userRating === 0 && <p className="text-red-500 text-xs mt-1">Obligatorio</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-600 mb-2 font-medium">Añadir un comentario (opcional)</label>
                  <textarea 
                    rows="3" 
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                    placeholder="¿Cómo te ajustó el corte? ¿Es fiel al color descriptivo?"
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-lg shadow-md hover:bg-purple-700 disabled:opacity-50"
                  >
                    {submitting ? 'Enviando Protocolo...' : 'Publicar Reseña Seguro'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Listado Paginado de Revision */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-gray-400 italic text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                Aún no disponemos de testimonios matemáticos para este artefacto.
              </p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="border-b border-gray-100 pb-6 last:border-0 hover:bg-gray-50/50 p-4 -ml-4 rounded-xl transition-colors relative group">
                  {isAuthenticated && user.id === r.userId && (
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditReview(r)} className="text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-2 py-1 rounded">Editar</button>
                      <button onClick={handleDeleteReview} className="text-xs text-red-600 hover:text-red-800 font-bold bg-red-50 px-2 py-1 rounded">Eliminar</button>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2 pr-20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white font-bold flex items-center justify-center shadow-inner">
                        {r.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{r.userName} {isAuthenticated && user.id === r.userId && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full ml-1 uppercase">Tú</span>}</p>
                        <p className="text-xs text-gray-400">Verificado • {new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                       <StarRating rating={r.rating} readOnly sizeClass="w-4 h-4" />
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-gray-700 leading-relaxed mt-3 bg-white p-3 rounded-lg border border-gray-100 italic shadow-sm">
                      "{r.comment}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsModule;
