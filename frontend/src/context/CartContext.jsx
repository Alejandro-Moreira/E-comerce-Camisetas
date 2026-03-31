import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Modificación estricta: Se añade "selectedTalla". Cada producto en el carro
  // tendrá un ID único híbrido: "idProducto-talla" para que no se mezclen las 'S' con las 'L'.
  const addToCart = (product, selectedTalla) => {
    setCart(prev => {
      const compositeId = `${product.id}-${selectedTalla}`;
      const exists = prev.find(item => item.cartId === compositeId);
      
      if (exists) {
        return prev.map(item => 
          item.cartId === compositeId ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...product, cartId: compositeId, tallaSelec: selectedTalla, cantidad: 1 }];
    });
  };

  const removeFromCart = (cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };
  
  const updateQuantity = (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prev => prev.map(item => 
      item.cartId === cartId ? { ...item, cantidad: newQuantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + ((parseFloat(item.precio) || 0) * item.cantidad), 0);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
};
