'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/features/products/components/ProductCard';

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <main className="main-content">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Sản phẩm yêu thích ({wishlist.length})</span>
        </nav>

        <div className="section-header" style={{ marginBottom: '24px' }}>
          <div>
            <span className="eyebrow">Bộ sưu tập cá nhân</span>
            <h1 className="section-title">Sản Phẩm Yêu Thích</h1>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '80px 20px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 20px auto' }}>
              <i className="fa-solid fa-heart"></i>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Chưa có sản phẩm yêu thích nào</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '420px', margin: '0 auto 24px auto' }}>
              Bấm vào biểu tượng trái tim ở bất kỳ sản phẩm nào để lưu lại danh sách riêng cho tổ ấm của bạn.
            </p>
            <Link href="/product-list" className="btn btn-primary btn-lg">
              Khám phá sản phẩm ngay <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        ) : (
          <div className="product-grid">
            {wishlist.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
