import { Link } from 'react-router-dom';

const Forbidden = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center px-4">
      <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm shadow-red-200">
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-12 h-12">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Acceso Restringido</h1>
      <h2 className="text-xl font-medium text-red-500 mb-4 bg-red-50 px-4 py-1 rounded-full">Error 403 (FORBIDDEN)</h2>
      <p className="text-gray-500 max-w-lg mx-auto mb-8 text-md leading-relaxed">
        Su cuenta no dispone de los privilegios o rol jerárquico necesarios para auditar, visualizar o alterar esta zona de la plataforma. Si cree que esto es un error, por favor contacte a los administradores del sistema.
      </p>
      <div className="flex gap-4">
        <button 
          onClick={() => window.history.back()}
          className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
        >
          Regresar a mi estado previo
        </button>
        <Link 
          to="/profile" 
          className="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-lg shadow-md hover:bg-black transition-colors"
        >
          Ir a Permisos de Perfil
        </Link>
      </div>
    </div>
  );
};

export default Forbidden;
