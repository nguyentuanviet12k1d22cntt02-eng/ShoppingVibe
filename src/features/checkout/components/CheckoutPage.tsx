'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/data/products';
import { createClient } from '@/utils/supabase/client';

export default function CheckoutPage() {
  const { cart, clearCart, cartSubtotal } = useCart();

  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const shippingFee = cartSubtotal >= 500000 || cartSubtotal === 0 ? 0 : 30000;
  const totalAmount = cartSubtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Giỏ hàng của bạn đang trống! Vui lòng chọn sản phẩm trước khi thanh toán.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        fullname: fullname.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim(),
        note: note.trim() || undefined,
        paymentMethod: paymentMethod === 'qr' ? 'qr' : 'cod',
        items: cart.map(item => ({
          productId: item.id.toString(),
          quantity: item.quantity,
        })),
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
      }

      setOrderCode(data.orderId);
      setIsSuccessModalOpen(true);
      clearCart();
    } catch (err: any) {
      console.error('Error creating order:', err);
      const errMsg = err.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.';
      setErrorMessage(errMsg);
      alert('Có lỗi xảy ra khi đặt hàng: ' + errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="main-content">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span className="breadcrumb-separator">›</span>
          <Link href="/cart">Giỏ hàng</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Thanh toán</span>
        </nav>

        {/* Stepper Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', margin: '12px 0 32px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', fontWeight: 700 }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>1</span>
            <span>Giỏ hàng</span>
          </div>
          <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--primary-color)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', fontWeight: 800 }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>2</span>
            <span>Thanh toán</span>
          </div>
          <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--border-color)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--border-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>3</span>
            <span>Hoàn tất</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="cart-layout">
          {/* Form Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Customer Info Card */}
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-truck-fast" style={{ color: 'var(--primary-color)' }}></i>
                <span>1. Thông tin giao hàng</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label">Họ và tên *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nguyễn Văn A"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Số điện thoại *</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="0912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Email nhận thông báo đơn hàng</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="nguyenvana@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Địa chỉ nhận hàng chi tiết *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, TP..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Ghi chú cho shipper (không bắt buộc)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Lưu ý về giờ giao hàng hoặc chỉ dẫn địa chỉ..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-credit-card" style={{ color: 'var(--primary-color)' }}></i>
                <span>2. Phương thức thanh toán</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: paymentMethod === 'cod' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', backgroundColor: paymentMethod === 'cod' ? 'var(--primary-surface)' : 'var(--bg-surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Thanh toán khi nhận hàng (COD)</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Trả tiền mặt trực tiếp cho shipper khi nhận hàng</div>
                    </div>
                  </div>
                  <i className="fa-solid fa-money-bill-wave" style={{ fontSize: '1.4rem', color: 'var(--primary-color)' }}></i>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: paymentMethod === 'qr' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', backgroundColor: paymentMethod === 'qr' ? 'var(--primary-surface)' : 'var(--bg-surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="radio"
                      name="payment"
                      value="qr"
                      checked={paymentMethod === 'qr'}
                      onChange={() => setPaymentMethod('qr')}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>Chuyển khoản Ngân hàng (VietQR Code)</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Quét mã QR qua ứng dụng ngân hàng bất kỳ</div>
                    </div>
                  </div>
                  <i className="fa-solid fa-qrcode" style={{ fontSize: '1.4rem', color: 'var(--primary-color)' }}></i>
                </label>
              </div>
            </div>
          </div>

          {/* Order Review Sidebar */}
          <div className="order-summary-card">
            <h3 className="summary-title">Đơn Hàng ({cart.length} món)</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '240px', overflowY: 'auto', marginBottom: 'var(--space-md)' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
                    <Image src={item.image} alt={item.name} fill sizes="48px" style={{ objectFit: 'cover', borderRadius: '8px' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>SL: {item.quantity}</div>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="summary-row">
              <span>Tạm tính</span>
              <span style={{ fontWeight: 700 }}>{formatCurrency(cartSubtotal)}</span>
            </div>

            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span style={{ fontWeight: 700, color: shippingFee === 0 ? 'var(--primary-color)' : 'var(--text-main)' }}>
                {shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}
              </span>
            </div>

            <div className="summary-row summary-total">
              <span>Tổng đơn hàng</span>
              <span style={{ color: 'var(--primary-color)', fontSize: '1.4rem' }}>{formatCurrency(totalAmount)}</span>
            </div>

            <button
              type="submit"
              className="btn btn-accent btn-lg"
              style={{ width: '100%', marginTop: 'var(--space-md)' }}
              disabled={isSubmitting || cart.length === 0}
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Đang xử lý đặt hàng...
                </>
              ) : (
                <>
                  Xác nhận Đặt hàng <i className="fa-solid fa-check"></i>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Modal đặt hàng thành công */}
        {isSuccessModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 999, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ backgroundColor: 'white', padding: '36px', borderRadius: '24px', maxWidth: '460px', width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 20px auto' }}>
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Đặt Hàng Thành Công!</h2>
              <div style={{ display: 'inline-block', padding: '6px 14px', backgroundColor: 'var(--primary-surface)', color: 'var(--primary-color)', fontWeight: 800, borderRadius: '99px', fontSize: '0.9rem', marginBottom: '16px' }}>
                MÃ ĐƠN HÀNG: {orderCode}
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
                Cảm ơn bạn đã lựa chọn Mini Shop! Chúng tôi đã tiếp nhận đơn hàng và sẽ liên hệ xác nhận trong thời gian sớm nhất.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  href={`/order-tracking?id=${orderCode}`}
                  className="btn btn-accent btn-lg"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <i className="fa-solid fa-truck-fast"></i> Theo dõi đơn hàng
                </Link>
                <Link href="/" className="btn btn-outline btn-md" style={{ width: '100%' }}>
                  Về Trang chủ <i className="fa-solid fa-house"></i>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
