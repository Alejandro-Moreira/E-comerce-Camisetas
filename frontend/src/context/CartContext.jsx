import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (user) {
      // Sincronizar y obtener del backend
      const syncAndFetch = async () => {
        try {
          const saved = localStorage.getItem('cart');
          const localCart = saved ? JSON.parse(saved) : [];
          
          if (localCart.length > 0) {
            await api.post('/carrito/sync', { localCart: localCart.map(i => ({ id: i.id, talla: i.tallaSelec, quantity: i.cantidad })) });
            localStorage.removeItem('cart');
          }
          
          const res = await api.get('/carrito');
          setCart(res.data.map(item => ({ ...item, cartId: `${item.id}-${item.talla}`, tallaSelec: item.talla, cantidad: item.quantity })));
        } catch (error) {
          console.error("Error cargando carrito", error);
        }
      };
      syncAndFetch();
    } else {
      // Usar localStorage
      const saved = localStorage.getItem('cart');
      setCart(saved ? JSON.parse(saved) : []);
    }
  }, [user]);

  const addToCart = async (product, selectedTalla) => {
    if (user) {
      try {
        await api.post('/carrito', { productoId: product.id, cantidad: 1, talla: selectedTalla });
        const res = await api.get('/carrito');
        setCart(res.data.map(item => ({ ...item, cartId: `${item.id}-${item.talla}`, tallaSelec: item.talla, cantidad: item.quantity })));
      } catch (error) {
        toast.error("Error al añadir al carrito");
      }
    } else {
      setCart(prev => {
        const compositeId = `${product.id}-${selectedTalla}`;
        const exists = prev.find(item => item.cartId === compositeId);
        let newCart;
        if (exists) {
          newCart = prev.map(item => item.cartId === compositeId ? { ...item, cantidad: item.cantidad + 1 } : item);
        } else {
          newCart = [...prev, { ...product, cartId: compositeId, tallaSelec: selectedTalla, cantidad: 1 }];
        }
        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  const removeFromCart = async (cartId) => {
    if (user) {
      try {
        const itemToRemove = cart.find(i => i.cartId === cartId);
        if (itemToRemove) {
          await api.delete('/carrito', { data: { productoId: itemToRemove.id, talla: itemToRemove.tallaSelec } });
          setCart(prev => prev.filter(item => item.cartId !== cartId));
        }
      } catch (error) {
        toast.error("Error al eliminar del carrito");
      }
    } else {
      setCart(prev => {
        const newCart = prev.filter(item => item.cartId !== cartId);
        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      });
    }
  };
  
  const updateQuantity = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    if (user) {
      try {
        const itemToUpdate = cart.find(i => i.cartId === cartId);
        if (itemToUpdate) {
          await api.put('/carrito', { productoId: itemToUpdate.id, talla: itemToUpdate.tallaSelec, cantidad: newQuantity });
          setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, cantidad: newQuantity } : item));
        }
      } catch (error) {
        toast.error("Error al actualizar cantidad");
      }
    } else {
      setCart(prev => {
        const newCart = prev.map(item => item.cartId === cartId ? { ...item, cantidad: newQuantity } : item);
        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  const clearCart = () => {
    setCart([]);
    if (!user) localStorage.removeItem('cart');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + ((parseFloat(item.precio) || 0) * item.cantidad), 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
};
