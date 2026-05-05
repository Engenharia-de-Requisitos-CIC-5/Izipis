'use client';

import { useState, useCallback, useMemo } from 'react';
import { Product } from '@/lib/types';

export interface CartItem {
  product: Product;
  quantity: number;
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totalItems = useMemo(() => 
    cart.reduce((acc, item) => acc + item.quantity, 0), 
  [cart]);

  const totalPrice = useMemo(() => 
    cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0), 
  [cart]);

  return {
    cart,
    addToCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  };
}
