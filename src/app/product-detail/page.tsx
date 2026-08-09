'use client';

import React, { Suspense } from 'react';
import ProductDetail from '@/features/products/components/ProductDetail';

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '60px', textAlign: 'center' }}>Đang tải chi tiết sản phẩm...</div>}>
      <ProductDetail />
    </Suspense>
  );
}
