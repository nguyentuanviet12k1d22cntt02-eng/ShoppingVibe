'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { showToastNotification } from '@/context/CartContext';
import { formatCurrency } from '@/data/products';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartSubtotal } = useCart();
  const [voucherCode, setVoucherCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  const shippingFee = cartSubtotal >= 500000 || cartSubtotal === 0 ? 0 : 30000;
  const discountAmount = Math.round((cartSubtotal * discountPercent) / 100);
  const totalAmount = Math.max(0, cartSubtotal + shippingFee - discountAmount);

  const handleApplyVoucher = () => {
    if (voucherCode.trim().toUpperCase() === 'MINI10') {
      setDiscountPercent(10);
      showToastNotification('Áp dụng mã MINI10 thành công! Bạn được giảm 10% đơn hàng.');
    } else if (voucherCode.trim()) {
      showToastNotification('Mã giảm giá không hợp lệ. Vui lòng nhập "MINI10"!');
    } else {
      showToastNotification('Vui lòng nhập mã giảm giá!');
    }
  };

  return (
    <main className="main-content">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Giỏ hàng ({cart.length})</span>
        </nav>

        <div className="section-header" style={{ marginBottom: '24px' }}>
          <h1 className="section-title">Giỏ Hàng Của Bạn</h1>
        </div>

        {cart.length === 0 ? (
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '80px 20px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 20px auto' }}>
              <i className="fa-solid fa-cart-flatbed"></i>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Giỏ hàng của bạn đang trống</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '420px', margin: '0 auto 24px auto' }}>
              Khám phá ngay các mẫu đồ gốm sứ Bát Tràng, đồ mây tre đan và nội thất thủ công độc đáo tại Mini Shop.
            </p>
            <Link href="/product-list" className="btn btn-primary btn-lg">
              <i className="fa-solid fa-arrow-left"></i> Khám phá sản phẩm ngay
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Cart Table Card */}
            <div className="cart-table-card">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                    <th style={{ textAlign: 'right' }}>Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="cart-item-info">
                          <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="64px"
                              className="cart-item-img"
                            />
                          </div>
                          <div>
                            <Link href={`/products/${item.id}`} style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                              {item.name}
                            </Link>
                            <div style={{ fontSize: '0.78rem', color: 'var(--primary-color)', fontWeight: 600 }}>{item.categoryName}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ fontWeight: 600 }}>{formatCurrency(item.price)}</td>

                      <td>
                        <div className="quantity-control">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            className="qty-input"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value || '1', 10))}
                            min="1"
                          />
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td style={{ fontWeight: 800, color: 'var(--primary-color)' }}>
                        {formatCurrency(item.price * item.quantity)}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#ef4444', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Xóa sản phẩm"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-lg)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-light)' }}>
                <Link href="/product-list" className="btn btn-outline">
                  ← Tiếp tục chọn hàng
                </Link>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={clearCart}
                  style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                >
                  <i className="fa-solid fa-trash"></i> Xóa tất cả
                </button>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="order-summary-card">
              <h3 className="summary-title">Tóm Tắt Đơn Hàng</h3>

              <div className="summary-row">
                <span>Tạm tính</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{formatCurrency(cartSubtotal)}</span>
              </div>

              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span style={{ fontWeight: 700, color: shippingFee === 0 ? 'var(--primary-color)' : 'var(--text-main)' }}>
                  {shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="summary-row" style={{ color: 'var(--primary-color)' }}>
                  <span>Giảm giá (MINI10)</span>
                  <span style={{ fontWeight: 700 }}>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              {/* Voucher Box */}
              <div style={{ display: 'flex', gap: '8px', margin: 'var(--space-md) 0' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Mã giảm giá (ví dụ: MINI10)"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                />
                <button type="button" className="btn btn-outline-green" onClick={handleApplyVoucher}>
                  Áp dụng
                </button>
              </div>

              <div className="summary-row summary-total">
                <span>Tổng thanh toán</span>
                <span style={{ color: 'var(--primary-color)', fontSize: '1.4rem' }}>{formatCurrency(totalAmount)}</span>
              </div>

              <Link href="/checkout" className="btn btn-accent btn-lg" style={{ width: '100%', marginTop: 'var(--space-md)' }}>
                Tiến hành thanh toán <i className="fa-solid fa-arrow-right"></i>
              </Link>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px' }}>
                <i className="fa-solid fa-lock" style={{ color: 'var(--primary-color)' }}></i> Bảo mật thanh toán mã hóa SSL 256-bit
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
