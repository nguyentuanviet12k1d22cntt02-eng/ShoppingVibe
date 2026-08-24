'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import AddressManagerModal from '@/features/addresses/components/AddressManagerModal';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalCartItems } = useCart();
  const { wishlist } = useWishlist();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close menus whenever route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Prevent background scrolling when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    showToast('Đã đăng xuất tài khoản thành công.', 'info');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && !isSearching) {
      setIsSearching(true);
      setIsMobileMenuOpen(false);
      setTimeout(() => {
        router.push(`/product-list?search=${encodeURIComponent(searchQuery.trim())}`);
        setIsSearching(false);
      }, 200);
    }
  };

  if (pathname.startsWith('/admin')) {
    return null;
  }

  // Get short name for compact display (e.g. "Việt", "Nam")
  const shortName = user?.name ? user.name.trim().split(' ').pop() || user.name : '';

  return (
    <header className="site-header">
      <div className="container header-container">
        <nav className="navbar">
          {/* Left: Logo */}
          <Link href="/" className="logo">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 2.5l5 4.5v7h-2v-6H9v6H7v-7l5-4.5z"/>
            </svg>
            <span className="logo-text">Mini Shop</span>
            <span className="logo-tag">ARTISAN</span>
          </Link>

          {/* Center: Navigation Links (Desktop) */}
          <ul className="nav-links desktop-only-nav">
            <li><Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>Trang chủ</Link></li>
            <li><Link href="/product-list" className={`nav-link ${pathname === '/product-list' ? 'active' : ''}`}>Sản phẩm</Link></li>
            <li>
              <Link href="/product-list?sort=newest" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="fa-solid fa-sparkles" style={{ color: 'var(--primary-color)', fontSize: '0.8rem' }}></i>
                <span>Bộ sưu tập mới</span>
              </Link>
            </li>
            <li>
              <Link href="/promotions" className={`nav-link ${pathname.startsWith('/promotions') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="fa-solid fa-fire" style={{ color: '#f97316', fontSize: '0.8rem' }}></i>
                <span>Khuyến mãi Hot</span>
              </Link>
            </li>
            <li>
              <Link
                href="/order-tracking"
                className={`nav-link ${pathname.startsWith('/order-tracking') ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <i className="fa-solid fa-box-open" style={{ color: 'var(--primary-color)', fontSize: '0.85rem' }}></i>
                <span>Đơn hàng</span>
              </Link>
            </li>
          </ul>

          {/* Right Area: Search + Icons + User + Mobile Toggle */}
          <div className="nav-right-group">
            {/* Desktop Compact Search */}
            <form className="search-form desktop-only-search" id="header-search-form" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                name="search"
                id="search-input"
                className="search-input"
                placeholder="Tìm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-btn" aria-label="Tìm kiếm" disabled={isSearching}>
                {isSearching ? (
                  <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '0.9rem', color: 'var(--primary-color)' }}></i>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                )}
              </button>
            </form>

            <div className="nav-actions">
              {/* Wishlist Icon */}
              <Link href="/wishlist" className="cart-icon-btn" aria-label="Yêu thích" title="Sản phẩm yêu thích">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                {wishlist.length > 0 && (
                  <span className="cart-badge">{wishlist.length}</span>
                )}
              </Link>

              {/* Cart Icon */}
              <Link href="/cart" className="cart-icon-btn" aria-label="Giỏ hàng" title="Giỏ hàng">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {totalCartItems > 0 && (
                  <span className="cart-badge">{totalCartItems}</span>
                )}
              </Link>

              {/* User Auth Dropdown (Desktop) */}
              {user ? (
                <div className="user-dropdown-container" ref={userMenuRef}>
                  <button
                    type="button"
                    className="user-dropdown-trigger"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    title={user.name}
                  >
                    <div className="user-avatar-circle">
                      {shortName[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="user-short-name">{shortName}</span>
                    <i className={`fa-solid fa-chevron-down chevron-icon ${isUserMenuOpen ? 'open' : ''}`}></i>
                  </button>

                  {/* Dropdown Floating Menu */}
                  {isUserMenuOpen && (
                    <div className="user-dropdown-menu">
                      <div className="user-dropdown-header">
                        <div className="dropdown-user-name">{user.name}</div>
                        <div className="dropdown-user-email">{user.email}</div>
                      </div>

                      <div className="user-dropdown-list">
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setIsAddressModalOpen(true);
                          }}
                        >
                          <i className="fa-solid fa-address-book" style={{ color: 'var(--primary-color)' }}></i>
                          <span>Sổ địa chỉ giao hàng</span>
                        </button>

                        <Link href="/order-tracking" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                          <i className="fa-solid fa-box-open" style={{ color: '#0284c7' }}></i>
                          <span>Đơn hàng của tôi</span>
                        </Link>

                        {user.role === 'admin' && (
                          <Link href="/admin" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                            <i className="fa-solid fa-shield-halved" style={{ color: '#16a34a' }}></i>
                            <span style={{ fontWeight: 700, color: '#16a34a' }}>Bảng Quản trị Admin</span>
                          </Link>
                        )}

                        <div className="dropdown-divider"></div>

                        <button
                          type="button"
                          className="dropdown-item dropdown-logout-btn"
                          onClick={handleLogout}
                        >
                          <i className="fa-solid fa-right-from-bracket"></i>
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="auth-btn-group desktop-auth-group">
                  <Link href="/auth" className="btn btn-outline btn-sm">Đăng nhập</Link>
                  <Link href="/auth" className="btn btn-primary btn-sm">Đăng ký</Link>
                </div>
              )}

              {/* Hamburger Button for Mobile / Tablet */}
              <button
                type="button"
                className="mobile-hamburger-btn"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Mở menu"
                title="Menu điều hướng"
              >
                <i className="fa-solid fa-bars-staggered"></i>
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="mobile-drawer-header">
              <Link href="/" className="logo" onClick={() => setIsMobileMenuOpen(false)}>
                <svg className="logo-icon" viewBox="0 0 24 24" fill="currentColor" style={{ width: '26px', height: '26px' }}>
                  <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 2.5l5 4.5v7h-2v-6H9v6H7v-7l5-4.5z"/>
                </svg>
                <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>Mini Shop</span>
              </Link>
              <button
                type="button"
                className="mobile-drawer-close"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Đóng menu"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Drawer Search */}
            <form className="mobile-drawer-search" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Tìm sản phẩm thủ công..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </form>

            {/* Drawer Links */}
            <div className="mobile-drawer-body">
              <div className="mobile-drawer-nav-section">
                <span className="mobile-section-title">Menu Chính</span>
                <ul className="mobile-drawer-links">
                  <li>
                    <Link href="/" className={`mobile-nav-link ${pathname === '/' ? 'active' : ''}`}>
                      <i className="fa-solid fa-house"></i>
                      <span>Trang chủ</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/product-list" className={`mobile-nav-link ${pathname === '/product-list' ? 'active' : ''}`}>
                      <i className="fa-solid fa-boxes-stacked"></i>
                      <span>Tất cả sản phẩm</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/product-list?sort=newest" className="mobile-nav-link">
                      <i className="fa-solid fa-sparkles" style={{ color: 'var(--primary-color)' }}></i>
                      <span>Bộ sưu tập mới</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/promotions" className={`mobile-nav-link ${pathname.startsWith('/promotions') ? 'active' : ''}`}>
                      <i className="fa-solid fa-fire" style={{ color: '#f97316' }}></i>
                      <span>Khuyến mãi Hot</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/order-tracking" className={`mobile-nav-link ${pathname.startsWith('/order-tracking') ? 'active' : ''}`}>
                      <i className="fa-solid fa-box-open" style={{ color: 'var(--primary-color)' }}></i>
                      <span>Đơn hàng của tôi</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/wishlist" className={`mobile-nav-link ${pathname === '/wishlist' ? 'active' : ''}`}>
                      <i className="fa-solid fa-heart" style={{ color: '#ef4444' }}></i>
                      <span>Yêu thích ({wishlist.length})</span>
                    </Link>
                  </li>
                </ul>
              </div>

              {/* User Account in Drawer */}
              <div className="mobile-drawer-user-section">
                <span className="mobile-section-title">Tài khoản</span>
                {user ? (
                  <div className="mobile-user-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                      <div className="mobile-user-avatar">
                        {shortName[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>{user.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        type="button"
                        className="mobile-action-btn"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setIsAddressModalOpen(true);
                        }}
                      >
                        <i className="fa-solid fa-address-book" style={{ color: 'var(--primary-color)' }}></i>
                        <span>Sổ địa chỉ giao hàng</span>
                      </button>

                      {user.role === 'admin' && (
                        <Link href="/admin" className="mobile-action-btn" onClick={() => setIsMobileMenuOpen(false)}>
                          <i className="fa-solid fa-shield-halved" style={{ color: '#16a34a' }}></i>
                          <span>Trang Quản trị Admin</span>
                        </Link>
                      )}

                      <button
                        type="button"
                        className="mobile-action-btn btn-danger-action"
                        onClick={handleLogout}
                      >
                        <i className="fa-solid fa-right-from-bracket"></i>
                        <span>Đăng xuất tài khoản</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Link href="/auth" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}>
                      Đăng nhập
                    </Link>
                    <Link href="/auth" className="btn btn-outline" style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}>
                      Đăng ký tài khoản mới
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Address Book Modal */}
      {user?.email && (
        <AddressManagerModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          userEmail={user.email}
        />
      )}
    </header>
  );
}
