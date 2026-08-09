'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }
  
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <div className="footer-logo">
              <svg className="logo-icon" viewBox="0 0 24 24" fill="currentColor" style={{ width: '28px', height: '28px', color: 'var(--primary-color)' }}>
                <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 2.5l5 4.5v7h-2v-6H9v6H7v-7l5-4.5z"/>
              </svg>
              <span>Mini Shop Artisan</span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#94a3b8' }}>
              Chắt lọc tinh hoa thủ công Việt Nam. Mộc mạc, bình yên và trường tồn theo thời gian trong từng không gian sống.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <a href="#" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}><i className="fa-brands fa-instagram"></i></a>
              <a href="#" style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}><i className="fa-brands fa-pinterest"></i></a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="footer-heading">Khám phá</h4>
            <ul className="footer-links">
              <li><Link href="/product-list">Tất cả sản phẩm</Link></li>
              <li><Link href="/product-list?category=goc-goc">Gốm sứ Bát Tràng</Link></li>
              <li><Link href="/product-list?category=may-tre">Đồ mây tre đan</Link></li>
              <li><Link href="/product-list?category=noi-that">Nội thất gỗ tự nhiên</Link></li>
              <li><Link href="/wishlist">Sản phẩm yêu thích</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="footer-heading">Hỗ trợ khách hàng</h4>
            <ul className="footer-links">
              <li><a href="#">Hướng dẫn đặt hàng</a></li>
              <li><a href="#">Chính sách giao hàng 2h</a></li>
              <li><a href="#">Bảo hành 1 đổi 1 trong 30 ngày</a></li>
              <li><a href="#">Quy trình kiểm hàng</a></li>
              <li><a href="#">Câu hỏi thường gặp (FAQ)</a></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="footer-heading">Bản tin Thủ công</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px' }}>
              Đăng ký để nhận bộ sưu tập gốm & decor mới nhất cùng ưu đãi dành riêng cho bạn.
            </p>
            <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Cảm ơn bạn đã đăng ký nhận thông tin từ Mini Shop!'); }}>
              <input
                type="email"
                placeholder="Nhập email của bạn..."
                required
                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: 'white', fontSize: '0.875rem' }}
              />
              <button type="submit" className="btn btn-primary btn-sm">Gửi</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Mini Shop Artisan Living. Bản quyền thuộc về thương hiệu Mini Shop Việt Nam.</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Thanh toán an toàn: COD • VNPAY • Momo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
