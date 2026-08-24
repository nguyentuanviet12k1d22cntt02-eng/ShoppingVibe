'use client';

import React, { useState, useEffect } from 'react';
import { useProducts } from '@/context/ProductContext';

export interface ReviewItem {
  id: string;
  product_id: string;
  user_name: string;
  user_email?: string;
  rating: number;
  comment: string;
  location?: string;
  is_verified_purchase: boolean;
  created_at: string;
}

const BG_COLORS = ['#f0fdf4', '#fff7ed', '#fefce8', '#eff6ff', '#faf5ff'];
const TEXT_COLORS = ['#166534', '#c2410c', '#a16207', '#1d4ed8', '#7e22ce'];

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { products } = useProducts();

  useEffect(() => {
    async function loadReviews() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/reviews?limit=3');
        const data = await res.json();
        if (data.success && data.reviews) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReviews();
  }, []);

  const getProductName = (productId: string) => {
    const p = products.find(prod => prod.id === productId);
    return p ? p.name : 'Sản phẩm thủ công';
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
  return (
    <section style={{ marginBottom: 'var(--space-2xl)' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
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
            Trải nghiệm thực tế
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.6rem, 2.5vw, 2.1rem)',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
            }}
          >
            Góc Nhìn Từ Tổ Ấm Việt
          </h2>
        </div>

        {/* Reviews 3-Card Grid */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '1.8rem', color: 'var(--primary-color)', marginBottom: '10px' }}></i>
            <p>Đang tải đánh giá từ khách hàng...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <p>Chưa có đánh giá nào được hiển thị.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {reviews.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '28px',
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.04)';
                }}
              >
                <div>
                  {/* Rating Stars & Verified Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ color: '#f59e0b', fontSize: '0.9rem', display: 'flex', gap: '3px' }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <i
                          key={i}
                          className={`fa-${i < item.rating ? 'solid' : 'regular'} fa-star`}
                          style={{ color: i < item.rating ? '#f59e0b' : '#cbd5e1' }}
                        ></i>
                      ))}
                    </div>
                    {item.is_verified_purchase && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--primary-color)',
                          backgroundColor: 'var(--primary-surface)',
                          padding: '3px 8px',
                          borderRadius: '8px',
                        }}
                      >
                        ✓ Đã mua hàng
                      </span>
                    )}
                  </div>

                  {/* Comment Text */}
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.7, marginBottom: '20px' }}>
                    &ldquo;{item.comment}&rdquo;
                  </p>
                </div>

                {/* Customer Info */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border-light)',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: BG_COLORS[idx % BG_COLORS.length],
                      color: TEXT_COLORS[idx % TEXT_COLORS.length],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(item.user_name)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>{item.user_name}</h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {item.location || 'Việt Nam'} • {getProductName(item.product_id)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
