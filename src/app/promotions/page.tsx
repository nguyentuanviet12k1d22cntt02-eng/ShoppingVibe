import React from 'react';
import { Metadata } from 'next';
import PromotionsPage from '@/features/promotions/components/PromotionsPage';

export const metadata: Metadata = {
  title: 'Khuyến Mãi Hot & Flash Sale Giờ Vàng | Mini Shop Artisan',
  description: 'Đại tiệc khuyến mãi đồ nội thất và thủ công mỹ nghệ cao cấp. Giảm giá đến 45%, kho voucher freeship và quà tặng hấp dẫn mỗi ngày.',
};

export default function Page() {
  return <PromotionsPage />;
}
