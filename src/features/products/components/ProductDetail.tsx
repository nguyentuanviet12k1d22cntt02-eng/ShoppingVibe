'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency, PRODUCTS } from '@/data/products';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from './ProductCard';

export default function ProductDetail() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || 'p4';
  const { products } = useProducts();

  const product = useMemo(() => {
    return products.find(p => p.id === id) || products[0] || PRODUCTS[0];
  }, [products, id]);

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const otherProducts = useMemo(() => {
    return products.filter(p => p.id !== product.id);
  }, [products, product.id]);

  const thumbnails = useMemo(() => {
    return [
      product.image,
      otherProducts[0] ? otherProducts[0].image : product.image,
      otherProducts[1] ? otherProducts[1].image : product.image,
    ];
  }, [product, otherProducts]);

  const [activeThumb, setActiveThumb] = useState<string>(product.image);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    setActiveThumb(product.image);
    setQuantity(1);
  }, [product]);

  const handleQuantityMinus = () => {
    setQuantity(q => Math.max(1, q - 1));
  };

  const handleQuantityPlus = () => {
    setQuantity(q => q + 1);
  };

  const relatedProducts = useMemo(() => {
    const sameCat = products.filter(p => p.id !== product.id && p.category === product.category);
    if (sameCat.length >= 4) return sameCat.slice(0, 4);
    return products.filter(p => p.id !== product.id).slice(0, 4);
  }, [products, product]);

  return (
    <main className="main-content">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span className="breadcrumb-separator">›</span>
          <Link href="/product-list">Sản phẩm</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        {/* Detail Layout */}
        <div className="detail-layout">
          {/* Gallery Preview */}
          <div className="gallery-wrapper">
            <div className="main-preview-img-box" style={{ position: 'relative' }}>
              <Image
                src={activeThumb}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="main-preview-img"
              />
            </div>
            
            <div className="thumb-grid">
              {thumbnails.map((img, idx) => (
                <div
                  key={idx}
                  className={`thumb-item ${activeThumb === img ? 'active' : ''}`}
                  onClick={() => setActiveThumb(img)}
                  style={{ position: 'relative' }}
                >
                  <Image
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    fill
                    sizes="80px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="detail-info-box">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <span className="badge badge-emerald">✓ Còn hàng - Giao ngay</span>
              <span className="badge badge-terra">{product.categoryName}</span>
            </div>

            <h1 className="detail-title">{product.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '0.9rem', color: 'var(--accent-gold)' }}>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>(48 đánh giá thực tế)</span>
            </div>

            <div className="detail-price-box">
              <span className="detail-price-current">{formatCurrency(product.price)}</span>
              <span className="detail-price-original">{formatCurrency(Math.round(product.price * 1.25))}</span>
              <span className="badge badge-terra" style={{ fontSize: '0.85rem' }}>-20% GIẢM</span>
            </div>

            <p style={{ fontSize: '0.98rem', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: 'var(--space-xl)' }}>
              {product.description}. Sản phẩm được mạ men nung ở nhiệt độ tiêu chuẩn 1.300°C, bề mặt mịn đẹp mộc mạc. Đáp ứng tiêu chuẩn thẩm mỹ cao nhất cho không gian phòng khách & nếp nhà Việt.
            </p>

            {/* Quantity Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--space-xl)' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Số lượng:</span>
              <div className="quantity-control">
                <button type="button" className="qty-btn" onClick={handleQuantityMinus}>-</button>
                <input
                  type="number"
                  className="qty-input"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value || '1', 10)))}
                  min="1"
                />
                <button type="button" className="qty-btn" onClick={handleQuantityPlus}>+</button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: 'var(--space-xl)' }}>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
                onClick={() => addToCart(product, quantity)}
              >
                <i className="fa-solid fa-cart-shopping"></i> Thêm vào giỏ ({quantity})
              </button>

              <button
                type="button"
                className={`btn ${wishlisted ? 'btn-accent' : 'btn-outline'}`}
                onClick={() => toggleWishlist(product)}
                style={{ padding: '14px 20px' }}
                title="Yêu thích"
              >
                <i className={wishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
              </button>
            </div>

            {/* Trust Badges Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                <i className="fa-solid fa-shield-check" style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}></i>
                <span>Bảo hành 12 tháng</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                <i className="fa-solid fa-truck-ramp-box" style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}></i>
                <span>Kiểm hàng nhận thanh toán</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                <i className="fa-solid fa-rotate-left" style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}></i>
                <span>30 ngày đổi trả</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Tab Details */}
        <section className="detail-tabs-section">
          <div className="tab-header-list">
            <div className="tab-header-item active">Mô tả sản phẩm</div>
            <div className="tab-header-item">Thông số làng nghề</div>
            <div className="tab-header-item">Đánh giá khách hàng (48)</div>
          </div>

          <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '12px' }}>
              <strong>Nguồn gốc sản phẩm:</strong> Sản phẩm thuộc dòng đồ trang trí decor cao cấp, làm từ chất liệu tự nhiên như đất sét nung Bát Tràng, mây tre tự nhiên sấy chống mối mọt.
            </p>
            <p>
              <strong>Hướng dẫn bảo quản:</strong> Lau chùi nhẹ nhàng bằng khăn mềm ẩm. Tránh va đập mạnh hoặc dùng hóa chất tẩy rửa nồng độ cao để giữ trọn màu men và độ bóng bền lâu.
            </p>
          </div>
        </section>

        {/* Related Products Section */}
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="section-header">
            <div>
              <span className="eyebrow">Bộ sưu tập đồng điệu</span>
              <h2 className="section-title">Sản Phẩm Tương Tự</h2>
            </div>
            <Link href="/product-list" className="btn btn-outline-green btn-sm">
              Xem tất cả <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          <div className="product-grid">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
