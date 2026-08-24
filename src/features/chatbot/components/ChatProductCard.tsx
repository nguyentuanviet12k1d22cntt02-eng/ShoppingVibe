'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChatProductSummary } from '../types/chat.types';

interface ChatProductCardProps {
  product: ChatProductSummary;
  onSelect?: () => void;
}

export default function ChatProductCard({ product, onSelect }: ChatProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: '#ffffff',
        padding: '8px 10px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ position: 'relative', width: '44px', height: '44px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="44px"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {product.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1b4d3e' }}>
            {formattedPrice}
          </span>
          <span style={{ fontSize: '0.7rem', color: product.inStock ? '#16a34a' : '#ef4444' }}>
            {product.inStock ? `(Còn ${product.stockCount})` : '(Hết hàng)'}
          </span>
        </div>
      </div>
      <Link
        href={`/products/${product.id}`}
        onClick={onSelect}
        style={{
          padding: '5px 10px',
          backgroundColor: '#ecfdf5',
          color: '#065f46',
          borderRadius: '8px',
          fontSize: '0.75rem',
          fontWeight: 700,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          border: '1px solid #a7f3d0',
        }}
      >
        Xem
      </Link>
    </div>
  );
}
