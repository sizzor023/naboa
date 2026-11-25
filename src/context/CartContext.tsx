import React, { createContext, useContext, useMemo, useState } from 'react';
import type { CartItem, Product } from '../types';

interface CartContextValue {
  items: CartItem[];
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotalUgx: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const addToCart = (product: Product, quantity = 1) => {
    if (product.stockQty <= 0) return;
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const nextQty = Math.min(product.stockQty, existing.quantity + quantity);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, product, quantity: nextQty } : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: Math.min(product.stockQty, Math.max(1, quantity)),
        },
      ];
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        const clamped = Math.min(item.product.stockQty, quantity);
        return { ...item, quantity: clamped };
      })
    );
  };

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotalUgx = useMemo(
    () => items.reduce((sum, item) => sum + item.product.priceUgx * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        drawerOpen,
        setDrawerOpen,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        itemCount,
        subtotalUgx,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return ctx;
}
