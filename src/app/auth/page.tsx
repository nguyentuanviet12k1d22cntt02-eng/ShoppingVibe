'use client';

import React, { Suspense } from 'react';
import AuthContainer from '@/features/auth/components/AuthContainer';

export default function AuthPageRoute() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '60px', textAlign: 'center' }}>Đang tải...</div>}>
      <AuthContainer />
    </Suspense>
  );
}
