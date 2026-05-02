import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (user) {
      // Sincronizar y obtener del backend
      const syncAndFetch = async () => {
        try {
          const saved = localStorage.getItem('favorites');
          const localFavorites = saved ? JSON.parse(saved) : [];
          
          if (localFavorites.length > 0) {
            await api.post('/favoritos/sync', { localFavorites });
            localStorage.removeItem('favorites');
          }
          
          const res = await api.get('/favoritos');
          setFavorites(res.data);
        } catch (error) {
          console.error("Error cargando favoritos", error);
        }
      };
      syncAndFetch();
    } else {
      // Usar localStorage
      const saved = localStorage.getItem('favorites');
      setFavorites(saved ? JSON.parse(saved) : []);
    }
  }, [user]);

  const toggleFavorite = async (productId) => {
    if (user) {
      try {
        await api.post('/favoritos/toggle', { productoId: productId });
        setFavorites(prev => {
          if (prev.includes(productId)) return prev.filter(id => id !== productId);
          return [...prev, productId];
        });
      } catch (error) {
        toast.error("Error al actualizar favoritos");
      }
    } else {
      setFavorites(prev => {
        const newFavs = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
        localStorage.setItem('favorites', JSON.stringify(newFavs));
        return newFavs;
      });
    }
  };

  const isFavorite = (productId) => favorites.includes(productId);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
