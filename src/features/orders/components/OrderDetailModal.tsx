'use client';

import React from 'react';
import { formatCurrency } from '@/data/products';
import { Order } from '@/features/admin/data/adminMockData';

interface OrderDetailModalProps {
  isOpen: boolean;
  selectedOrder: Order | null;
  onClose: () => void;
  onUpdatePaymentStatus: (orderId: string, status: Order['paymentStatus']) => void;
}

export default function OrderDetailModal({
  isOpen,
  selectedOrder,
  onClose,
  onUpdatePaymentStatus,
}: OrderDetailModalProps) {
  return (
    <div className={`admin-modal-backdrop ${isOpen ? 'active' : ''}`} id="order-modal">
      <div className="admin-modal-card" style={{ maxWidth: '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '20px' }}>
        <div className="modal-header" style={{ flexShrink: 0, marginBottom: '16px' }}>
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-file-invoice-dollar" style={{ color: 'var(--primary-color)' }}></i>
            <span>Chi tiết đơn hàng #{selectedOrder?.id}</span>
          </h3>
          <button
            type="button"
            className="btn-close-modal"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {selectedOrder && (
          <>
            {/* Scrollable Modal Content Body */}
            <div className="custom-slim-scrollbar hide-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, paddingRight: '8px', marginBottom: '12px' }}>
              {/* Order Summary & Status Pill */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Thời gian đặt hàng</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedOrder.date}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hình thức thanh toán</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase' }}>
                    {selectedOrder.paymentMethod === 'cod' ? 'Thanh toán COD' : 'Chuyển khoản Ngân hàng'}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, borderLeft: '3px solid var(--primary-color)', paddingLeft: '8px', marginBottom: '8px' }}>
                  Thông tin khách hàng
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.875rem', paddingLeft: '11px' }}>
                  <div><strong>Họ và tên:</strong> {selectedOrder.customerName}</div>
                  <div><strong>Số điện thoại:</strong> {selectedOrder.customerPhone}</div>
                  <div><strong>Email:</strong> {selectedOrder.customerEmail}</div>
                  <div><strong>Địa chỉ giao hàng:</strong> {selectedOrder.address}</div>
                  {selectedOrder.notes && (
                    <div style={{ color: '#0f766e', backgroundColor: '#f0fdfa', padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginTop: '4px' }}>
                      <strong>Ghi chú:</strong> {selectedOrder.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Product items list */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, borderLeft: '3px solid var(--primary-color)', paddingLeft: '8px', marginBottom: '12px' }}>
                  Danh sách sản phẩm mua ({selectedOrder.items.length})
                </h4>
                <div className="custom-slim-scrollbar" style={{ maxHeight: '200px' }}>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px dashed var(--border-light)', paddingBottom: '8px', paddingRight: '4px', marginBottom: '8px' }}>
                      <img src={item.image} alt={item.productName} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{item.productName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Đơn giá: {formatCurrency(item.price)}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.875rem' }}>x{item.quantity}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary-color)', minWidth: '90px', textAlign: 'right' }}>
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tạm tính:</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Phí vận chuyển:</span>
                  <span>Miễn phí</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', borderTop: '1px dashed var(--border-color)', paddingTop: '8px' }}>
                  <span>TỔNG CỘNG:</span>
                  <span style={{ color: 'var(--primary-color)' }}>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Fixed Action Update in Modal Footer */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Thanh toán:</span>
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => onUpdatePaymentStatus(selectedOrder.id, e.target.value as Order['paymentStatus'])}
                  style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontWeight: 700 }}
                >
                  <option value="pending">Chưa thanh toán</option>
                  <option value="paid">Đã thanh toán</option>
                </select>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
              >
                Đóng lại
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
