import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center px-4">
      <h1 className="text-8xl font-black text-gray-200 decoration-purple-600 mb-2 drop-shadow-md">404</h1>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Página no encontrada</h2>
      <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">
        La ruta a la que intentas acceder parece haber sido reubicada o directamente no existe en nuestra bóveda.
      </p>
      <Link 
        to="/" 
        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg shadow-purple-500/30 hover:scale-105 hover:shadow-purple-500/50 transition-all duration-300"
      >
        Volver a un entorno seguro
      </Link>
    </div>
  );
};

export default NotFound;
