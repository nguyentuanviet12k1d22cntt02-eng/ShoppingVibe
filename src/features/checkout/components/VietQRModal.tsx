'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/data/products';
import { useToast } from '@/context/ToastContext';

interface VietQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  totalAmount: number;
  customerName?: string;
  onPaymentSuccess?: () => void;
  redirectOnSuccess?: boolean;
}

export default function VietQRModal({
  isOpen,
  onClose,
  orderId,
  totalAmount,
  customerName,
  onPaymentSuccess,
  redirectOnSuccess = true,
}: VietQRModalProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [isSimulating, setIsSimulating] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const bankId = 'MB';
  const bankName = 'MBBank (Ngân hàng TMCP Quân Đội)';
  const accountNo = '090123456789';
  const accountName = 'MINI SHOP ARTISAN';
  const transferContent = `MINISHOP ${orderId.replace(/^#/, '')}`;

  // VietQR Dynamic Image URL
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${Math.round(
    totalAmount
  )}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Đã sao chép ${fieldName}!`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Simulate payment
  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/payment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId.replace(/^#/, '') }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Giả lập thanh toán thất bại');
      }

      setIsPaid(true);
      showToast('🎉 Xác nhận thanh toán VietQR thành công!', 'success');
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (err: any) {
      console.error('Payment simulation error:', err);
      showToast(err.message || 'Lỗi giả lập thanh toán', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '28px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#f1f5f9',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            zIndex: 10,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#e2e8f0';
            e.currentTarget.style.color = '#0f172a';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
            e.currentTarget.style.color = '#64748b';
          }}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {isPaid ? (
          /* ================= SUCCESS STATE ================= */
          <div style={{ padding: '48px 36px', textAlign: 'center' }}>
            <div
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                margin: '0 auto 24px auto',
                boxShadow: '0 10px 25px -5px rgba(22, 163, 74, 0.3)',
                animation: 'bounce 0.8s ease-out',
              }}
            >
              <i className="fa-solid fa-check"></i>
            </div>

            <span
              style={{
                display: 'inline-block',
                padding: '4px 14px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                fontWeight: 800,
                fontSize: '0.82rem',
                borderRadius: '20px',
                marginBottom: '12px',
                letterSpacing: '0.05em',
              }}
            >
              ● ĐÃ XÁC NHẬN THANH TOÁN TỰ ĐỘNG
            </span>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Thanh Toán Thành Công!
            </h2>

            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
              Hệ thống đã ghi nhận thanh toán <strong>{formatCurrency(totalAmount)}</strong> cho đơn hàng{' '}
              <strong>#{orderId}</strong>. Đơn hàng đang được bộ phận kho đóng gói!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {redirectOnSuccess && (
                <Link
                  href={`/order-tracking?id=${orderId.replace(/^#/, '')}`}
                  className="btn btn-primary btn-lg"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    borderRadius: '14px',
                    fontWeight: 700,
                  }}
                  onClick={onClose}
                >
                  <i className="fa-solid fa-cube"></i>
                  <span>Xem Trạng Thái Đơn Hàng & 3D</span>
                </Link>
              )}

              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                style={{
                  width: '100%',
                  borderRadius: '14px',
                  fontWeight: 600,
                }}
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        ) : (
          /* ================= PAYMENT SCREEN ================= */
          <div style={{ padding: '32px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  marginBottom: '10px',
                }}
              >
                <i className="fa-solid fa-qrcode"></i>
                VIETQR CHUẨN NAPAS 247
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Quét Mã Thanh Toán VietQR
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '6px' }}>
                Mở ứng dụng ngân hàng bất kỳ để quét mã hoặc chuyển khoản theo thông tin dưới đây.
              </p>
            </div>

            {/* QR Code Card */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: '20px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '12px',
                  borderRadius: '16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #e2e8f0',
                  marginBottom: '14px',
                }}
              >
                <img
                  src={qrUrl}
                  alt="Mã VietQR thanh toán"
                  style={{
                    width: '260px',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '8px',
                  }}
                />
              </div>

              {/* Real-time Polling Status Pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#ecfdf5',
                  color: '#065f46',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    animation: 'pulse 1.5s infinite',
                  }}
                ></div>
                <span>Đang chờ chuyển khoản... (Tự động xác nhận)</span>
              </div>
            </div>

            {/* Bank Transfer Details Table */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '16px',
                marginBottom: '24px',
                fontSize: '0.88rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Ngân hàng:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{bankName}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Chủ tài khoản:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{accountName}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Số tài khoản:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '1rem', color: '#1b4332' }}>{accountNo}</strong>
                  <button
                    type="button"
                    onClick={() => handleCopy(accountNo, 'Số tài khoản')}
                    style={{
                      border: 'none',
                      background: '#f1f5f9',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: copiedField === 'Số tài khoản' ? '#16a34a' : '#475569',
                    }}
                  >
                    {copiedField === 'Số tài khoản' ? '✓ Đã chép' : 'Sao chép'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b' }}>Số tiền thanh toán:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--primary-color)' }}>
                    {formatCurrency(totalAmount)}
                  </strong>
                  <button
                    type="button"
                    onClick={() => handleCopy(Math.round(totalAmount).toString(), 'Số tiền')}
                    style={{
                      border: 'none',
                      background: '#f1f5f9',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: copiedField === 'Số tiền' ? '#16a34a' : '#475569',
                    }}
                  >
                    {copiedField === 'Số tiền' ? '✓ Đã chép' : 'Sao chép'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #e2e8f0', paddingTop: '8px' }}>
                <span style={{ color: '#64748b' }}>Nội dung chuyển khoản:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, color: '#dc2626', backgroundColor: '#fef2f2', padding: '2px 8px', borderRadius: '6px' }}>
                    {transferContent}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(transferContent, 'Nội dung chuyển khoản')}
                    style={{
                      border: 'none',
                      background: '#f1f5f9',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: copiedField === 'Nội dung chuyển khoản' ? '#16a34a' : '#475569',
                    }}
                  >
                    {copiedField === 'Nội dung chuyển khoản' ? '✓ Đã chép' : 'Sao chép'}
                  </button>
                </div>
              </div>
            </div>

            {/* DEMO SIMULATION BUTTON */}
            <div
              style={{
                backgroundColor: '#eff6ff',
                borderRadius: '16px',
                border: '1px solid #bfdbfe',
                padding: '16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: '#1e40af', fontWeight: 600, marginBottom: '10px' }}>
                🧪 <strong>Chế độ Thử Nghiệm / Demo:</strong> Bấm nút dưới để giả lập quét mã chuyển tiền thành công ngay lập tức!
              </div>

              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isSimulating}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                }}
              >
                {isSimulating ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Đang xác thực giao dịch chuyển khoản...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-bolt"></i>
                    <span>⚡ Giả Lập Quét Mã & Thanh Toán Thành Công (Demo)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
