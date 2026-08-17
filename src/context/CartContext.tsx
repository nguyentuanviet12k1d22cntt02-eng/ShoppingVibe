'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/data/products';

import { useToast } from '@/context/ToastContext';

export interface SelectedVariant {
  id: string;
  variantName: string;
  priceAdjustment: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariant?: SelectedVariant;
  cartItemId: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedVariant?: SelectedVariant) => void;
  updateCartQuantity: (cartItemIdOrProductId: string, delta: number) => void;
  updateQuantity: (cartItemIdOrProductId: string, quantity: number) => void;
  removeFromCart: (cartItemIdOrProductId: string) => void;
  clearCart: () => void;
  totalCartItems: number;
  cartSubtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_KEY = 'minishop_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Normalize cart items to guarantee cartItemId
        const normalized = parsed.map((it: any) => ({
          ...it,
          cartItemId: it.cartItemId || (it.selectedVariant ? `${it.id}-${it.selectedVariant.id}` : it.id),
        }));
        setCart(normalized);
      }
    } catch (e) {
      console.error('Failed to load cart:', e);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  const addToCart = (product: Product, quantity = 1, selectedVariant?: SelectedVariant) => {
    const variantKey = selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id;
    const finalPrice = product.price + (selectedVariant ? Number(selectedVariant.priceAdjustment || 0) : 0);

    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.cartItemId === variantKey || item.id === variantKey);
      if (existingIdx >= 0) {
        return prev.map((item, idx) =>
          idx === existingIdx ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          ...product,
          price: finalPrice,
          quantity,
          selectedVariant,
          cartItemId: variantKey,
        },
      ];
    });

    const variantNotice = selectedVariant ? ` (${selectedVariant.variantName})` : '';
    showToast(`Đã thêm ${quantity} x ${product.name}${variantNotice} vào giỏ hàng!`, 'success');
  };

  const updateCartQuantity = (cartItemIdOrProductId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.cartItemId === cartItemIdOrProductId || item.id === cartItemIdOrProductId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const updateQuantity = (cartItemIdOrProductId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemIdOrProductId);
      return;
    }
    setCart(prev => {
      return prev.map(item =>
        item.cartItemId === cartItemIdOrProductId || item.id === cartItemIdOrProductId
          ? { ...item, quantity }
          : item
      );
    });
  };

  const removeFromCart = (cartItemIdOrProductId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemIdOrProductId && item.id !== cartItemIdOrProductId));
    showToast(`Đã xóa sản phẩm khỏi giỏ hàng.`, 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateCartQuantity,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalCartItems,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
