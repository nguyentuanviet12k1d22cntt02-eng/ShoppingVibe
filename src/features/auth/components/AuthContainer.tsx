'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function AuthContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '';
  const errorParam = searchParams.get('error') || '';

  const { signIn, user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Register form state
  const [regStep, setRegStep] = useState<'form' | 'otp'>('form');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirmPass, setShowRegConfirmPass] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

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

  // Resend OTP countdown timer
  useEffect(() => {
    let interval: any = null;
    if (regStep === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [regStep, resendTimer]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await signIn(loginEmail, loginPassword);
      if (!res.success) {
        setErrorMessage(res.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      } else {
        showToast(`Đăng nhập thành công! Chào mừng bạn.`, 'success');
        setTimeout(() => {
          if (res.role === 'admin') {
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

  // Step 1: Submit Registration Form -> Backend creates 6-digit OTP and sends to email
  const handleRegisterFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (regPassword.length < 6) {
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không trùng khớp. Vui lòng nhập lại!');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/register-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          password: regPassword,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMessage(data.error || 'Đăng ký thất bại. Vui lòng thử lại.');
      } else {
        setRegStep('otp');
        setResendTimer(60);
        setCanResend(false);
        setOtpCode('');
        showToast(`Mã OTP 6 số đã được gửi tới email ${regEmail.trim()}!`, 'info');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify 6-digit OTP -> Backend validates and activates account
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (otpCode.trim().length !== 6) {
      setErrorMessage('Vui lòng nhập đầy đủ mã OTP 6 chữ số.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail.trim(),
          otp: otpCode.trim(),
          password: regPassword,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setErrorMessage(data.error || 'Mã OTP không chính xác hoặc đã hết hạn.');
      } else {
        showToast('Xác minh tài khoản thành công! Đang đăng nhập...', 'success');

        // Automatically log in the user with verified credentials
        const loginRes = await signIn(regEmail.trim(), regPassword);
        if (loginRes.success) {
          setTimeout(() => {
            router.push('/');
          }, 500);
        } else {
          setActiveTab('login');
          setLoginEmail(regEmail.trim());
          setRegStep('form');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi xác minh mã OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend 6-digit OTP
  const handleResendOtp = async () => {
    if (!canResend || isSubmitting) return;
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setResendTimer(60);
        setCanResend(false);
        showToast('Đã gửi lại mã OTP mới tới email của bạn.', 'success');
      } else {
        setErrorMessage(data.error || 'Không thể gửi lại mã OTP.');
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
              <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                <i className="fa-solid fa-gift" style={{ marginRight: '6px' }}></i>
                Ưu đãi thành viên mới:
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.95 }}>
                Nhập mã <strong>WELCOME10</strong> để giảm ngay 10% cho đơn hàng đầu tiên!
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="auth-form-panel">
            <div style={{ display: 'flex', gap: '12px', marginBottom: 'var(--space-xl)', borderBottom: '2px solid var(--border-light)', paddingBottom: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setRegStep('form');
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

            {/* TAB 1: LOGIN FORM */}
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
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', border: 'none' }}
                      aria-label="Xem mật khẩu"
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
              /* TAB 2: REGISTER FLOW WITH OTP */
              regStep === 'form' ? (
                /* Step 1: Registration Form */
                <form onSubmit={handleRegisterFormSubmit}>
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
                    <label className="form-label">Email đăng ký</label>
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
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', border: 'none' }}
                        aria-label="Xem mật khẩu"
                      >
                        <i className={`fa-regular ${showRegPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Xác nhận lại mật khẩu</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showRegConfirmPass ? 'text' : 'password'}
                        className="form-control"
                        placeholder="••••••••"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPass(!showRegConfirmPass)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', border: 'none' }}
                        aria-label="Xem mật khẩu xác nhận"
                      >
                        <i className={`fa-regular ${showRegConfirmPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
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
                        <i className="fa-solid fa-spinner fa-spin"></i> Đang gửi mã xác thực...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-envelope" style={{ marginRight: '6px' }}></i>
                        Tiếp tục & Nhận mã OTP 6 số
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: 6-Digit OTP Verification Form */
                <form onSubmit={handleVerifyOtpSubmit}>
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '12px' }}>
                      <i className="fa-solid fa-shield-halved"></i>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
                      Xác Minh Tài Khoản
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      Mã xác minh 6 số đã được gửi tới email: <br />
                      <strong style={{ color: 'var(--text-main)' }}>{regEmail}</strong>
                    </p>
                  </div>

                  <div className="form-group" style={{ textAlign: 'center' }}>
                    <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>
                      Nhập mã OTP 6 số
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="••••••"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      autoFocus
                      required
                      style={{
                        textAlign: 'center',
                        fontSize: '1.6rem',
                        fontWeight: 800,
                        letterSpacing: '8px',
                        padding: '12px',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginTop: 'var(--space-md)' }}
                    disabled={isSubmitting || otpCode.length !== 6}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Đang xác minh mã OTP...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-check" style={{ marginRight: '6px' }}></i>
                        Xác minh & Hoàn tất đăng ký
                      </>
                    )}
                  </button>

                  {/* Resend OTP & Back Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', fontSize: '0.85rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setRegStep('form');
                        setErrorMessage('');
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <i className="fa-solid fa-arrow-left"></i>
                      <span>Đổi email khác</span>
                    </button>

                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 700, cursor: 'pointer' }}
                        disabled={isSubmitting}
                      >
                        <i className="fa-solid fa-arrow-rotate-right" style={{ marginRight: '4px' }}></i>
                        Gửi lại mã OTP
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>
                        Gửi lại mã sau ({resendTimer}s)
                      </span>
                    )}
                  </div>
                </form>
              )
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
