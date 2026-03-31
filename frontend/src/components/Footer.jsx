import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 border-t border-gray-800 text-gray-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm font-medium">
        <p className="text-gray-300">
          Desarrollado por{' '}
          <a
            href="https://github.com/Alejandro-Moreira"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-pink-400 font-bold transition-colors underline decoration-purple-500/30 underline-offset-4"
          >
            Alejandro Moreira
          </a>
        </p>
        <p className="mt-3 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
          &copy; {new Date().getFullYear()} Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
