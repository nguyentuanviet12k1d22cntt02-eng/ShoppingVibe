'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart, showToastNotification } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalCartItems } = useCart();
  const { wishlist } = useWishlist();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleLogout = async () => {
    await logout();
    showToastNotification('Đã đăng xuất tài khoản thành công.');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && !isSearching) {
      setIsSearching(true);
      setTimeout(() => {
        router.push(`/product-list?search=${encodeURIComponent(searchQuery.trim())}`);
        setIsSearching(false);
      }, 300);
    }
  };

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="site-header">
      <div className="container">
        <nav className="navbar">
          {/* Logo */}
          <Link href="/" className="logo">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 2.5l5 4.5v7h-2v-6H9v6H7v-7l5-4.5z"/>
            </svg>
            <span>Mini Shop</span>
            <span className="logo-tag">ARTISAN</span>
          </Link>

          {/* Navigation Links */}
          <ul className="nav-links">
            <li><Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>Trang chủ</Link></li>
            <li><Link href="/product-list" className={`nav-link ${pathname.startsWith('/product-list') ? 'active' : ''}`}>Sản phẩm</Link></li>
            <li><Link href="/product-list?category=goc-goc" className="nav-link">Gốm Bát Tràng</Link></li>
            <li><Link href="/product-list?category=may-tre" className="nav-link">Mây Tre Đan</Link></li>
          </ul>

          {/* Search Bar */}
          <form className="search-form" id="header-search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              name="search"
              id="search-input"
              className="search-input"
              placeholder="Tìm sản phẩm thủ công..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn" aria-label="Tìm kiếm" disabled={isSearching}>
              {isSearching ? (
                <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '1rem', color: 'var(--primary-color)' }}></i>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              )}
            </button>
          </form>

          {/* Actions */}
          <div className="nav-actions">
            {/* Wishlist Icon Link */}
            <Link href="/wishlist" className="cart-icon-btn" aria-label="Yêu thích" title="Sản phẩm yêu thích">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {wishlist.length > 0 && (
                <span className="cart-badge">{wishlist.length}</span>
              )}
            </Link>

            {/* Cart Icon Link */}
            <Link href="/cart" className="cart-icon-btn" aria-label="Giỏ hàng" title="Giỏ hàng">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {totalCartItems > 0 && (
                <span className="cart-badge">{totalCartItems}</span>
              )}
            </Link>

            {/* User Auth Buttons / User Session Avatar */}
            {user ? (
              <div className="user-account-wrapper">
                <span className="user-avatar-btn">
                  <i className="fa-solid fa-user-circle"></i>
                  <span className="user-name-label">{user.name}</span>
                </span>
                <button type="button" className="btn-logout" onClick={handleLogout} title="Đăng xuất">
                  <i className="fa-solid fa-right-from-bracket"></i>
                </button>
              </div>
            ) : (
              <div className="auth-btn-group" style={{ display: 'flex', gap: '8px' }}>
                <Link href="/auth" className="btn btn-outline btn-sm">Đăng nhập</Link>
                <Link href="/auth" className="btn btn-primary btn-sm">Đăng ký</Link>
              </div>
            )}

            {/* Admin Dashboard Link Button (Only visible for Admins) */}
            {user?.role === 'admin' && (
              <Link href="/admin" className="btn btn-outline-green btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                <i className="fa-solid fa-shield-halved"></i> Admin
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
