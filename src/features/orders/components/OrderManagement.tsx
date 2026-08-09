'use client';

import React, { useState, useMemo } from 'react';
import { formatCurrency } from '@/data/products';
import { Order } from '@/features/admin/data/adminMockData';
import OrderDetailModal from './OrderDetailModal';

interface OrderManagementProps {
  ordersList: Order[];
  setOrdersList: React.Dispatch<React.SetStateAction<Order[]>>;
}

export default function OrderManagement({ ordersList, setOrdersList }: OrderManagementProps) {
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [orderShippingFilter, setOrderShippingFilter] = useState<string>('all');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState<boolean>(false);
  const [currentOrderPage, setCurrentOrderPage] = useState<number>(1);
  const ordersPerPage = 6;

  const handleUpdateShippingStatus = async (orderId: string, newStatus: Order['shippingStatus']) => {
    setOrdersList(prev =>
      prev.map(o => o.id === orderId ? { ...o, shippingStatus: newStatus } : o)
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, shippingStatus: newStatus } : null);
    }
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      await supabase.from('orders').update({ shipping_status: newStatus }).eq('id', orderId);
    } catch (e) {
      console.error('Error updating shipping status in Supabase:', e);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, newStatus: Order['paymentStatus']) => {
    setOrdersList(prev =>
      prev.map(o => o.id === orderId ? { ...o, paymentStatus: newStatus } : o)
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, paymentStatus: newStatus } : null);
    }
    try {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      await supabase.from('orders').update({ payment_status: newStatus }).eq('id', orderId);
    } catch (e) {
      console.error('Error updating payment status in Supabase:', e);
    }
  };

  const getShippingStatusBg = (status: Order['shippingStatus']) => {
    switch (status) {
      case 'pending': return '#f1f5f9';
      case 'processing': return '#eff6ff';
      case 'shipping': return '#f5f3ff';
      case 'completed': return '#f0fdf4';
      case 'cancelled': return '#fef2f2';
      default: return '#ffffff';
    }
  };

  const getShippingStatusColor = (status: Order['shippingStatus']) => {
    switch (status) {
      case 'pending': return '#64748b';
      case 'processing': return '#2563eb';
      case 'shipping': return '#7c3aed';
      case 'completed': return '#15803d';
      case 'cancelled': return '#991b1b';
      default: return '#000000';
    }
  };

  const handleOpenOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  const filteredOrders = useMemo(() => {
    return ordersList.filter(o => {
      if (orderShippingFilter !== 'all' && o.shippingStatus !== orderShippingFilter) return false;
      if (orderPaymentFilter !== 'all' && o.paymentStatus !== orderPaymentFilter) return false;
      if (orderSearch.trim() !== '') {
        const query = orderSearch.toLowerCase().trim();
        const matchId = o.id.toLowerCase().includes(query);
        const matchName = o.customerName.toLowerCase().includes(query);
        const matchPhone = o.customerPhone.includes(query);
        if (!matchId && !matchName && !matchPhone) return false;
      }
      return true;
    });
  }, [ordersList, orderShippingFilter, orderPaymentFilter, orderSearch]);

  const totalOrderPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentOrderPage - 1) * ordersPerPage;
    return filteredOrders.slice(startIndex, startIndex + ordersPerPage);
  }, [filteredOrders, currentOrderPage]);

  return (
    <div className="admin-tab-page" id="tab-orders">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>Quản lý Đơn hàng</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Xem, xử lý vận chuyển và cập nhật trạng thái thanh toán các đơn hàng từ Khách hàng</p>
        </div>

        <div className="order-stats-shortcut" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`cat-pill-btn ${orderShippingFilter === 'all' ? 'active' : ''}`}
            onClick={() => { setOrderShippingFilter('all'); setCurrentOrderPage(1); }}
          >
            Tất cả ({ordersList.length})
          </button>
          <button
            type="button"
            className={`cat-pill-btn ${orderShippingFilter === 'pending' ? 'active' : ''}`}
            onClick={() => { setOrderShippingFilter('pending'); setCurrentOrderPage(1); }}
          >
            Chờ xử lý ({ordersList.filter(o => o.shippingStatus === 'pending').length})
          </button>
          <button
            type="button"
            className={`cat-pill-btn ${orderShippingFilter === 'processing' ? 'active' : ''}`}
            onClick={() => { setOrderShippingFilter('processing'); setCurrentOrderPage(1); }}
          >
            Đang chuẩn bị ({ordersList.filter(o => o.shippingStatus === 'processing').length})
          </button>
          <button
            type="button"
            className={`cat-pill-btn ${orderShippingFilter === 'shipping' ? 'active' : ''}`}
            onClick={() => { setOrderShippingFilter('shipping'); setCurrentOrderPage(1); }}
          >
            Đang giao ({ordersList.filter(o => o.shippingStatus === 'shipping').length})
          </button>
          <button
            type="button"
            className={`cat-pill-btn ${orderShippingFilter === 'completed' ? 'active' : ''}`}
            onClick={() => { setOrderShippingFilter('completed'); setCurrentOrderPage(1); }}
          >
            Đã giao xong ({ordersList.filter(o => o.shippingStatus === 'completed').length})
          </button>
        </div>
      </div>

      <section className="admin-section-card">
        {/* Order Table Toolbar */}
        <div className="admin-table-toolbar">
          <div className="admin-search-box">
            <i className="fa-solid fa-magnifying-glass admin-search-icon"></i>
            <input
              type="text"
              className="admin-table-search"
              placeholder="Tìm mã đơn, tên khách hoặc SĐT..."
              value={orderSearch}
              onChange={(e) => { setOrderSearch(e.target.value); setCurrentOrderPage(1); }}
            />
          </div>

          <div className="admin-filter-controls">
            <select
              className="admin-select-filter"
              value={orderPaymentFilter}
              onChange={(e) => { setOrderPaymentFilter(e.target.value); setCurrentOrderPage(1); }}
            >
              <option value="all">Tất cả thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="pending">Chưa thanh toán</option>
            </select>

            <select
              className="admin-select-filter"
              value={orderShippingFilter}
              onChange={(e) => { setOrderShippingFilter(e.target.value); setCurrentOrderPage(1); }}
            >
              <option value="all">Tất cả vận chuyển</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang chuẩn bị hàng</option>
              <option value="shipping">Đang giao hàng</option>
              <option value="completed">Đã hoàn tất</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Order Table */}
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>MÃ ĐƠN HÀNG</th>
                <th>KHÁCH HÀNG</th>
                <th>NGÀY ĐẶT HÀNG</th>
                <th>TỔNG TIỀN</th>
                <th>THANH TOÁN</th>
                <th>VẬN CHUYỂN</th>
                <th>CHI TIẾT</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 800, color: 'var(--primary-color)' }}>
                      #{order.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{order.customerName}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customerPhone}</span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {order.date}
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                      {formatCurrency(order.total)}
                    </td>
                    <td>
                      <span className={`status-pill ${order.paymentStatus === 'paid' ? 'instock' : 'outstock'}`}>
                        {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                    </td>
                    <td>
                      <select
                        value={order.shippingStatus}
                        onChange={(e) => handleUpdateShippingStatus(order.id, e.target.value as Order['shippingStatus'])}
                        style={{
                          fontSize: '0.8rem',
                          padding: '5px 10px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: getShippingStatusBg(order.shippingStatus),
                          color: getShippingStatusColor(order.shippingStatus),
                          fontWeight: 800,
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Chuẩn bị hàng</option>
                        <option value="shipping">Đang giao</option>
                        <option value="completed">Đã hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-tbl-action edit"
                        title="Xem chi tiết đơn hàng"
                        onClick={() => handleOpenOrderDetail(order)}
                        style={{
                          borderColor: '#bbf7d0',
                          backgroundColor: '#f0fdf4',
                          color: '#16a34a',
                          transition: 'var(--transition-fast)'
                        }}
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary & Pagination for Orders */}
        <div className="admin-table-footer-row">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Hiển thị {filteredOrders.length === 0 ? 0 : (currentOrderPage - 1) * ordersPerPage + 1}–
            {Math.min(currentOrderPage * ordersPerPage, filteredOrders.length)} trong {filteredOrders.length} đơn hàng
          </span>

          <div className="pagination-wrapper" style={{ marginTop: 0 }}>
            <ul className="pagination-list">
              <li>
                <button
                  type="button"
                  className="page-btn"
                  disabled={currentOrderPage === 1}
                  onClick={() => { setCurrentOrderPage(prev => Math.max(prev - 1, 1)); }}
                >
                  « Trước
                </button>
              </li>
              {Array.from({ length: totalOrderPages }, (_, i) => i + 1).map(page => (
                <li key={page}>
                  <button
                    type="button"
                    className={`page-btn ${currentOrderPage === page ? 'active' : ''}`}
                    onClick={() => { setCurrentOrderPage(page); }}
                  >
                    {page}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className="page-btn"
                  disabled={currentOrderPage === totalOrderPages}
                  onClick={() => { setCurrentOrderPage(prev => Math.min(prev + 1, totalOrderPages)); }}
                >
                  Sau »
                </button>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={isOrderDetailOpen}
        selectedOrder={selectedOrder}
        onClose={() => setIsOrderDetailOpen(false)}
        onUpdatePaymentStatus={handleUpdatePaymentStatus}
      />
    </div>
  );
}
