import { useEffect } from 'react';
import axios from 'axios';

// Hook personalizado para el Heatmap/Telemetry
export default function useAnalytics() {
  useEffect(() => {
    const tracker = (e) => {
      let uid = 'Anonimo';
      try {
        const u = localStorage.getItem('user');
        if (u) uid = JSON.parse(u).id;
      } catch (err) {}

      // Llama a la API estandarizada
      axios.post('http://localhost:3002/api/analytics/track-click', {
        userId: uid,
        page: window.location.pathname,
        x: e.clientX,
        y: e.clientY,
        timestamp: new Date().toISOString()
      }).catch(() => {}); // Fallo silencioso intencional
    };

    document.addEventListener('click', tracker);
    return () => document.removeEventListener('click', tracker);
  }, []);
}
