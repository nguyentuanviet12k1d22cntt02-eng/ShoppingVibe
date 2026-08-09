'use client';

import React, { useState, useMemo } from 'react';
import { Customer } from '@/features/customers/types/customers.types';
import { formatCurrency } from '@/data/products';

interface CustomerManagementProps {
  customersList: Customer[];
  setCustomersList: React.Dispatch<React.SetStateAction<Customer[]>>;
}

export default function CustomerManagement({
  customersList,
}: CustomerManagementProps) {
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [customerLevelFilter, setCustomerLevelFilter] = useState<string>('all');
  const [customerStatusFilter, setCustomerStatusFilter] = useState<string>('all');
  const [currentCustomerPage, setCurrentCustomerPage] = useState<number>(1);
  const customersPerPage = 6;

  const getCustomerLevelLabel = (level: Customer['level']) => {
    switch (level) {
      case 'platinum': return 'Bạch kim';
      case 'gold': return 'Vàng';
      case 'silver': return 'Bạc';
      case 'bronze': return 'Đồng';
      default: return '';
    }
  };

  const getCustomerLevelColor = (level: Customer['level']) => {
    switch (level) {
      case 'platinum': return '#f1f5f9';
      case 'gold': return '#fef3c7';
      case 'silver': return '#f1f5f9';
      case 'bronze': return '#ffedd5';
      default: return '#f1f5f9';
    }
  };

  const getCustomerLevelTextColor = (level: Customer['level']) => {
    switch (level) {
      case 'platinum': return '#475569';
      case 'gold': return '#d97706';
      case 'silver': return '#64748b';
      case 'bronze': return '#c2410c';
      default: return '#64748b';
    }
  };

  // Customers selectors
  const filteredCustomers = useMemo(() => {
    return customersList.filter(c => {
      if (customerLevelFilter !== 'all' && c.level !== customerLevelFilter) return false;
      if (customerStatusFilter !== 'all' && c.status !== customerStatusFilter) return false;
      if (customerSearch.trim() !== '') {
        const query = customerSearch.toLowerCase().trim();
        const matchName = c.name.toLowerCase().includes(query);
        const matchPhone = c.phone.includes(query);
        const matchEmail = c.email.toLowerCase().includes(query);
        if (!matchName && !matchPhone && !matchEmail) return false;
      }
      return true;
    });
  }, [customersList, customerLevelFilter, customerStatusFilter, customerSearch]);

  const totalCustomerPages = Math.ceil(filteredCustomers.length / customersPerPage) || 1;
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentCustomerPage - 1) * customersPerPage;
    return filteredCustomers.slice(startIndex, startIndex + customersPerPage);
  }, [filteredCustomers, currentCustomerPage]);

  return (
    <div className="admin-tab-page" id="tab-customers">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2>Quản lý Khách hàng</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Tổng số: <strong>{customersList.length}</strong> khách hàng đăng ký
        </span>
      </div>

      {/* Customer KPI Cards */}
      <div className="admin-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Card 1: Tổng khách hàng */}
        <div className="kpi-card" style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          transition: 'var(--transition-fast)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', maxWidth: '70%' }}>
              Tổng khách hàng
            </span>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1.2px solid var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              color: 'var(--text-main)',
              cursor: 'pointer',
              fontWeight: 500
            }}>
              ↗
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1, marginBottom: '20px' }}>
            {customersList.length}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem' }}>
            <div style={{
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid #16a34a',
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 700
            }}>
              <span>12</span>
              <span style={{ fontSize: '0.65rem' }}>▲</span>
            </div>
            <span style={{ color: '#16a34a', fontWeight: 600 }}>Tăng trưởng tháng này</span>
          </div>
        </div>

        {/* Card 2: Thành viên Bạch kim */}
        <div className="kpi-card" style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          transition: 'var(--transition-fast)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', maxWidth: '70%' }}>
              Hội viên Bạch kim
            </span>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1.2px solid var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              color: 'var(--text-main)',
              cursor: 'pointer',
              fontWeight: 500
            }}>
              ↗
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1, marginBottom: '20px' }}>
            {customersList.filter(c => c.level === 'platinum').length}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem' }}>
            <div style={{
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid #16a34a',
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 700
            }}>
              <span>5</span>
              <span style={{ fontSize: '0.65rem' }}>▲</span>
            </div>
            <span style={{ color: '#16a34a', fontWeight: 600 }}>Chiếm tỷ trọng VIP</span>
          </div>
        </div>

        {/* Card 3: Chi tiêu trung bình */}
        <div className="kpi-card" style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          transition: 'var(--transition-fast)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', maxWidth: '70%' }}>
              Chi tiêu trung bình
            </span>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1.2px solid var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              color: 'var(--text-main)',
              cursor: 'pointer',
              fontWeight: 500
            }}>
              ↗
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1, marginBottom: '20px' }}>
            {formatCurrency(Math.round(customersList.reduce((sum, c) => sum + c.totalSpend, 0) / customersList.length))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem' }}>
            <div style={{
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid #16a34a',
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 700
            }}>
              <span>8.4%</span>
              <span style={{ fontSize: '0.65rem' }}>▲</span>
            </div>
            <span style={{ color: '#16a34a', fontWeight: 600 }}>Tăng từ tháng trước</span>
          </div>
        </div>

        {/* Card 4: Tỷ lệ hoạt động */}
        <div className="kpi-card" style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          transition: 'var(--transition-fast)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', maxWidth: '70%' }}>
              Tỷ lệ hoạt động
            </span>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1.2px solid var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              color: 'var(--text-main)',
              cursor: 'pointer',
              fontWeight: 500
            }}>
              ↗
            </div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1, marginBottom: '20px' }}>
            {Math.round((customersList.filter(c => c.status === 'active').length / customersList.length) * 100)}%
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem' }}>
            <div style={{
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid #16a34a',
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 700
            }}>
              <span>Active</span>
            </div>
            <span style={{ color: '#16a34a', fontWeight: 600 }}>Tương tác ổn định</span>
          </div>
        </div>

      </div>

      {/* Stats shortcut filter pills */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
        <div className="order-stats-shortcut" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`cat-pill-btn ${customerLevelFilter === 'all' ? 'active' : ''}`}
            onClick={() => { setCustomerLevelFilter('all'); setCurrentCustomerPage(1); }}
          >
            Tất cả ({customersList.length})
          </button>
          <button
            type="button"
            className={`cat-pill-btn ${customerLevelFilter === 'platinum' ? 'active' : ''}`}
            onClick={() => { setCustomerLevelFilter('platinum'); setCurrentCustomerPage(1); }}
          >
            Bạch kim ({customersList.filter(c => c.level === 'platinum').length})
          </button>
          <button
            type="button"
            className={`cat-pill-btn ${customerLevelFilter === 'gold' ? 'active' : ''}`}
            onClick={() => { setCustomerLevelFilter('gold'); setCurrentCustomerPage(1); }}
          >
            Hạng Vàng ({customersList.filter(c => c.level === 'gold').length})
          </button>
          <button
            type="button"
            className={`cat-pill-btn ${customerLevelFilter === 'silver' ? 'active' : ''}`}
            onClick={() => { setCustomerLevelFilter('silver'); setCurrentCustomerPage(1); }}
          >
            Hạng Bạc ({customersList.filter(c => c.level === 'silver').length})
          </button>
          <button
            type="button"
            className={`cat-pill-btn ${customerLevelFilter === 'bronze' ? 'active' : ''}`}
            onClick={() => { setCustomerLevelFilter('bronze'); setCurrentCustomerPage(1); }}
          >
            Hạng Đồng ({customersList.filter(c => c.level === 'bronze').length})
          </button>
        </div>
      </div>

      <section className="admin-section-card">
        {/* Customer Table Toolbar */}
        <div className="admin-table-toolbar">
          <div className="admin-search-box">
            <i className="fa-solid fa-magnifying-glass admin-search-icon"></i>
            <input
              type="text"
              className="admin-table-search"
              placeholder="Tìm tên, email hoặc SĐT khách hàng..."
              value={customerSearch}
              onChange={(e) => { setCustomerSearch(e.target.value); setCurrentCustomerPage(1); }}
            />
          </div>

          <div className="admin-filter-controls">
            <select
              className="admin-select-filter"
              value={customerStatusFilter}
              onChange={(e) => { setCustomerStatusFilter(e.target.value); setCurrentCustomerPage(1); }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Tạm khóa</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>HỌ TÊN KHÁCH HÀNG</th>
                <th>LIÊN HỆ</th>
                <th>CẤP ĐỘ VIP</th>
                <th>TỔNG CHI TIÊU</th>
                <th style={{ textAlign: 'center' }}>SỐ ĐƠN MUA</th>
                <th>NGÀY GIA NHẬP</th>
                <th>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    Không tìm thấy khách hàng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map(cust => (
                  <tr key={cust.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: cust.avatarBg,
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '0.9rem'
                        }}>
                          {cust.name.split(' ').pop()?.[0]?.toUpperCase() || 'K'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{cust.name}</div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{cust.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600 }}>{cust.phone}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cust.email}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.7rem',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 800,
                          backgroundColor: getCustomerLevelColor(cust.level),
                          color: getCustomerLevelTextColor(cust.level),
                          textTransform: 'uppercase'
                        }}
                      >
                        {getCustomerLevelLabel(cust.level)}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      {formatCurrency(cust.totalSpend)}
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: '0.95rem', textAlign: 'center' }}>
                      {cust.ordersCount}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {cust.joinDate}
                    </td>
                    <td>
                      <span className={`status-pill ${cust.status === 'active' ? 'instock' : 'outstock'}`}>
                        {cust.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Customer Pagination */}
        <div className="admin-table-footer-row">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Hiển thị {filteredCustomers.length === 0 ? 0 : (currentCustomerPage - 1) * customersPerPage + 1}–
            {Math.min(currentCustomerPage * customersPerPage, filteredCustomers.length)} trong {filteredCustomers.length} khách hàng
          </span>

          <div className="pagination-wrapper" style={{ marginTop: 0 }}>
            <ul className="pagination-list">
              <li>
                <button
                  type="button"
                  className="page-btn"
                  disabled={currentCustomerPage === 1}
                  onClick={() => { setCurrentCustomerPage(prev => Math.max(prev - 1, 1)); }}
                >
                  « Trước
                </button>
              </li>
              {Array.from({ length: totalCustomerPages }, (_, i) => i + 1).map(page => (
                <li key={page}>
                  <button
                    type="button"
                    className={`page-btn ${currentCustomerPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentCustomerPage(page)}
                  >
                    {page}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className="page-btn"
                  disabled={currentCustomerPage === totalCustomerPages}
                  onClick={() => { setCurrentCustomerPage(prev => Math.min(prev + 1, totalCustomerPages)); }}
                >
                  Sau »
                </button>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
