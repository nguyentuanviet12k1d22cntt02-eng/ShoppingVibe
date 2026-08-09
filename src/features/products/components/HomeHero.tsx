import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomeHero() {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-card">
          <div className="hero-bg-wrapper">
            <Image
              src="/assets/images/banner/banner-trang-chu-mini-shop.webp"
              alt="Mini Shop Artisan Living Decor Banner"
              fill
              priority
              sizes="100vw"
              className="hero-bg-img"
            />
            <div className="hero-bg-overlay"></div>
          </div>
          
          <div className="hero-content">
            <span className="eyebrow">
              <i className="fa-solid fa-leaf"></i> Tinh hoa thủ công Việt Nam
            </span>
            <h1 className="hero-title">
              Đón Bình Yên Vào <span>Nếp Nhà</span>
            </h1>
            <p className="hero-subtitle">
              Bộ sưu tập đồ thủ công mỹ nghệ, gốm sứ Bát Tràng và mây tre đan cao cấp. Thiết kế mộc mạc, tinh tế cho không gian sống hiện đại.
            </p>
            
            <div className="hero-cta-group">
              <Link href="/product-list" className="btn btn-primary btn-lg">
                Khám phá bộ sưu tập <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.85rem' }}></i>
              </Link>
              <Link href="/product-list?category=goc-goc" className="btn btn-outline btn-lg">
                Gốm Bát Tràng
              </Link>
            </div>
            
            <div className="hero-features">
              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <i className="fa-solid fa-truck-fast"></i>
                </div>
                <div className="feature-text">
                  <span className="feature-title">Giao nhanh 2h</span>
                  <span className="feature-desc">Freeship từ 500k</span>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <i className="fa-solid fa-hands-holding-circle"></i>
                </div>
                <div className="feature-text">
                  <span className="feature-title">100% Đan tay</span>
                  <span className="feature-desc">Làng nghề truyền thống</span>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-wrapper">
                  <i className="fa-solid fa-rotate-left"></i>
                </div>
                <div className="feature-text">
                  <span className="feature-title">Đổi trả 30 ngày</span>
                  <span className="feature-desc">Cam kết hài lòng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
