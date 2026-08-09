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
    <section className="category-section" style={{ marginBottom: 'var(--space-2xl)' }}>
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
              Danh mục tuyển chọn
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.6rem, 2.5vw, 2.1rem)',
                fontWeight: 800,
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
              }}
            >
              Không Gian Sống Mộc Mạc
            </h2>
          </div>

          <Link
            href="/product-list"
            className="btn btn-outline btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            <span>Tất cả danh mục</span>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.72rem' }}></i>
          </Link>
        </div>

        {/* Categories Bento Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
          }}
        >
          {activeCategories.map(cat => {
            const count = products.filter(
              p => p.category === cat.slug || (cat.slug === 'decor' && p.category === 'trang-tri')
            ).length;

            return (
              <Link
                key={cat.id}
                href={`/product-list?category=${cat.slug}`}
                style={{
                  position: 'relative',
                  height: '240px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '24px',
                  textDecoration: 'none',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 14px 28px rgba(0, 0, 0, 0.1)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1.06)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.04)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1)';
                }}
              >
                {/* Background Category Photo */}
                <Image
                  src={cat.image || '/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp'}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  style={{
                    objectFit: 'cover',
                    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />

                {/* Smooth Gradient Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.2) 60%, transparent 100%)',
                    zIndex: 1,
                  }}
                />

                {/* Content Overlay */}
                <div style={{ position: 'relative', zIndex: 2, color: '#ffffff' }}>
                  <h3
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      marginBottom: '4px',
                      color: '#ffffff',
                    }}
                  >
                    {cat.name}
                  </h3>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.8rem',
                      opacity: 0.9,
                      backgroundColor: 'rgba(255, 255, 255, 0.18)',
                      backdropFilter: 'blur(6px)',
                      padding: '3px 10px',
                      borderRadius: '12px',
                    }}
                  >
                    <span>{count} sản phẩm tuyển chọn</span>
                    <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.7rem' }}></i>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
