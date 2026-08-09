'use client';

import React, { Suspense } from 'react';
import OrderTrackingPage from '@/features/orders/components/OrderTrackingPage';

export default function OrderTrackingRoute() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Đang tải hành trình đơn hàng...</span>
        </div>
      }
    >
      <OrderTrackingPage />
    </Suspense>
  );
}
