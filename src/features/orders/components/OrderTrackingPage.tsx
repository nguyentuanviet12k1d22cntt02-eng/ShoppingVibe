'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { formatCurrency } from '@/data/products';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/utils/supabase/client';
import Parcel3DCanvas from './Parcel3DCanvas';
import VietQRModal from '@/features/checkout/components/VietQRModal';
import gsap from 'gsap';

interface OrderItem {
  productId: string;
  productName: string;
  image: string;
  price: number;
  quantity: number;
}

interface OrderDetail {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  notes?: string;
  total: number;
  date: string;
  paymentMethod: 'cod' | 'bank_transfer';
  paymentStatus: 'paid' | 'pending';
  shippingStatus: 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled';
  items: OrderItem[];
}

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Đã tiếp nhận', desc: 'Đơn hàng được ghi nhận vào hệ thống', icon: 'fa-file-invoice-dollar' },
  { key: 'processing', label: 'Chuẩn bị hàng', desc: 'Kiểm tra & đóng gói tại kho Artisan', icon: 'fa-boxes-packing' },
  { key: 'shipping', label: 'Đang vận chuyển', desc: 'Shipper đang trên đường giao đến bạn', icon: 'fa-truck-fast' },
  { key: 'completed', label: 'Giao thành công', desc: 'Kiện hàng đã đến tay người nhận', icon: 'fa-circle-check' },
];

