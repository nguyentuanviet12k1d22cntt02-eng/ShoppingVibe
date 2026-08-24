'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency } from '@/data/products';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartSubtotal } = useCart();
  const { showToast } = useToast();
  const [voucherCode, setVoucherCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    discountType: string;
    discountValue: number;
    description?: string;
  } | null>(null);

  const shippingFee = cartSubtotal >= 500000 || cartSubtotal === 0 ? 0 : 30000;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totalAmount = Math.max(0, cartSubtotal + shippingFee - discountAmount);

  const handleApplyVoucher = async (codeToApply?: string) => {
    const targetCode = (codeToApply || voucherCode).trim().toUpperCase();
    if (!targetCode) {
      showToast('Vui lòng nhập mã giảm giá!', 'info');
      return;
    }

    if (cartSubtotal === 0) {
      showToast('Giỏ hàng đang trống!', 'warning');
      return;
    }

    try {
      setIsApplying(true);
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: targetCode, subtotal: cartSubtotal }),
      });
      const data = await res.json();

      if (!data.success) {
        showToast(data.error || 'Mã giảm giá không hợp lệ.', 'error');
      } else {
        setAppliedCoupon(data.coupon);
        setVoucherCode(targetCode);
        if (typeof window !== 'undefined') {
          localStorage.setItem('minishop_applied_coupon', JSON.stringify(data.coupon));
        }
        showToast(`Áp dụng mã ${targetCode} thành công! Giảm ${data.coupon.discountAmount.toLocaleString('vi-VN')}đ`, 'success');
      }
    } catch (err) {
      showToast('Không thể kết nối máy chủ kiểm tra mã.', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setVoucherCode('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('minishop_applied_coupon');
    }
    showToast('Đã hủy áp dụng mã giảm giá.', 'info');
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
                  {cart.map((item) => {
                    const itemKey = item.cartItemId || item.id;
                    return (
                      <tr key={itemKey}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 700 }}>{item.categoryName}</span>
                                {item.selectedVariant && (
                                  <span style={{ fontSize: '0.75rem', backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '1px 8px', borderRadius: '10px', fontWeight: 700 }}>
                                    {item.selectedVariant.variantName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ fontWeight: 600 }}>{formatCurrency(item.price)}</td>

                        <td>
                          {(() => {
                            const maxStock = item.stockCount !== undefined ? item.stockCount : 99;
                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                <div className="quantity-control">
                                  <button
                                    type="button"
                                    className="qty-btn"
                                    onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    className="qty-input"
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const parsed = parseInt(e.target.value || '1', 10);
                                      if (isNaN(parsed) || parsed < 1) updateQuantity(itemKey, 1);
                                      else if (parsed > maxStock) updateQuantity(itemKey, maxStock);
                                      else updateQuantity(itemKey, parsed);
                                    }}
                                    min="1"
                                    max={maxStock}
                                  />
                                  <button
                                    type="button"
                                    className="qty-btn"
                                    onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                                    disabled={item.quantity >= maxStock}
                                  >
                                    +
                                  </button>
                                </div>
                                <span style={{ fontSize: '0.72rem', color: item.quantity >= maxStock ? '#d97706' : 'var(--text-muted)' }}>
                                  {item.quantity >= maxStock ? `(Tối đa kho: ${maxStock})` : `(Còn ${maxStock} món)`}
                                </span>
                              </div>
                            );
                          })()}
                        </td>

                        <td style={{ fontWeight: 800, color: 'var(--primary-color)' }}>
                          {formatCurrency(item.price * item.quantity)}
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => removeFromCart(itemKey)}
                            style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#ef4444', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Xóa sản phẩm"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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

              {appliedCoupon ? (
                <div
                  style={{
                    margin: 'var(--space-md) 0',
                    padding: '12px 14px',
                    backgroundColor: 'var(--primary-surface)',
                    border: '1px dashed var(--primary-color)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--primary-color)' }}>
                      <i className="fa-solid fa-ticket"></i>
                      <span>{appliedCoupon.code}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        (-{formatCurrency(appliedCoupon.discountAmount)})
                      </span>
                    </div>
                    {appliedCoupon.description && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                        {appliedCoupon.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    Xóa mã
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '8px', margin: 'var(--space-md) 0' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập mã giảm giá..."
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyVoucher();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-green"
                      onClick={() => handleApplyVoucher()}
                      disabled={isApplying}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {isApplying ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Áp dụng'}
                    </button>
                  </div>

                  {/* Suggestion Voucher Pills */}
                  <div style={{ marginBottom: 'var(--space-md)' }}>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Mã ưu đãi gợi ý:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {['MINI10', 'ARTISAN50', 'FREESHIP'].map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => handleApplyVoucher(code)}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            backgroundColor: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            color: 'var(--primary-color)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          +{code}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

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
