import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Lock, Check } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="font-bold text-red-500">Ausencia de Token Seguro.</p></div>
    );
  }

  const handleReset = async (e) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$#%&*!]).{10,}$/;
    if (!passwordRegex.test(pwd)) {
      return toast.error('La contraseña debe tener al menos 10 caracteres, incluir mayúsculas, minúsculas, números y al menos un símbolo ($, #, %, &, *, !).', { duration: 5000 });
    }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3002/api/auth/reset-password', { token, newPassword: pwd });
      toast.success(res.data.message);
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Expirado o Corrupto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-sm border border-gray-100 max-w-md w-full">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight text-center mb-2">Renueva tu Llave</h2>
        <p className="text-gray-500 text-center text-sm mb-8 font-medium">Asigna una nueva clave fuerte. Nadie en T-Shirt SaaS la sabrá.</p>
        
        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label className="block text-xs font-black tracking-widest uppercase text-gray-400 mb-2 block">Nueva Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="••••••••" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 font-medium" />
            </div>
          </div>
          <button disabled={loading} className="w-full bg-pink-600 text-white font-bold py-3.5 rounded-xl hover:bg-pink-500 disabled:opacity-50 transition flex items-center justify-center gap-2">
            {loading ? 'Encriptando...' : <><Check className="w-4 h-4"/> Sellar Nueva Clave</>}
          </button>
        </form>
      </div>
    </div>
  );
}
