'use client';

import React, { useState } from 'react';
import { StoreSettings } from '@/features/admin/types/admin.types';

export default function SystemSettings() {
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: 'Mini Shop - Không Gian Sống Mộc Mạc',
    phone: '0912 345 678',
    email: 'contact@minishop.vn',
    address: 'Làng gốm Bát Tràng, Gia Lâm, Hà Nội',
    shippingFee: 30000,
    freeShipThreshold: 500000,
    bankName: 'Vietcombank (VCB)',
    accountNumber: '1029384756',
    accountName: 'NGUYEN VAN ADMIN',
    codEnabled: true,
    bankEnabled: true,
    themeColor: '#2e7d32'
  });

  const [showSettingsToast, setShowSettingsToast] = useState<boolean>(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSettingsToast(true);
    setTimeout(() => {
      setShowSettingsToast(false);
    }, 3000);
  };

  return (
    <div className="admin-tab-page" id="tab-settings">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2>Cài đặt hệ thống</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cấu hình vận hành & thanh toán</span>
      </div>

      <form onSubmit={handleSaveSettings}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          
          {/* Block 1: Thông tin cửa hàng */}
          <div className="admin-section-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, borderLeft: '3px solid var(--primary-color)', paddingLeft: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-store" style={{ color: 'var(--primary-color)' }}></i>
              <span>Thông tin Cửa hàng</span>
            </h3>
            
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Tên cửa hàng</label>
              <input
                type="text"
                className="form-input"
                value={storeSettings.storeName}
                onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: 'var(--radius-md)', outline: 'none' }}
                required
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Số điện thoại liên hệ</label>
              <input
                type="text"
                className="form-input"
                value={storeSettings.phone}
                onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: 'var(--radius-md)', outline: 'none' }}
                required
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Email liên hệ</label>
              <input
                type="email"
                className="form-input"
                value={storeSettings.email}
                onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })}
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: 'var(--radius-md)', outline: 'none' }}
                required
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Địa chỉ cửa hàng</label>
              <textarea
                rows={2}
                value={storeSettings.address}
                onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })}
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: 'var(--radius-md)', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                required
              />
            </div>
          </div>

          {/* Block 2: Giao hàng & Vận chuyển */}
          <div className="admin-section-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, borderLeft: '3px solid var(--primary-color)', paddingLeft: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-truck" style={{ color: 'var(--primary-color)' }}></i>
              <span>Cấu hình Vận chuyển</span>
            </h3>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Phí vận chuyển cơ bản (đ)</label>
              <input
                type="number"
                className="form-input"
                value={storeSettings.shippingFee}
                onChange={(e) => setStoreSettings({ ...storeSettings, shippingFee: parseInt(e.target.value) || 0 })}
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: 'var(--radius-md)', outline: 'none' }}
                required
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Ngưỡng miễn phí vận chuyển (đ)</label>
              <input
                type="number"
                className="form-input"
                value={storeSettings.freeShipThreshold}
                onChange={(e) => setStoreSettings({ ...storeSettings, freeShipThreshold: parseInt(e.target.value) || 0 })}
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: 'var(--radius-md)', outline: 'none' }}
                required
              />
            </div>

            {/* Operational status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px', backgroundColor: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Bật ship toàn quốc</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Giao hàng qua các đơn vị GHTK, GHN.</div>
                </div>
                <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)' }} />
              </div>
            </div>
          </div>

          {/* Block 3: Cổng thanh toán & Tích hợp */}
          <div className="admin-section-card" style={{ display: 'grid', gridColumn: 'span 2', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, borderLeft: '3px solid var(--primary-color)', paddingLeft: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-credit-card" style={{ color: 'var(--primary-color)' }}></i>
                <span>Cổng Thanh toán</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fa-solid fa-money-bill-wave" style={{ color: '#16a34a', fontSize: '1.2rem' }}></i>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Thanh toán COD</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trả tiền mặt khi nhận hàng</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={storeSettings.codEnabled}
                    onChange={(e) => setStoreSettings({ ...storeSettings, codEnabled: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fa-solid fa-building-columns" style={{ color: '#2563eb', fontSize: '1.2rem' }}></i>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Chuyển khoản Ngân hàng</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qua VietQR Code tự động</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={storeSettings.bankEnabled}
                    onChange={(e) => setStoreSettings({ ...storeSettings, bankEnabled: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            {storeSettings.bankEnabled && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '1px dashed var(--border-color)', paddingLeft: '20px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)' }}>Thông tin tài khoản nhận tiền</h4>
                
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Tên Ngân hàng</label>
                  <select
                    className="form-input"
                    value={storeSettings.bankName}
                    onChange={(e) => setStoreSettings({ ...storeSettings, bankName: e.target.value })}
                    style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '8px 10px', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', outline: 'none' }}
                  >
                    <option value="Vietcombank (VCB)">Vietcombank (VCB)</option>
                    <option value="Techcombank (TCB)">Techcombank (TCB)</option>
                    <option value="BIDV">BIDV</option>
                    <option value="VietinBank">VietinBank</option>
                    <option value="MB Bank">MB Bank</option>
                  </select>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Số tài khoản</label>
                  <input
                    type="text"
                    className="form-input"
                    value={storeSettings.accountNumber}
                    onChange={(e) => setStoreSettings({ ...storeSettings, accountNumber: e.target.value })}
                    style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '8px 10px', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', outline: 'none' }}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Tên chủ tài khoản (không dấu)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={storeSettings.accountName}
                    onChange={(e) => setStoreSettings({ ...storeSettings, accountName: e.target.value.toUpperCase() })}
                    style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', padding: '8px 10px', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', outline: 'none' }}
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              padding: '12px 28px',
              fontSize: '0.9rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)'
            }}
          >
            <i className="fa-solid fa-floppy-disk"></i>
            <span>Lưu cấu hình hệ thống</span>
          </button>
        </div>
      </form>

      {/* TOAST SUCCESS SETTINGS */}
      {showSettingsToast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          backgroundColor: '#dcfce7',
          border: '1.2px solid #bbf7d0',
          color: '#15803d',
          padding: '16px 24px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 99999,
          animation: 'adminFadeSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          <i className="fa-solid fa-circle-check" style={{ fontSize: '1.3rem', color: 'var(--primary-color)' }}></i>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>Đã lưu thành công!</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mọi thiết lập hệ thống đã được cập nhật thành công.</div>
          </div>
        </div>
      )}
    </div>
  );
}
