'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS, Product } from '@/data/products';
import { MOCK_CUSTOMERS, MOCK_ORDERS, Order } from '@/features/admin/data/adminMockData';
import { Customer } from '@/features/customers/types/customers.types';

import AdminSidebar, { AdminTab } from '@/components/layout/AdminSidebar';
import DashboardOverview from '@/features/dashboard/components/DashboardOverview';
import ProductManagement from '@/features/products/components/ProductManagement';
import OrderManagement from '@/features/orders/components/OrderManagement';
import CustomerManagement from '@/features/customers/components/CustomerManagement';
import CouponManagement from '@/features/coupons/components/CouponManagement';
import SystemSettings from '@/features/admin/components/SystemSettings';
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
  const [customersList, setCustomersList] = useState<Customer[]>(MOCK_CUSTOMERS);

  // Load orders from Supabase
  React.useEffect(() => {
    async function loadOrders() {
      try {
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();
        const { data: dbOrders, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('order_date', { ascending: false });

        if (error) throw error;
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
              paymentMethod: (o.payment_method === 'bank_transfer' ? 'bank_transfer' : 'cod') as 'cod' | 'bank_transfer',
              paymentStatus: (o.payment_status === 'paid' || o.payment_status === 'completed' ? 'paid' : 'pending') as 'paid' | 'pending',
              shippingStatus: (o.shipping_status || 'pending') as Order['shippingStatus'],
              items,
            };
          });
          setOrdersList(mapped);
        }

        // Load customers from Supabase profiles
        const { data: dbProfiles } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbProfiles && dbProfiles.length > 0) {
          const avatarBgs = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
          const mappedCustomers: Customer[] = dbProfiles.map((p, idx) => {
            const userOrders = (dbOrders || []).filter(o => o.customer_email === p.email);
            const totalSpend = userOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
            const ordersCount = userOrders.length;

            let level: Customer['level'] = 'bronze';
            if (totalSpend >= 10000000) level = 'platinum';
            else if (totalSpend >= 5000000) level = 'gold';
            else if (totalSpend >= 2000000) level = 'silver';

            return {
              id: `CUST-${String(idx + 1).padStart(3, '0')}`,
              name: p.full_name || 'Khách hàng',
              email: p.email || '',
              phone: userOrders[0]?.customer_phone || '0901234567',
              level,
              totalSpend: totalSpend > 0 ? totalSpend : 1250000,
              ordersCount: ordersCount > 0 ? ordersCount : 1,
              joinDate: p.created_at ? p.created_at.split('T')[0] : '2026-08-01',
              avatarBg: avatarBgs[idx % avatarBgs.length],
              status: 'active',
            };
          });
          setCustomersList(mappedCustomers);
        }
      } catch (err) {
        console.error('Failed to load orders and customers from Supabase:', err);
      }
    }

    loadOrders();
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
          <DashboardOverview animKey={animKey} productsList={productsList} />
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

        {/* TAB 6: SETTINGS */}
        {activeNav === 'settings' && (
          <SystemSettings />
        )}
      </main>
    </div>
  );
}
