'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';

export default function ArtisanStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Subtle editorial reveal on enter
      gsap.from('.artisan-editorial-item', {
        opacity: 0,
        y: 20,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power2.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        marginBottom: 'var(--space-2xl)',
      }}
    >
      <div className="container">
        <div
          style={{
            backgroundColor: '#f7f5ee',
            borderRadius: '24px',
            border: '1px solid #e8e3d5',
            padding: '52px 48px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* LEFT: EDITORIAL COPY & PROVENANCE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="artisan-editorial-item">
              <span
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: '#2e7d32',
                }}
              >
                Làng Nghề Truyền Thống Việt Nam
              </span>
            </div>

            <h2
              className="artisan-editorial-item"
              style={{
                fontSize: 'clamp(1.8rem, 2.8vw, 2.4rem)',
                fontWeight: 800,
                color: '#1a2e22',
                lineHeight: 1.25,
                letterSpacing: '-0.02em',
              }}
            >
              Nghệ Thuật Thủ Công <br />
              Từ Đôi Bàn Tay Người Thợ
            </h2>

            <p
              className="artisan-editorial-item"
              style={{
                fontSize: '0.98rem',
                lineHeight: 1.7,
                color: '#475569',
                maxWidth: '480px',
              }}
            >
              Mỗi sản phẩm tại Mini Shop bắt nguồn từ tình yêu với chất liệu bản địa: đất sét sông Hồng nung men hỏa biến, nan tre bánh tẻ xứ Đoài và thớ gỗ mộc mạc. Chúng tôi kết nối các nghệ nhân lâu năm với không gian sống đương đại.
            </p>

            {/* Editorial Provenance Meta Lines */}
            <div
              className="artisan-editorial-item"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #e2dcd0',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Gốm Sứ
                </span>
                <strong style={{ fontSize: '0.92rem', color: '#1a2e22' }}>Bát Tràng, Hà Nội</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Mây Tre Đan
                </span>
                <strong style={{ fontSize: '0.92rem', color: '#1a2e22' }}>Phú Vinh, Chương Mỹ</strong>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Tiêu Chuẩn
                </span>
                <strong style={{ fontSize: '0.92rem', color: '#1a2e22' }}>100% Thuần Tự Nhiên</strong>
              </div>
            </div>

            {/* Action Link */}
            <div className="artisan-editorial-item" style={{ paddingTop: '8px' }}>
              <Link
                href="/product-list"
                className="btn btn-primary btn-md"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                }}
              >
                <span>Khám phá bộ sưu tập thủ công</span>
                <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.82rem' }}></i>
              </Link>
            </div>
          </div>

          {/* RIGHT: ELEGANT DUAL PHOTO EDITORIAL COMPOSITION */}
          <div
            ref={imgWrapperRef}
            className="artisan-editorial-item"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              alignItems: 'stretch',
            }}
          >
            {/* Primary Artisan Craft Image */}
            <div
              style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                height: '320px',
                backgroundColor: '#e5e0d3',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
              }}
            >
              <Image
                src="/assets/images/products/do-my-nghe/den-tre-thu-cong.webp"
                alt="Đèn mây tre đan thủ công Phú Vinh"
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                style={{ objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '12px 14px',
                  background: 'linear-gradient(to top, rgba(26, 46, 34, 0.8) 0%, transparent 100%)',
                  color: '#ffffff',
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.9, display: 'block' }}>Mây tre thủ công</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Đèn thả trần mộc</span>
              </div>
            </div>

            {/* Secondary Ceramic Image with Offset */}
            <div
              style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                height: '320px',
                backgroundColor: '#e5e0d3',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                marginTop: '24px',
              }}
            >
              <Image
                src="/assets/images/products/do-my-nghe/bo-binh-gom-minimal.webp"
                alt="Bình gốm mộc Bát Tràng"
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                style={{ objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '12px 14px',
                  background: 'linear-gradient(to top, rgba(26, 46, 34, 0.8) 0%, transparent 100%)',
                  color: '#ffffff',
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.9, display: 'block' }}>Gốm men nung</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Bình gốm mộc tối giản</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
