'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';

export interface UserAddress {
  id: string;
  user_email: string;
  recipient_name: string;
  phone: string;
  address_line: string;
  label: string;
  is_default: boolean;
  created_at: string;
}

interface AddressManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onSelectAddress?: (addr: UserAddress) => void;
  selectedAddressId?: string;
}

export default function AddressManagerModal({
  isOpen,
  onClose,
  userEmail,
  onSelectAddress,
  selectedAddressId,
}: AddressManagerModalProps) {
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form State for Add / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formRecipient, setFormRecipient] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLabel, setFormLabel] = useState('Nhà riêng');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAddresses = async () => {
    if (!userEmail) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/addresses?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.success) {
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userEmail) {
      fetchAddresses();
      setIsFormOpen(false);
    }
  }, [isOpen, userEmail]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormRecipient('');
    setFormPhone('');
    setFormAddress('');
    setFormLabel('Nhà riêng');
    setFormIsDefault(addresses.length === 0);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (addr: UserAddress) => {
    setEditingId(addr.id);
    setFormRecipient(addr.recipient_name);
    setFormPhone(addr.phone);
    setFormAddress(addr.address_line);
    setFormLabel(addr.label || 'Nhà riêng');
    setFormIsDefault(addr.is_default);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này khỏi sổ địa chỉ?')) return;
    try {
      const res = await fetch(`/api/addresses?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Đã xóa địa chỉ thành công!', 'info');
        fetchAddresses();
      } else {
        showToast(data.error || 'Lỗi xóa địa chỉ', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi xóa địa chỉ', 'error');
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRecipient.trim() || !formPhone.trim() || !formAddress.trim()) {
      showToast('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        // Update
        const res = await fetch('/api/addresses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            userEmail,
            recipientName: formRecipient,
            phone: formPhone,
            addressLine: formAddress,
            label: formLabel,
            isDefault: formIsDefault,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Đã cập nhật địa chỉ!', 'success');
          setIsFormOpen(false);
          fetchAddresses();
        } else {
          showToast(data.error || 'Lỗi cập nhật', 'error');
        }
      } else {
        // Create
        const res = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail,
            recipientName: formRecipient,
            phone: formPhone,
            addressLine: formAddress,
            label: formLabel,
            isDefault: formIsDefault,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Đã thêm địa chỉ mới vào sổ!', 'success');
          setIsFormOpen(false);
          fetchAddresses();
          if (onSelectAddress && data.address) {
            onSelectAddress(data.address);
          }
        } else {
          showToast(data.error || 'Lỗi thêm địa chỉ', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu địa chỉ', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
          padding: '28px',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              <i className="fa-solid fa-address-book"></i>
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>Sổ Địa Chỉ Giao Hàng</h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Tài khoản: {userEmail}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Form Add / Edit */}
        {isFormOpen ? (
          <form onSubmit={handleSubmitForm} style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className={editingId ? "fa-solid fa-pen-to-square" : "fa-solid fa-plus"} style={{ color: 'var(--primary-color)' }}></i>
              {editingId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ giao hàng mới'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#475569' }}>
                  Họ tên người nhận *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={formRecipient}
                  onChange={e => setFormRecipient(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#475569' }}>
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0901234567"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#475569' }}>
                Địa chỉ chi tiết (Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP) *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Ví dụ: Số 12 Ngõ 34 Phố Hàng Gai, Phường Hàng Gai, Quận Hoàn Kiếm, Hà Nội"
                value={formAddress}
                onChange={e => setFormAddress(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#475569' }}>
                  Nhãn địa chỉ:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Nhà riêng', 'Văn phòng', 'Công ty'].map(lbl => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setFormLabel(lbl)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: formLabel === lbl ? '2px solid var(--primary-color)' : '1px solid #cbd5e1',
                        backgroundColor: formLabel === lbl ? 'var(--primary-light)' : '#ffffff',
                        color: formLabel === lbl ? 'var(--primary-color)' : '#475569',
                      }}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={formIsDefault}
                  onChange={e => setFormIsDefault(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)' }}
                />
                <span>Đặt làm địa chỉ mặc định</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '10px' }}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary btn-sm"
                style={{ borderRadius: '10px', fontWeight: 700 }}
              >
                {isSubmitting ? 'Đang lưu...' : editingId ? 'Lưu cập nhật' : 'Thêm địa chỉ'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ marginBottom: '16px' }}>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="btn btn-outline"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '14px',
                border: '2px dashed var(--primary-color)',
                color: 'var(--primary-color)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: 'rgba(46, 125, 50, 0.04)',
              }}
            >
              <i className="fa-solid fa-circle-plus"></i>
              <span>+ Thêm địa chỉ nhận hàng mới</span>
            </button>
          </div>
        )}

        {/* Address Cards List */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <div style={{ width: '28px', height: '28px', border: '2px solid #e2e8f0', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px auto' }}></div>
            <span>Đang tải danh sách địa chỉ...</span>
          </div>
        ) : addresses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <i className="fa-solid fa-map-location-dot" style={{ fontSize: '2.5rem', color: '#94a3b8', marginBottom: '10px' }}></i>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Bạn chưa có địa chỉ nào được lưu trong sổ.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {addresses.map(addr => {
              const isSelected = selectedAddressId === addr.id;
              return (
                <div
                  key={addr.id}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    border: isSelected ? '2px solid var(--primary-color)' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '0.98rem', color: '#0f172a' }}>{addr.recipient_name}</strong>
                      <span style={{ color: '#64748b', fontSize: '0.88rem' }}>({addr.phone})</span>
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {addr.label}
                      </span>
                      {addr.is_default && (
                        <span style={{ fontSize: '0.75rem', backgroundColor: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                          ● Mặc định
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(addr)}
                        style={{ border: 'none', background: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, padding: '4px' }}
                        title="Chỉnh sửa"
                      >
                        <i className="fa-solid fa-pen-to-square"></i> Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(addr.id)}
                        style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, padding: '4px' }}
                        title="Xóa"
                      >
                        <i className="fa-solid fa-trash-can"></i> Xóa
                      </button>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: '1.5' }}>
                    <i className="fa-solid fa-location-dot" style={{ color: 'var(--primary-color)', marginRight: '6px' }}></i>
                    {addr.address_line}
                  </p>

                  {onSelectAddress && (
                    <div style={{ marginTop: '6px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectAddress(addr);
                          onClose();
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ borderRadius: '10px', fontSize: '0.82rem', padding: '6px 14px', fontWeight: 700 }}
                      >
                        {isSelected ? '✓ Đang chọn địa chỉ này' : 'Giao đến địa chỉ này'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
