'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useProducts } from '@/context/ProductContext';

export default function HomeCategories() {
  const { categories, products } = useProducts();

  // Show only active categories
  const activeCategories = categories.filter(c => c.status === 'active');

  return (
    <section className="category-section">
      <div className="container">
        <div className="section-header">
          <div>
            <span className="eyebrow">Danh mục tuyển chọn</span>
            <h2 className="section-title">Không Gian Sống Mộc Mạc</h2>
          </div>
          <Link href="/product-list" className="btn btn-outline-green btn-sm">
            Tất cả danh mục <i className="fa-solid fa-chevron-right"></i>
          </Link>
        </div>

        <div className="category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {activeCategories.map(cat => {
            const count = products.filter(
              p => p.category === cat.slug || (cat.slug === 'decor' && p.category === 'trang-tri')
            ).length;

            return (
              <Link key={cat.id} href={`/product-list?category=${cat.slug}`} className="category-card" style={{ minHeight: '220px' }}>
                <Image
                  src={cat.image || '/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp'}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="category-card-img"
                  style={{ objectFit: 'cover' }}
                />
                <div className="category-card-overlay"></div>
                <div className="category-card-content">
                  <h3 className="category-card-name">{cat.name}</h3>
                  <span className="category-card-count">{count} sản phẩm đang có</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
