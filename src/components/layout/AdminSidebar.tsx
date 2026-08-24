'use client';

import React from 'react';
import Link from 'next/link';

export type AdminTab = 'overview' | 'products' | 'orders' | 'coupons' | 'customers' | 'chat' | 'settings';

interface AdminSidebarProps {
  activeNav: AdminTab;
  onNavClick: (nav: AdminTab) => void;
}

export default function AdminSidebar({ activeNav, onNavClick }: AdminSidebarProps) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <svg className="logo-icon" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
          <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h6v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" />
        </svg>
        <span>Mini Shop</span>
        <span className="admin-badge">SELLER</span>
      </div>

      <ul className="admin-nav-menu">
        <li className={`admin-nav-item ${activeNav === 'overview' ? 'active' : ''}`}>
          <a onClick={() => onNavClick('overview')}>
            <i className="fa-solid fa-chart-line"></i>
            <span>Tổng quan</span>
          </a>
        </li>
        <li className={`admin-nav-item ${activeNav === 'products' ? 'active' : ''}`}>
          <a onClick={() => onNavClick('products')}>
            <i className="fa-solid fa-box-archive"></i>
            <span>Quản lý Sản phẩm</span>
          </a>
        </li>
        <li className={`admin-nav-item ${activeNav === 'orders' ? 'active' : ''}`}>
          <a onClick={() => onNavClick('orders')}>
            <i className="fa-solid fa-file-invoice-dollar"></i>
            <span>Quản lý Đơn hàng</span>
          </a>
        </li>
        <li className={`admin-nav-item ${activeNav === 'coupons' ? 'active' : ''}`}>
          <a onClick={() => onNavClick('coupons')}>
            <i className="fa-solid fa-ticket"></i>
            <span>Mã giảm giá</span>
          </a>
        </li>
        <li className={`admin-nav-item ${activeNav === 'customers' ? 'active' : ''}`}>
          <a onClick={() => onNavClick('customers')}>
            <i className="fa-solid fa-users"></i>
            <span>Khách hàng</span>
          </a>
        </li>
        <li className={`admin-nav-item ${activeNav === 'chat' ? 'active' : ''}`}>
          <a onClick={() => onNavClick('chat')}>
            <i className="fa-solid fa-comments"></i>
            <span>Live Chat & CSKH</span>
          </a>
        </li>
        <li className={`admin-nav-item ${activeNav === 'settings' ? 'active' : ''}`}>
          <a onClick={() => onNavClick('settings')}>
            <i className="fa-solid fa-gear"></i>
            <span>Cài đặt hệ thống</span>
          </a>
        </li>
      </ul>

      <Link href="/" className="btn-back-to-store">
        <i className="fa-solid fa-arrow-left-long"></i>
        <span>Quay về cửa hàng</span>
      </Link>
    </aside>
  );
}
