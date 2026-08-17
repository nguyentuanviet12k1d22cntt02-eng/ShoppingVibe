import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import ProductDetail from '@/features/products/components/ProductDetail';
import { PRODUCTS } from '@/data/products';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS.find(p => p.id === id);

  if (!product) {
    return {
      title: 'Chi tiết sản phẩm | Mini Shop Artisan',
      description: 'Khám phá sản phẩm thủ công mỹ nghệ tinh xảo tại Mini Shop.',
    };
  }

  return {
    title: `${product.name} - Mini Shop Artisan`,
    description: product.description || 'Sản phẩm thủ công mỹ nghệ cao cấp phong cách Bắc Âu kết hợp văn hóa Việt.',
    openGraph: {
      title: product.name,
      description: product.description,
      images: [
        {
          url: product.image,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="container" style={{ padding: '60px', textAlign: 'center' }}>Đang tải chi tiết sản phẩm...</div>}>
      <ProductDetail productId={id} />
    </Suspense>
  );
}
