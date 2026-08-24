'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS, Product } from '@/data/products';
import { Order } from '@/features/admin/data/adminMockData';
import { Customer } from '@/features/customers/types/customers.types';

import AdminSidebar, { AdminTab } from '@/components/layout/AdminSidebar';
import DashboardOverview from '@/features/dashboard/components/DashboardOverview';
import ProductManagement from '@/features/products/components/ProductManagement';
import OrderManagement from '@/features/orders/components/OrderManagement';
import CustomerManagement from '@/features/customers/components/CustomerManagement';
import CouponManagement from '@/features/coupons/components/CouponManagement';
import SystemSettings from '@/features/admin/components/SystemSettings';
import LiveChatManagement from '@/features/admin/components/LiveChatManagement';
import { useProducts } from '@/context/ProductContext';
import { useAuth } from '@/context/AuthContext';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: isAuthLoading, isMounted: isAuthMounted } = useAuth();

  const [activeNav, setActiveNav] = useState<AdminTab>('overview');
  const [animKey, setAnimKey] = useState<number>(1);
  const { products: productsList } = useProducts();

  // Route protection guard
  useEffect(() => {
    if (isAuthMounted && !isAuthLoading) {
      if (!user) {
        router.replace('/auth?redirect=/admin');
      } else if (user.role !== 'admin') {
        router.replace('/auth?error=unauthorized');
      }
    }
  }, [user, isAuthLoading, isAuthMounted, router]);

  // Trigger animation key whenever switching to Overview tab
  const handleNavClick = (nav: AdminTab) => {
    if (nav === 'overview') {
      setAnimKey(prev => prev + 1);
    }
    setActiveNav(nav);
  };

  // Replay animation button handler
  const handleReplayAnimation = () => {
    setAnimKey(prev => prev + 1);
  };
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [customersList, setCustomersList] = useState<Customer[]>([]);

  // Load orders & customers from Supabase
  React.useEffect(() => {
    async function loadData() {
      try {
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();
        
        // 1. Fetch real orders
        const { data: dbOrders, error: orderErr } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('order_date', { ascending: false });

        if (orderErr) throw orderErr;
        if (dbOrders && dbOrders.length > 0) {
          const mapped: Order[] = dbOrders.map(o => {
            const items = (o.order_items || []).map((it: any) => ({
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
              rawDate: o.order_date || '',
              paymentMethod: (o.payment_method === 'bank_transfer' ? 'bank_transfer' : 'cod') as 'cod' | 'bank_transfer',
              paymentStatus: (o.payment_status === 'paid' || o.payment_status === 'completed' ? 'paid' : 'pending') as 'paid' | 'pending',
              shippingStatus: (o.shipping_status || 'pending') as Order['shippingStatus'],
              items,
            };
          });
          setOrdersList(mapped);
        }

        // 2. Fetch real customers from /api/customers
        const custRes = await fetch('/api/customers');
        const custData = await custRes.json();
        if (custData.success && custData.customers) {
          setCustomersList(custData.customers);
        }
      } catch (err) {
        console.error('Failed to load orders and customers from Supabase:', err);
      }
    }

    loadData();
  }, []);

  if (!isAuthMounted || isAuthLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.95rem' }}>Đang kiểm tra quyền truy cập...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', gap: '16px', padding: '20px', textAlign: 'center' }}>
        <i className="fa-solid fa-shield-halved" style={{ fontSize: '3rem', color: '#ef4444' }}></i>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Khu vực hạn chế</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>Trang này chỉ dành riêng cho tài khoản Quản trị viên (Admin). Đang chuyển hướng...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* SIDEBAR NAVIGATION (LEFT) */}
      <AdminSidebar activeNav={activeNav} onNavClick={handleNavClick} />

      {/* MAIN DASHBOARD AREA (RIGHT) */}
      <main className="admin-main-content">
        {/* Top Bar Header */}
        <header className="admin-top-bar">
          <div className="admin-welcome">
            <h2>Xin chào, Admin Master 👋</h2>
            <p>Chào mừng bạn quay trở lại Bảng quản trị người bán Mini Shop.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {activeNav === 'overview' && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleReplayAnimation}
                title="Phát lại hiệu ứng số và biểu đồ"
                style={{
                  fontSize: '0.825rem',
                  padding: '7px 16px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#ecfdf5',
                  borderColor: '#6ee7b7',
                  color: '#065f46',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <i className="fa-solid fa-arrows-rotate"></i>
                <span>Chạy lại hiệu ứng</span>
              </button>
            )}

            <div className="admin-user-profile">
              <img
                src="/assets/images/banner/banner-trang-chu-mini-shop.webp"
                alt="Admin Avatar"
                className="admin-avatar"
              />
              <div>
                <span className="admin-name">Admin Master</span>
                <span className="admin-role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* TAB 1: OVERVIEW */}
        {activeNav === 'overview' && (
          <DashboardOverview
            animKey={animKey}
            productsList={productsList}
            ordersList={ordersList}
            customersList={customersList}
          />
        )}

        {/* TAB 2: PRODUCTS */}
        {activeNav === 'products' && (
          <ProductManagement />
        )}

        {/* TAB 3: ORDERS */}
        {activeNav === 'orders' && (
          <OrderManagement ordersList={ordersList} setOrdersList={setOrdersList} />
        )}

        {/* TAB 4: COUPONS */}
        {activeNav === 'coupons' && (
          <CouponManagement />
        )}

        {/* TAB 5: CUSTOMERS */}
        {activeNav === 'customers' && (
          <CustomerManagement customersList={customersList} setCustomersList={setCustomersList} />
        )}

        {/* TAB 6: LIVE CHAT & CSKH */}
        {activeNav === 'chat' && (
          <LiveChatManagement />
        )}

        {/* TAB 7: SETTINGS */}
        {activeNav === 'settings' && (
          <SystemSettings />
        )}
      </main>
    </div>
  );
}
