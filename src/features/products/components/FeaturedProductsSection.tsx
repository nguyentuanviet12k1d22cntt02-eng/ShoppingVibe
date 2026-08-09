'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useProducts } from '@/context/ProductContext';
import ProductCard from './ProductCard';

export default function FeaturedProductsSection() {
  const { products, categories } = useProducts();
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const catPills = [
    { id: 'all', name: 'Tất cả tuyển chọn' },
    ...categories.filter(c => c.status === 'active').map(c => ({ id: c.slug, name: c.name })),
  ];

  const featuredProducts = products.filter(p => p.featured || true);
  const displayedProducts = selectedCat === 'all'
    ? featuredProducts.slice(0, 8)
    : featuredProducts.filter(p => p.category === selectedCat || (selectedCat === 'decor' && p.category === 'trang-tri')).slice(0, 8);

  return (
    <section style={{ marginBottom: 'var(--space-2xl)' }}>
      <div className="container">
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-xl)',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--primary-color)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              Sản phẩm ưa chuộng
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.6rem, 2.5vw, 2.1rem)',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
              }}
            >
              Tuyển Chọn Nổi Bật
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {catPills.map(cat => {
              const isActive = selectedCat === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCat(cat.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    border: isActive ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                    backgroundColor: isActive ? 'var(--primary-color)' : '#ffffff',
                    color: isActive ? '#ffffff' : 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 4px 12px rgba(46, 125, 50, 0.2)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {displayedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Bottom CTA */}
        <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
          <Link
            href="/product-list"
            className="btn btn-outline btn-md"
            style={{
              borderRadius: '14px',
              padding: '12px 28px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>Xem thêm sản phẩm khác</span>
            <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.85rem' }}></i>
          </Link>
        </div>
      </div>
    </section>
  );
}
