'use client';

import React, { Suspense } from 'react';
import ProductList from '@/features/products/components/ProductList';

export default function ProductListPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '60px', textAlign: 'center' }}>Đang tải danh sách sản phẩm...</div>}>
      <ProductList />
    </Suspense>
  );
}
