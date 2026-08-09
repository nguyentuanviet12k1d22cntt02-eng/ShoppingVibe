import React from 'react';

export default function CustomerReviews() {
  return (
    <section style={{ marginBottom: 'var(--space-2xl)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <span className="eyebrow">Khách hàng yêu mến</span>
          <h2 className="section-title">Góc Nhìn Từ Tổ Ấm Việt</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ color: 'var(--accent-gold)', marginBottom: '12px' }}>
              <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
              "Bình gốm mạ men Bát Tràng đặt ở bàn trà phòng khách nhìn rất sang và ấm cúng. Đóng gói cẩn thận, mộc mạc đúng tinh thần thủ công!"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>NT</div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Chị Ngọc Thảo</h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>Hà Nội • Đã mua Bình gốm Decor</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ color: 'var(--accent-gold)', marginBottom: '12px' }}>
              <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
              "Giỏ mây đan rất chắc chắn, thơm mùi mây tự nhiên. Giao hàng 2h trong nội thành cực kỳ nhanh chóng. Rất hài lòng!"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ffedd5', color: '#c85a32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>AH</div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Anh Minh Hoàng</h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>TP.HCM • Đã mua Giỏ mây đan</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ color: 'var(--accent-gold)', marginBottom: '12px' }}>
              <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
              "Đèn thả trần tre tỏa ánh sáng dịu vàng rất chill cho bàn ăn. Bạn bè tới chơi ai cũng khen gu thẩm mỹ."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>TL</div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Chị Thu Trang</h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>Đà Nẵng • Đã mua Đèn tre thả trần</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
