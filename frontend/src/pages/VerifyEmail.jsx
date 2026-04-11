import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [msg, setMsg] = useState('Verificando tu identidad cibernética...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMsg('Token de seguridad ausente. Enlace corrupto.');
      return;
    }

    axios.get(`http://localhost:3002/api/auth/verify-email?token=${token}`)
      .then(res => {
        setStatus('success');
        setMsg(res.data.message);
      })
      .catch(err => {
        setStatus('error');
        setMsg(err.response?.data?.error || 'Falló la validación. El token expiró o es inválido.');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-sm border border-gray-100 max-w-md w-full text-center">
        {status === 'loading' && <div className="text-purple-600 animate-pulse text-lg font-bold">{msg}</div>}
        {status === 'success' && (
          <div className="flex flex-col items-center animate-in zoom-in duration-500">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">¡Cuenta Verificada!</h2>
            <p className="text-gray-500 mb-6">{msg}</p>
            <Link to="/login" className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition">Entrar al E-commerce</Link>
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center animate-in zoom-in duration-500">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">Acceso Denegado</h2>
            <p className="text-gray-500 mb-6">{msg}</p>
            <Link to="/" className="text-purple-600 font-bold hover:underline">Volver a Inicio</Link>
          </div>
        )}
      </div>
    </div>
  );
}
