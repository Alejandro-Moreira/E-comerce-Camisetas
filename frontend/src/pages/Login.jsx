import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Ingreso autorizado');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="block text-center text-3xl font-black bg-gradient-purple text-transparent bg-clip-text mb-4">
          T-Shirt SaaS
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Inicia sesión
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl border border-gray-100 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Correo electrónico</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input type="email" required onChange={e => setEmail(e.target.value)} 
                  className="pl-10 block w-full sm:text-sm border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 py-2.5 border outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Contraseña</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input type="password" required onChange={e => setPassword(e.target.value)}
                  className="pl-10 block w-full sm:text-sm border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 py-2.5 border outline-none transition-all" />
              </div>
            </div>

            <button type="submit" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors">
              Entrar al E-commerce
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm">
             <span className="text-gray-500">¿No tienes cuenta aún? <Link to="/register" className="font-bold text-purple-600 hover:text-purple-500">Regístrate</Link></span>
          </div>
        </div>
      </div>
    </div>
  );
}
