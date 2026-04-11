import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!email) return toast.error('Escribe tu correo primero');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3002/api/auth/forgot-password', { email });
      toast.success(res.data.message, { duration: 5000 });
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error interno al solicitar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center items-center p-4">
      <Link to="/login" className="mb-6 flex items-center text-sm font-bold text-gray-500 hover:text-purple-600 transition">
        <ArrowLeft className="w-4 h-4 mr-1" /> Volver al Login
      </Link>
      <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-sm border border-gray-100 max-w-md w-full">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight text-center mb-2">¿Problemas para entrar?</h2>
        <p className="text-gray-500 text-center text-sm mb-8 font-medium">Ingresa el correo de tu cuenta y te daremos las llaves maestras de nuevo por 1 hora.</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-black tracking-widest uppercase text-gray-400 mb-2 block">Caja de Correo</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-medium" />
            </div>
          </div>
          <button disabled={loading} className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-purple-600 disabled:opacity-50 transition flex items-center justify-center gap-2">
            {loading ? 'Consultando Nube...' : <><Send className="w-4 h-4"/> Enviar Enlace Seguro</>}
          </button>
        </form>
      </div>
    </div>
  );
}
