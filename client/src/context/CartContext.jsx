import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const sessionId = localStorage.getItem('cartSessionId') || crypto.randomUUID();

  useEffect(() => {
    if (!localStorage.getItem('cartSessionId')) {
      localStorage.setItem('cartSessionId', sessionId);
    }
  }, [sessionId]);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const headers = user ? {} : { 'x-session-id': sessionId };
      const { data } = await api.get('/cart', { headers });
      setCart(data);
    } catch {
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  }, [user, sessionId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart, user]);

  useEffect(() => {
    if (user) {
      api.post('/cart/merge', {}, { headers: { 'x-session-id': sessionId } })
        .then(() => fetchCart())
        .catch(() => {});
    }
  }, [user]);

  const addToCart = async (productId, quantity = 1, size, color) => {
    const headers = user ? {} : { 'x-session-id': sessionId };
    const { data } = await api.post('/cart', { productId, quantity, size, color }, { headers });
    setCart(data);
    return data;
  };

  const updateQuantity = async (itemId, quantity) => {
    const { data } = await api.put(`/cart/${itemId}`, { quantity });
    setCart(data);
    return data;
  };

  const removeFromCart = async (itemId) => {
    const { data } = await api.delete(`/cart/${itemId}`);
    setCart(data);
    return data;
  };

  const cartCount = cart?.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0;

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, cartCount, fetchCart, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
