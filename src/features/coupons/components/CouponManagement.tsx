'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '@/data/products';
import { useToast } from '@/context/ToastContext';

export interface CouponItem {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  usage_limit: number;
  used_count: number;
  end_date?: string;
  is_active: boolean;
  created_at: string;
}

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  // Form State
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [formValue, setFormValue] = useState('');
  const [formMinOrder, setFormMinOrder] = useState('0');
  const [formMaxDiscount, setFormMaxDiscount] = useState('');
  const [formUsageLimit, setFormUsageLimit] = useState('100');
  const [formEndDate, setFormEndDate] = useState('');

  const fetchCoupons = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/coupons');
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      showToast('Không thể tải danh sách mã giảm giá.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleToggleActive = async (coupon: CouponItem) => {
    const nextStatus = !coupon.is_active;
    setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: nextStatus } : c));

    try {
      const res = await fetch('/api/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: coupon.id, is_active: nextStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error);
      }
      showToast(`Đã ${nextStatus ? 'kích hoạt' : 'tạm dừng'} mã "${coupon.code}"`, 'success');
    } catch (err: any) {
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: coupon.is_active } : c));
      showToast(`Lỗi: ${err.message || 'Không thể cập nhật'}`, 'error');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa mã giảm giá "${code}"?`)) return;

    setCoupons(prev => prev.filter(c => c.id !== id));
    try {
      const res = await fetch(`/api/coupons?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      showToast(`Đã xóa mã "${code}" thành công!`, 'info');
    } catch (err: any) {
      fetchCoupons();
      showToast(`Không thể xóa: ${err.message}`, 'error');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) {
      showToast('Vui lòng nhập mã voucher!', 'warning');
      return;
    }
    if (!formValue || Number(formValue) <= 0) {
      showToast('Vui lòng nhập mức giảm giá hợp lệ!', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formCode.trim().toUpperCase(),
          description: formDescription.trim(),
          discount_type: formType,
          discount_value: Number(formValue),
          min_order_amount: Number(formMinOrder) || 0,
          max_discount_amount: formMaxDiscount ? Number(formMaxDiscount) : null,
          usage_limit: Number(formUsageLimit) || 100,
          end_date: formEndDate ? new Date(formEndDate).toISOString() : null,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Lỗi khi tạo mã.');
      }

      showToast(`Đã tạo thành công mã giảm giá "${data.coupon.code}"!`, 'success');
      setIsModalOpen(false);
      // Reset form
      setFormCode('');
      setFormDescription('');
      setFormValue('');
      setFormMinOrder('0');
      setFormMaxDiscount('');
      setFormUsageLimit('100');
      setFormEndDate('');
      fetchCoupons();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi tạo mã.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && c.is_active) ||
      (statusFilter === 'inactive' && !c.is_active);
    return matchesSearch && matchesStatus;
  });

  const totalUsed = coupons.reduce((sum, c) => sum + (c.used_count || 0), 0);
  const activeCount = coupons.filter(c => c.is_active).length;

  return (
    <div className="admin-content-inner">
      {/* Top Banner & Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Tổng số Voucher</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{coupons.length}</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 600 }}>Đang hoạt động</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-color)', marginTop: '4px' }}>{activeCount}</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--accent-warm)', fontWeight: 600 }}>Tổng lượt đã dùng</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-warm)', marginTop: '4px' }}>{totalUsed}</div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px', backgroundColor: '#ffffff', padding: '16px 20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm theo mã hoặc mô tả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px', height: '40px', fontSize: '0.9rem' }}
            />
          </div>

          <select
            className="form-control"
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            style={{ width: '160px', height: '40px', fontSize: '0.9rem' }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang bật</option>
            <option value="inactive">Đang tắt</option>
          </select>
        </div>

        <button
          type="button"
          className="btn btn-accent"
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontWeight: 700 }}
        >
          <i className="fa-solid fa-plus"></i> Tạo Mã Giảm Giá Mới
        </button>
      </div>

      {/* Coupons Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {isLoading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '12px' }}></i>
            <div>Đang tải danh sách voucher...</div>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-ticket" style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.4 }}></i>
            <div>Chưa có mã giảm giá nào phù hợp.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 20px' }}>Mã Voucher</th>
                  <th style={{ padding: '14px 16px' }}>Mức Giảm</th>
                  <th style={{ padding: '14px 16px' }}>Đơn Tối Thiểu</th>
                  <th style={{ padding: '14px 16px' }}>Lượt Dùng</th>
                  <th style={{ padding: '14px 16px' }}>Hạn Dùng</th>
                  <th style={{ padding: '14px 16px' }}>Trạng Thái</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1rem', color: 'var(--primary-color)', backgroundColor: 'var(--primary-surface)', padding: '4px 10px', borderRadius: '8px', border: '1px dashed var(--primary-color)' }}>
                          {c.code}
                        </span>
                      </div>
                      {c.description && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {c.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px 16px', fontWeight: 700, color: 'var(--text-main)' }}>
                      {c.discount_type === 'percentage' ? (
                        <span>Giảm {c.discount_value}%</span>
                      ) : (
                        <span>Giảm {formatCurrency(c.discount_value)}</span>
                      )}
                      {c.max_discount_amount && c.discount_type === 'percentage' && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                          Tối đa: {formatCurrency(c.max_discount_amount)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px 16px', color: 'var(--text-main)' }}>
                      {c.min_order_amount > 0 ? formatCurrency(c.min_order_amount) : '0đ'}
                    </td>
                    <td style={{ padding: '16px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{c.used_count} / {c.usage_limit || '∞'}</div>
                      <div style={{ width: '80px', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, ((c.used_count || 0) / (c.usage_limit || 100)) * 100)}%`, height: '100%', backgroundColor: 'var(--primary-color)' }}></div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {c.end_date ? new Date(c.end_date).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                    </td>
                    <td style={{ padding: '16px 16px' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(c)}
                        style={{
                          border: 'none',
                          padding: '5px 12px',
                          borderRadius: '99px',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          backgroundColor: c.is_active ? 'var(--primary-light)' : '#fee2e2',
                          color: c.is_active ? 'var(--primary-color)' : '#ef4444',
                        }}
                      >
                        {c.is_active ? '● Hoạt động' : '○ Tạm tắt'}
                      </button>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id, c.code)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          transition: 'background-color 0.2s',
                        }}
                        title="Xóa voucher"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '520px', width: '100%', padding: '28px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Tạo Mã Giảm Giá Mới</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleCreateCoupon}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>Mã Voucher * (In hoa, không dấu)</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="Ví dụ: TET2026, SUMMER50"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>Mô tả ngắn</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: Giảm 10% đơn từ 500k mừng lễ"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>Loại giảm giá</label>
                  <select
                    className="form-control"
                    value={formType}
                    onChange={(e: any) => setFormType(e.target.value)}
                  >
                    <option value="percentage">Theo Phần trăm (%)</option>
                    <option value="fixed_amount">Số tiền cố định (đ)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>
                    {formType === 'percentage' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (đ)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="form-control"
                    placeholder={formType === 'percentage' ? 'Ví dụ: 15' : 'Ví dụ: 50000'}
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>Đơn tối thiểu (đ)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="0"
                    value={formMinOrder}
                    onChange={(e) => setFormMinOrder(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>Giảm tối đa (đ)</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="Không giới hạn"
                    disabled={formType === 'fixed_amount'}
                    value={formMaxDiscount}
                    onChange={(e) => setFormMaxDiscount(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>Giới hạn lượt dùng</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    placeholder="100"
                    value={formUsageLimit}
                    onChange={(e) => setFormUsageLimit(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>Ngày hết hạn</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-accent" disabled={isSubmitting}>
                  {isSubmitting ? <><i className="fa-solid fa-spinner fa-spin"></i> Đang lưu...</> : 'Lưu Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
