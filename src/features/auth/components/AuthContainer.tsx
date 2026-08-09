'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { showToastNotification } from '@/context/CartContext';

export default function AuthContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '';
  const errorParam = searchParams.get('error') || '';

  const { signIn, signUp, user } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already logged in, redirect based on role or param
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push(redirectUrl || '/admin');
      } else {
        router.push(redirectUrl && redirectUrl !== '/admin' ? redirectUrl : '/');
      }
    }
  }, [user, redirectUrl, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await signIn(loginEmail, loginPassword);
      if (!res.success) {
        setErrorMessage(res.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      } else {
        showToastNotification(`Đăng nhập thành công! Chào mừng bạn.`);
        setTimeout(() => {
          if (res.role === 'admin' || loginEmail.trim().toLowerCase() === 'nguyentuanviet12k1@gmail.com') {
            router.push('/admin');
          } else {
            router.push(redirectUrl && redirectUrl !== '/admin' ? redirectUrl : '/');
          }
        }, 500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (regPassword.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await signUp(regName, regEmail, regPassword);
      if (!res.success) {
        setErrorMessage(res.error || 'Đăng ký thất bại. Vui lòng thử lại.');
      } else {
        showToastNotification(`Đăng ký thành công! Chào mừng ${regName} đến với Mini Shop.`);
        setTimeout(() => {
          router.push('/');
        }, 500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối máy chủ.');
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
          <span className="breadcrumb-current">Tài khoản cá nhân</span>
        </nav>

        {/* Split Screen Auth Container */}
        <div className="auth-container">
          {/* Left Visual Banner */}
          <div className="auth-banner-panel">
            <div>
              <span className="eyebrow" style={{ color: 'white', opacity: 0.9 }}>
                <i className="fa-solid fa-leaf"></i> Mini Shop Artisan
              </span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.2, marginTop: '12px', marginBottom: '16px' }}>
                Đón Bình Yên Vào Nếp Nhà Việt
              </h2>
              <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: 1.6 }}>
                Đăng nhập để theo dõi đơn hàng, lưu danh sách sản phẩm yêu thích và nhận ưu đãi độc quyền dành riêng cho bạn.
              </p>
            </div>

            <div style={{ padding: '20px', backgroundColor: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(8px)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <div style={{ fontWeight: 700, marginBottom: '4px' }}>⭐ Ưu đãi thành viên mới:</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.95 }}>Nhập mã <strong>MINI10</strong> để giảm ngay 10% cho đơn hàng đầu tiên!</div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="auth-form-panel">
            <div style={{ display: 'flex', gap: '12px', marginBottom: 'var(--space-xl)', borderBottom: '2px solid var(--border-light)', paddingBottom: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage('');
                }}
                style={{ fontSize: '1.2rem', fontWeight: 800, background: 'none', cursor: 'pointer', color: activeTab === 'login' ? 'var(--primary-color)' : 'var(--text-muted)' }}
              >
                Đăng nhập
              </button>
              <span style={{ fontSize: '1.2rem', color: 'var(--border-color)' }}>|</span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMessage('');
                }}
                style={{ fontSize: '1.2rem', fontWeight: 800, background: 'none', cursor: 'pointer', color: activeTab === 'register' ? 'var(--primary-color)' : 'var(--text-muted)' }}
              >
                Tạo tài khoản mới
              </button>
            </div>

            {/* Unauthorized access warning banner */}
            {errorParam === 'unauthorized' && !errorMessage && (
              <div style={{ padding: '12px 16px', backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '12px', color: '#b45309', fontSize: '0.9rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>Tài khoản của bạn không có quyền truy cập khu vực Quản trị. Vui lòng đăng nhập tài khoản Quản trị viên.</span>
              </div>
            )}

            {/* Error message alert */}
            {errorMessage && (
              <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', color: '#991b1b', fontSize: '0.9rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{errorMessage}</span>
              </div>
            )}

            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label">Email đăng nhập</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="nguyenvana@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mật khẩu</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showLoginPass ? 'text' : 'password'}
                      className="form-control"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPass(!showLoginPass)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <i className={`fa-regular ${showLoginPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginTop: 'var(--space-md)' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Đang đăng nhập...
                    </>
                  ) : (
                    'Đăng nhập ngay'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit}>
                <div className="form-group">
                  <label className="form-label">Họ và tên</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nguyễn Văn A"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="nguyenvana@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mật khẩu (Tối thiểu 6 ký tự)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showRegPass ? 'text' : 'password'}
                      className="form-control"
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPass(!showRegPass)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <i className={`fa-regular ${showRegPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-accent btn-lg"
                  style={{ width: '100%', marginTop: 'var(--space-md)' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Đang tạo tài khoản...
                    </>
                  ) : (
                    'Đăng ký tài khoản'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

