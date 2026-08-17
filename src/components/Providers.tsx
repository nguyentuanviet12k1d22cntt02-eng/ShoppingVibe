'use client';

import React from 'react';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { AuthProvider } from '@/context/AuthContext';
import { ProductProvider } from '@/context/ProductContext';
import { ToastProvider } from '@/context/ToastContext';
import ToastContainer from '@/components/common/ToastContainer';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProductProvider>
          <WishlistProvider>
            <CartProvider>
              {children}
              <ToastContainer />
            </CartProvider>
          </WishlistProvider>
        </ProductProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
