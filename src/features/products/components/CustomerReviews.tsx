'use client';

import React from 'react';

const REVIEWS = [
  {
    id: 1,
    quote: 'Bình gốm mạ men Bát Tràng đặt ở bàn trà phòng khách nhìn rất sang và ấm cúng. Đóng gói chèn xốp và hộp gỗ cẩn thận, mộc mạc đúng tinh thần thủ công!',
    name: 'Chị Ngọc Thảo',
    location: 'Hà Nội',
    product: 'Bình Gốm Men Nung Bát Tràng',
    initials: 'NT',
    bg: '#f0fdf4',
    color: '#166534',
  },
  {
    id: 2,
    quote: 'Giỏ mây đan rất chắc chắn, nan tre nhẵn bóng và thơm mùi mây tự nhiên. Giao hàng 2h trong nội thành cực kỳ nhanh chóng. Rất hài lòng với dịch vụ.',
    name: 'Anh Minh Hoàng',
    location: 'TP. Hồ Chí Minh',
    product: 'Giỏ Mây Tre Đan Chương Mỹ',
    initials: 'MH',
    bg: '#fff7ed',
    color: '#c2410c',
  },
  {
    id: 3,
    quote: 'Đèn thả trần tre tỏa ánh sáng vàng ấm dịu rất chill cho bàn ăn gia đình. Bạn bè tới chơi ai cũng tấm tắc khen gu thẩm mỹ mộc mạc của căn nhà.',
    name: 'Chị Thu Trang',
    location: 'Đà Nẵng',
    product: 'Đèn Thả Trần Tre Thủ Công',
    initials: 'TT',
    bg: '#fefce8',
    color: '#a16207',
  },
];

export default function CustomerReviews() {
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          {REVIEWS.map(item => (
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
                {/* 5-Star Rating & Verified Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ color: '#f59e0b', fontSize: '0.9rem', display: 'flex', gap: '3px' }}>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                  </div>
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
                </div>

                {/* Quote Text */}
                <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.7, marginBottom: '20px' }}>
                  &ldquo;{item.quote}&rdquo;
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
                    backgroundColor: item.bg,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.92rem',
                    flexShrink: 0,
                  }}
                >
                  {item.initials}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>{item.name}</h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {item.location} • {item.product}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