export default function OrderTrackingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedIdFromQuery = searchParams.get('id') || '';

  const { user } = useAuth();
  const [allOrders, setAllOrders] = useState<OrderDetail[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(selectedIdFromQuery || null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const [trackingIdInput, setTrackingIdInput] = useState<string>('');
  const [trackingPhoneInput, setTrackingPhoneInput] = useState<string>('');
  const [searchError, setSearchError] = useState<string>('');
  const [isManualSearching, setIsManualSearching] = useState<boolean>(false);

  // Map Supabase DB record to OrderDetail interface
  const mapDbOrderToDetail = (o: any): OrderDetail => {
    const items: OrderItem[] = (o.order_items || []).map((it: any) => ({
      productId: it.product_id || '',
      productName: it.product_name || '',
      image: it.image || '/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp',
      price: Number(it.price || 0),
      quantity: Number(it.quantity || 1),
    }));

    const dateStr = o.order_date
      ? new Date(o.order_date).toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

    return {
      id: o.id,
      customerName: o.customer_name || '',
      customerPhone: o.customer_phone || '',
      customerEmail: o.customer_email || '',
      address: o.address || '',
      notes: o.notes || undefined,
      total: Number(o.total_amount || 0),
      date: dateStr,
      paymentMethod: o.payment_method === 'bank_transfer' ? 'bank_transfer' : 'cod',
      paymentStatus: o.payment_status === 'paid' || o.payment_status === 'completed' ? 'paid' : 'pending',
      shippingStatus: (o.shipping_status || 'pending') as OrderDetail['shippingStatus'],
      items,
    };
  };

  // Securely load orders based on authentication role
  const loadOrders = async () => {
    setIsLoading(true);
    setSearchError('');
    try {
      const supabase = createClient();

      if (user?.role === 'admin') {
        // Admin: Load all orders for store oversight
        const { data: dbOrders, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('order_date', { ascending: false });

        if (error) throw error;
        if (dbOrders) {
          setAllOrders(dbOrders.map(mapDbOrderToDetail));
        }
      } else if (user?.email) {
        // Logged-in Customer: Load ONLY orders matching their email
        const { data: dbOrders, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('customer_email', user.email.trim())
          .order('order_date', { ascending: false });

        if (error) throw error;
        if (dbOrders) {
          setAllOrders(dbOrders.map(mapDbOrderToDetail));
        }
      } else if (selectedIdFromQuery) {
        // Guest with direct URL link (e.g. from checkout success): Load ONLY this specific order
        const { data: dbOrders, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', selectedIdFromQuery.trim())
          .limit(1);

        if (error) throw error;
        if (dbOrders && dbOrders.length > 0) {
          const mapped = dbOrders.map(mapDbOrderToDetail);
          setAllOrders(mapped);
          setSelectedOrderId(mapped[0].id);
        } else {
          setAllOrders([]);
          setSearchError(`Không tìm thấy đơn hàng #${selectedIdFromQuery}`);
        }
      } else {
        // Guest user not logged in: DO NOT expose all store orders for privacy & security
        setAllOrders([]);
      }
    } catch (err: any) {
      console.error('Failed to load orders from Supabase:', err);
      setSearchError('Có lỗi xảy ra khi tải dữ liệu đơn hàng.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual tracking lookup for guests
  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = trackingIdInput.trim();
    const cleanPhone = trackingPhoneInput.trim();

    if (!cleanId) {
      setSearchError('Vui lòng nhập Mã đơn hàng (ví dụ: MS-...).');
      return;
    }

    setIsManualSearching(true);
    setSearchError('');

    try {
      const supabase = createClient();
      let query = supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', cleanId);

      if (cleanPhone) {
        query = query.eq('customer_phone', cleanPhone);
      }

      const { data, error } = await query.limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped = data.map(mapDbOrderToDetail);
        setAllOrders(mapped);
        setSelectedOrderId(mapped[0].id);
        setSearchError('');
      } else {
        setSearchError('Không tìm thấy đơn hàng. Vui lòng kiểm tra lại Mã đơn hàng và Số điện thoại nhận hàng.');
      }
    } catch (err: any) {
      console.error('Search order error:', err);
      setSearchError(err.message || 'Lỗi tra cứu đơn hàng.');
    } finally {
      setIsManualSearching(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user, selectedIdFromQuery]);

  // Sync state if query param changes
  useEffect(() => {
    if (selectedIdFromQuery) {
      setSelectedOrderId(selectedIdFromQuery);
    }
  }, [selectedIdFromQuery]);

  // Active Selected Order
  const activeOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return allOrders.find(o => o.id.toLowerCase() === selectedOrderId.toLowerCase().trim()) || null;
  }, [selectedOrderId, allOrders]);

  // Filtered orders list
  const displayOrders = useMemo(() => {
    let list = allOrders;

    if (statusFilter !== 'all') {
      list = list.filter(o => o.shippingStatus === statusFilter);
    }

    if (trackingIdInput.trim() && user) {
      const q = trackingIdInput.trim().toLowerCase();
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
      );
    }

    return list;
  }, [allOrders, statusFilter, trackingIdInput, user]);

  // GSAP animation for Order List
  useEffect(() => {
    if (!activeOrder && listContainerRef.current) {
      gsap.fromTo(
        listContainerRef.current.querySelectorAll('.order-card-item'),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, [activeOrder, displayOrders]);

  // GSAP animation for Timeline Steps
  useEffect(() => {
    if (activeOrder && timelineContainerRef.current) {
      gsap.fromTo(
        timelineContainerRef.current.querySelectorAll('.tracking-step-card'),
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      );
    }
  }, [activeOrder]);

  // Step Progress Index
  const currentStepIndex = useMemo(() => {
    if (!activeOrder) return 0;
    if (activeOrder.shippingStatus === 'cancelled') return -1;
    const idx = TIMELINE_STEPS.findIndex(s => s.key === activeOrder.shippingStatus);
    return idx >= 0 ? idx : 0;
  }, [activeOrder]);

  // Status Badge Helper
  const getStatusBadge = (status: OrderDetail['shippingStatus']) => {
    switch (status) {
      case 'pending':
        return { label: 'Chờ xác nhận', bg: '#f1f5f9', color: '#64748b', icon: 'fa-clock' };
      case 'processing':
        return { label: 'Đang chuẩn bị hàng', bg: '#eff6ff', color: '#2563eb', icon: 'fa-boxes-packing' };
      case 'shipping':
        return { label: 'Đang giao hàng', bg: '#f5f3ff', color: '#7c3aed', icon: 'fa-truck-fast' };
      case 'completed':
        return { label: 'Giao hàng thành công', bg: '#f0fdf4', color: '#16a34a', icon: 'fa-circle-check' };
      case 'cancelled':
        return { label: 'Đã hủy đơn', bg: '#fef2f2', color: '#dc2626', icon: 'fa-ban' };
      default:
        return { label: status, bg: '#f1f5f9', color: '#475569', icon: 'fa-info-circle' };
    }
  };

  return (
    <main className="main-content" style={{ minHeight: '80vh', paddingBottom: '80px' }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span className="breadcrumb-separator">›</span>
          {activeOrder ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setSelectedOrderId(null);
                  router.push('/order-tracking');
                }}
                style={{ background: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
              >
                Đơn hàng của tôi
              </button>
              <span className="breadcrumb-separator">›</span>
              <span className="breadcrumb-current">Chi tiết #{activeOrder.id}</span>
            </>
          ) : (
            <span className="breadcrumb-current">Đơn hàng của tôi</span>
          )}
        </nav>

        {/* ========================================================= */}
        {/* VIEW 1: ORDER DETAIL & 3D TIMELINE (WHEN AN ORDER IS CLICKED) */}
        {/* ========================================================= */}
        {activeOrder ? (
          <div>
            {/* Top Back Navigation Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedOrderId(null);
                  router.push('/order-tracking');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s',
                }}
              >
                <i className="fa-solid fa-arrow-left"></i>
                <span>Quay lại danh sách đơn hàng</span>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Đặt ngày: <strong>{activeOrder.date}</strong></span>
              </div>
            </div>

            {/* 3D Interactive Hero Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 60%, #40916c 100%)',
                borderRadius: '24px',
                padding: '28px 32px',
                color: 'white',
                marginBottom: '32px',
                boxShadow: '0 20px 40px -15px rgba(27, 67, 50, 0.4)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                alignItems: 'center',
                gap: '24px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '16px' }}>
                  <i className="fa-solid fa-cube" style={{ color: '#86efac' }}></i>
                  CHI TIẾT ĐƠN HÀNG THỰC TẾ
                </div>

                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '10px', color: '#ffffff' }}>
                  Đơn Hàng #{activeOrder.id}
                </h1>
                <p style={{ fontSize: '0.98rem', opacity: 0.9, lineHeight: 1.6, maxWidth: '480px', marginBottom: '20px' }}>
                  Người nhận: <strong>{activeOrder.customerName}</strong> ({activeOrder.customerPhone})
                </p>

                {(() => {
                  const badge = getStatusBadge(activeOrder.shippingStatus);
                  return (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', color: badge.color, padding: '10px 20px', borderRadius: '16px', fontWeight: 800, fontSize: '0.95rem', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                      <i className={`fa-solid ${badge.icon}`}></i>
                      <span>Trạng thái: {badge.label}</span>
                    </div>
                  );
                })()}
              </div>

              {/* 3D Parcel Canvas */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '290px',
                  position: 'relative',
                }}
              >
                <Parcel3DCanvas
                  status={activeOrder.shippingStatus}
                  orderId={activeOrder.id}
                />
              </div>
            </div>

            {/* Main Content: Timeline & Order Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
              
              {/* Left Column: GSAP Timeline */}
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '24px',
                  border: '1px solid var(--border-color)',
                  padding: '32px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <i className="fa-solid fa-route" style={{ color: 'var(--primary-color)' }}></i>
                  Hành trình vận chuyển
                </h3>

                {/* Progress bar */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <span>Tiến độ giao hàng</span>
                    <span style={{ color: 'var(--primary-color)' }}>
                      {activeOrder.shippingStatus === 'cancelled'
                        ? 'Đã hủy'
                        : `Chặng ${Math.max(1, currentStepIndex + 1)}/4 (${Math.round(((currentStepIndex + 1) / 4) * 100)}%)`}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: activeOrder.shippingStatus === 'cancelled' ? '100%' : `${((currentStepIndex + 1) / 4) * 100}%`,
                        backgroundColor: activeOrder.shippingStatus === 'cancelled' ? '#ef4444' : 'var(--primary-color)',
                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    />
                  </div>
                </div>

                {/* Steps with Segment-based Precise Connecting Lines */}
                <div ref={timelineContainerRef} style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
                  {TIMELINE_STEPS.map((step, idx) => {
                    const isPassed = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;
                    const hasNextStep = idx < TIMELINE_STEPS.length - 1;
                    const isSegmentActive = idx < currentStepIndex;

                    let dotBg = '#f1f5f9';
                    let dotColor = '#94a3b8';
                    let dotBorder = '3px solid #e2e8f0';
                    let cardBorder = '1px solid var(--border-light)';
                    let cardBg = '#ffffff';
                    let cardShadow = '0 2px 8px rgba(0,0,0,0.02)';

                    if (isPassed) {
                      dotBg = 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)';
                      dotColor = '#ffffff';
                      dotBorder = '3px solid #bbf7d0';
                      cardBorder = '1px solid rgba(34, 197, 94, 0.2)';
                    }

                    if (isCurrent) {
                      dotBg = 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)';
                      dotColor = '#ffffff';
                      dotBorder = '3px solid #86efac';
                      cardBorder = '2px solid var(--primary-color)';
                      cardBg = 'linear-gradient(135deg, rgba(46, 125, 50, 0.05) 0%, rgba(34, 197, 94, 0.02) 100%)';
                      cardShadow = '0 8px 24px rgba(46, 125, 50, 0.1)';
                    }

                    return (
                      <div
                        key={step.key}
                        className="tracking-step-card"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '20px',
                          position: 'relative',
                          zIndex: 1,
                          padding: '18px 20px',
                          borderRadius: '20px',
                          border: cardBorder,
                          backgroundColor: cardBg,
                          boxShadow: cardShadow,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      >
                        {/* Connecting Line from this step down to the next step */}
                        {hasNextStep && (
                          <div
                            style={{
                              position: 'absolute',
                              left: '42px', // Centered with circle (padding 20px + circle radius 24px = 44px, line width 4px => left 42px)
                              top: '42px', // Center of current circle
                              height: 'calc(100% + 24px)', // Distance through gap to center of next circle
                              width: '4px',
                              background: isSegmentActive
                                ? 'linear-gradient(to bottom, #16a34a, #22c55e)'
                                : '#e2e8f0',
                              boxShadow: isSegmentActive ? '0 0 8px rgba(34, 197, 94, 0.5)' : 'none',
                              borderRadius: '4px',
                              zIndex: 0,
                              pointerEvents: 'none',
                            }}
                          />
                        )}

                        {/* Step Circle with Perfect Center Alignment */}
                        <div style={{ position: 'relative', zIndex: 2, flexShrink: 0 }}>
                          <div
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              background: dotBg,
                              color: dotColor,
                              border: dotBorder,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.15rem',
                              boxShadow: isCurrent ? '0 0 0 8px rgba(34, 197, 94, 0.2)' : '0 2px 6px rgba(0,0,0,0.06)',
                              transition: 'all 0.3s',
                            }}
                          >
                            <i className={`fa-solid ${step.icon}`}></i>
                          </div>
                        </div>

                        {/* Step Content */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <h4 style={{ fontSize: '1.08rem', fontWeight: 800, color: isPassed ? 'var(--text-main)' : 'var(--text-muted)' }}>
                              {step.label}
                            </h4>
                            {isCurrent && (
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  backgroundColor: 'var(--primary-color)',
                                  color: 'white',
                                  padding: '3px 10px',
                                  borderRadius: '20px',
                                  boxShadow: '0 2px 6px rgba(46, 125, 50, 0.3)',
                                }}
                              >
                                ● Đang thực hiện
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.88rem', color: isPassed ? 'var(--text-muted)' : '#94a3b8', marginTop: '4px', lineHeight: 1.5 }}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Items & Delivery Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Delivery Info */}
                <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '24px', border: '1px solid var(--border-color)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-location-dot" style={{ color: 'var(--primary-color)' }}></i>
                    Thông tin nhận hàng
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem' }}>
                    <div><strong>Người nhận:</strong> {activeOrder.customerName} - {activeOrder.customerPhone}</div>
                    <div><strong>Địa chỉ:</strong> {activeOrder.address}</div>
                    <div>
                      <strong>Thanh toán:</strong>{' '}
                      {activeOrder.paymentMethod === 'bank_transfer' ? 'Chuyển khoản Ngân hàng (VietQR)' : 'Thanh toán khi nhận hàng (COD)'}
                      {' - '}
                      <span style={{ color: activeOrder.paymentStatus === 'paid' ? '#16a34a' : '#d97706', fontWeight: 700 }}>
                        {activeOrder.paymentStatus === 'paid' ? '● Đã thanh toán' : '○ Chưa thanh toán'}
                      </span>
                    </div>

                    {activeOrder.paymentMethod === 'bank_transfer' && activeOrder.paymentStatus === 'pending' && (
                      <div
                        style={{
                          marginTop: '6px',
                          padding: '14px',
                          borderRadius: '14px',
                          backgroundColor: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '10px',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 800, color: '#065f46', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <i className="fa-solid fa-qrcode"></i>
                            <span>Đơn hàng chưa được thanh toán</span>
                          </div>
                          <div style={{ color: '#047857', fontSize: '0.8rem', marginTop: '2px' }}>
                            Quét mã VietQR để hoàn tất thanh toán và chuyển đơn sang đóng gói ngay!
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsQRModalOpen(true)}
                          className="btn btn-primary btn-sm"
                          style={{
                            borderRadius: '10px',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(46, 125, 50, 0.25)',
                          }}
                        >
                          <i className="fa-solid fa-bolt"></i>
                          <span>Quét mã VietQR ngay</span>
                        </button>
                      </div>
                    )}

                    {activeOrder.notes && (
                      <div style={{ backgroundColor: '#fef3c7', padding: '10px 14px', borderRadius: '10px', color: '#92400e', fontSize: '0.85rem' }}>
                        <strong>Ghi chú:</strong> {activeOrder.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '24px', border: '1px solid var(--border-color)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-bag-shopping" style={{ color: 'var(--primary-color)' }}></i>
                    Danh sách sản phẩm ({activeOrder.items.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                    {activeOrder.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingBottom: '14px', borderBottom: idx < activeOrder.items.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                        <img src={item.image} alt={item.productName} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--border-light)' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.productName}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Số lượng: {item.quantity} × {formatCurrency(item.price)}</div>
                        </div>
                        <div style={{ fontWeight: 800, color: 'var(--primary-color)' }}>{formatCurrency(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: '2px dashed var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800 }}>
                    <span>Tổng cộng:</span>
                    <span style={{ color: 'var(--primary-color)' }}>{formatCurrency(activeOrder.total)}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* VIEW 2: ORDERS LIST & TRACKING SEARCH (CUSTOMER / GUEST) */
          /* ========================================================= */
          <div>
            {user ? (
              /* LOGGED-IN USER VIEW: Show full order history of user */
              <div>
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px' }}>
                    <i className="fa-solid fa-circle-user"></i>
                    {user.role === 'admin' ? 'TÀI KHOẢN QUẢN TRỊ VIÊN' : 'TÀI KHOẢN KHÁCH HÀNG'}
                  </div>
                  <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Đơn Hàng Của Bạn
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Chào <strong>{user.name}</strong>, dưới đây là toàn bộ lịch sử đơn hàng gắn với tài khoản của bạn ({user.email}).
                  </p>
                </div>

                {/* Fast Search in My Orders */}
                {allOrders.length > 0 && (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: '20px',
                      border: '1px solid var(--border-color)',
                      padding: '18px 24px',
                      boxShadow: 'var(--shadow-sm)',
                      marginBottom: '24px',
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <i
                        className="fa-solid fa-magnifying-glass"
                        style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1rem' }}
                      ></i>
                      <input
                        type="text"
                        placeholder="Tìm trong danh sách đơn hàng của bạn (theo Mã đơn, sản phẩm, SĐT)..."
                        value={trackingIdInput}
                        onChange={e => setTrackingIdInput(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 40px 12px 44px',
                          borderRadius: '12px',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.95rem',
                          outline: 'none',
                          backgroundColor: 'var(--bg-main)',
                        }}
                      />
                      {trackingIdInput && (
                        <button
                          type="button"
                          onClick={() => setTrackingIdInput('')}
                          style={{
                            position: 'absolute',
                            right: '14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '1rem',
                          }}
                        >
                          <i className="fa-solid fa-circle-xmark"></i>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* GUEST VIEW (NOT LOGGED IN): Secure Lookup Form */
              <div>
                <div style={{ marginBottom: '28px' }}>
                  <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                    Tra Cứu & Theo Dõi Đơn Hàng
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Nhập mã đơn hàng và số điện thoại nhận hàng của bạn để kiểm tra trạng thái đóng gói & giao hàng thời gian thực.
                  </p>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: '24px',
                    border: '1px solid var(--border-color)',
                    padding: '28px',
                    boxShadow: 'var(--shadow-sm)',
                    marginBottom: '32px',
                  }}
                >
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-magnifying-glass" style={{ color: 'var(--primary-color)' }}></i>
                    Tra cứu đơn hàng của bạn
                  </h2>

                  <form onSubmit={handleManualSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) auto', gap: '14px', alignItems: 'center' }}>
                    <div>
                      <label htmlFor="track-order-id" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                        Mã đơn hàng <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        id="track-order-id"
                        type="text"
                        placeholder="Ví dụ: MS-1024 hoặc MS-..."
                        value={trackingIdInput}
                        onChange={e => setTrackingIdInput(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.95rem',
                          outline: 'none',
                          backgroundColor: 'var(--bg-main)',
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="track-phone" style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)' }}>
                        Số điện thoại nhận hàng (tùy chọn)
                      </label>
                      <input
                        id="track-phone"
                        type="tel"
                        placeholder="Ví dụ: 0901234567"
                        value={trackingPhoneInput}
                        onChange={e => setTrackingPhoneInput(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.95rem',
                          outline: 'none',
                          backgroundColor: 'var(--bg-main)',
                        }}
                      />
                    </div>

                    <div style={{ alignSelf: 'flex-end' }}>
                      <button
                        type="submit"
                        disabled={isManualSearching}
                        className="btn btn-primary"
                        style={{
                          height: '46px',
                          padding: '0 24px',
                          borderRadius: '12px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isManualSearching ? (
                          <>
                            <div style={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <span>Đang tra cứu...</span>
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <span>Tra cứu đơn</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {searchError && (
                    <div style={{ marginTop: '14px', padding: '10px 16px', borderRadius: '10px', backgroundColor: '#fef2f2', color: '#b91c1c', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className="fa-solid fa-circle-exclamation"></i>
                      <span>{searchError}</span>
                    </div>
                  )}

                  <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <span>Bạn muốn xem tự động tất cả đơn hàng đã mua?</span>
                    <Link href="/auth?redirect=/order-tracking" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                      <i className="fa-solid fa-arrow-right-to-bracket"></i>
                      <span>Đăng nhập tài khoản</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Filter Pills */}
            {allOrders.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px' }}>
                {[
                  { key: 'all', label: `Tất cả đơn (${allOrders.length})` },
                  { key: 'pending', label: 'Chờ xác nhận' },
                  { key: 'processing', label: 'Đang chuẩn bị' },
                  { key: 'shipping', label: 'Đang giao hàng' },
                  { key: 'completed', label: 'Đã giao thành công' },
                  { key: 'cancelled', label: 'Đã hủy' },
                ].map(f => {
                  const count = f.key === 'all' ? allOrders.length : allOrders.filter(o => o.shippingStatus === f.key).length;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setStatusFilter(f.key)}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '24px',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: statusFilter === f.key ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                        backgroundColor: statusFilter === f.key ? 'var(--primary-color)' : 'var(--bg-surface)',
                        color: statusFilter === f.key ? '#ffffff' : 'var(--text-main)',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {f.label} {f.key !== 'all' && `(${count})`}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Orders Cards Grid */}
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }}></div>
                <span>Đang tải thông tin đơn hàng...</span>
              </div>
            ) : displayOrders.length > 0 ? (
              <div ref={listContainerRef} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {displayOrders.map(order => {
                  const badge = getStatusBadge(order.shippingStatus);
                  return (
                    <div
                      key={order.id}
                      className="order-card-item"
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        router.push(`/order-tracking?id=${order.id}`);
                      }}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: '20px',
                        border: '1px solid var(--border-color)',
                        padding: '24px',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.25s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--primary-color)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      }}
                    >
                      {/* Top row: Order ID, Date & Status Badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                            #{order.id}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <i className="fa-regular fa-calendar" style={{ marginRight: '4px' }}></i>
                            {order.date}
                          </span>
                        </div>

                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: badge.bg,
                            color: badge.color,
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                          }}
                        >
                          <i className={`fa-solid ${badge.icon}`}></i>
                          {badge.label}
                        </span>
                      </div>

                      {/* Middle row: Product Thumbnails & Summary */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {order.items.slice(0, 3).map((item, idx) => (
                              <img
                                key={idx}
                                src={item.image}
                                alt={item.productName}
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  borderRadius: '10px',
                                  objectFit: 'cover',
                                  border: '1px solid var(--border-light)',
                                }}
                              />
                            ))}
                            {order.items.length > 3 && (
                              <div
                                style={{
                                  width: '48px',
                                  height: '48px',
                                  borderRadius: '10px',
                                  backgroundColor: '#f1f5f9',
                                  color: 'var(--text-muted)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '0.85rem',
                                }}
                              >
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>

                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                              {order.items[0]?.productName || 'Kiện hàng Mini Shop'}
                              {order.items.length > 1 && ` (và ${order.items.length - 1} món khác)`}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              Người nhận: {order.customerName} ({order.customerPhone})
                            </div>
                          </div>
                        </div>

                        {/* Total & Action Button */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Tổng thanh toán</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                              {formatCurrency(order.total)}
                            </span>
                          </div>

                          <button
                            type="button"
                            style={{
                              padding: '10px 18px',
                              borderRadius: '12px',
                              backgroundColor: 'rgba(46, 125, 50, 0.08)',
                              color: 'var(--primary-color)',
                              border: 'none',
                              fontWeight: 800,
                              fontSize: '0.88rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <span>Xem chi tiết & 3D</span>
                            <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.75rem' }}></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : user ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-surface)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                <i className="fa-solid fa-box-open" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '12px' }}></i>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>Bạn chưa có đơn hàng nào</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>Các đơn hàng bạn đặt khi đăng nhập sẽ tự động hiển thị tại đây.</p>
                <Link href="/product-list" className="btn btn-primary btn-sm">
                  Khám phá mua sắm ngay
                </Link>
              </div>
            ) : null}
          </div>
        )}

        {/* VietQR Modal for Order Tracking */}
        {activeOrder && (
          <VietQRModal
            isOpen={isQRModalOpen}
            onClose={() => setIsQRModalOpen(false)}
            orderId={activeOrder.id}
            totalAmount={activeOrder.total}
            customerName={activeOrder.customerName}
            redirectOnSuccess={false}
            onPaymentSuccess={() => {
              loadOrders();
            }}
          />
        )}
      </div>
    </main>
  );
}
