'use client';

import React, { useState } from 'react';
import { useProducts } from '@/context/ProductContext';
import ProductCard from './ProductCard';

export default function FeaturedProductsSection() {
  const { products, categories } = useProducts();
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const catPills = [
    { id: 'all', name: 'Tất cả' },
    ...categories.filter(c => c.status === 'active').map(c => ({ id: c.slug, name: c.name })),
  ];

  const featuredProducts = products.filter(p => p.featured || true); // show products
  const displayedProducts = selectedCat === 'all'
    ? featuredProducts.slice(0, 8)
    : featuredProducts.filter(p => p.category === selectedCat || (selectedCat === 'decor' && p.category === 'trang-tri')).slice(0, 8);

  return (
    <section style={{ marginBottom: 'var(--space-2xl)' }}>
      <div className="container">
        <div className="section-header">
          <div>
            <span className="eyebrow">Sản phẩm ưa chuộng</span>
            <h2 className="section-title">Tuyển Chọn Nổi Bật</h2>
          </div>
          
          {/* Category Pills Selector */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {catPills.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`btn btn-sm ${selectedCat === cat.id ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedCat(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="product-grid">
          {displayedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
