import React, { createContext, useContext, useState, useEffect } from 'react';
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sch_cart') || '[]'); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem('sch_cart', JSON.stringify(items)); }, [items]);

  const addItem = (product, qty = 1) => {
    setItems(prev => {
      const exists = prev.find(i => i.productId === product.id);
      if (exists) return prev.map(i => i.productId === product.id ? { ...i, quantity: Math.min(i.quantity + qty, product.stock) } : i);
      return [...prev, { productId: product.id, name: product.name, price: product.price, image: product.image, quantity: qty, stock: product.stock }];
    });
  };

  const removeItem = (productId) => setItems(prev => prev.filter(i => i.productId !== productId));

  const updateQty = (productId, qty) => {
    if (qty < 1) return removeItem(productId);
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity: Math.min(qty, i.stock) } : i));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
