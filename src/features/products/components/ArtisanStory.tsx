import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ArtisanStory() {
  return (
    <section style={{ marginBottom: 'var(--space-2xl)' }}>
      <div className="container">
        <div className="story-banner">
          <div className="story-content-box">
            <span className="eyebrow">Hồn nghệ nhân Việt</span>
            <h2 className="story-title">Giá Trị Trong Từng Chi Tiết Thủ Công</h2>
            <p className="story-desc">
              Mỗi sản phẩm tại Mini Shop không đơn thuần là vật dụng trang trí, mà là câu chuyện kết tinh từ đôi bàn tay khéo léo của người nghệ nhân làng nghề Bát Tràng, Phú Vinh, Mây Tre Đan Chương Mỹ. Chúng tôi mang hơi thở thiên nhiên và nét bình yên của nếp nhà Việt vào từng không gian sống hiện đại.
            </p>
            <div>
              <Link href="/product-list" className="btn btn-accent btn-lg">
                Tìm hiểu câu chuyện làng nghề <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </div>

          <div className="story-img-grid">
            <div style={{ position: 'relative', width: '100%', height: '180px' }}>
              <Image
                src="/assets/images/products/do-my-nghe/den-tre-thu-cong.webp"
                alt="Đan tre thủ công"
                fill
                sizes="25vw"
                className="story-img"
              />
            </div>
            <div style={{ position: 'relative', width: '100%', height: '180px' }}>
              <Image
                src="/assets/images/products/do-my-nghe/bo-binh-gom-minimal.webp"
                alt="Gốm sứ men nung"
                fill
                sizes="25vw"
                className="story-img"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
