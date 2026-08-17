'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency, PRODUCTS } from '@/data/products';
import { useProducts } from '@/context/ProductContext';
import { useCart, SelectedVariant } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { createClient } from '@/utils/supabase/client';
import ProductCard from './ProductCard';

interface ProductDetailProps {
  productId?: string;
}

interface DbVariant {
  id: string;
  product_id: string;
  variant_name: string;
  sku?: string;
  price_adjustment: number;
  stock_quantity: number;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const searchParams = useSearchParams();
  const id = productId || searchParams.get('id') || 'p1';
  const { products, isLoading: isProductsLoading } = useProducts();

  const product = useMemo(() => {
    return products.find(p => p.id === id) || PRODUCTS.find(p => p.id === id) || null;
  }, [products, id]);

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = product ? isWishlisted(product.id) : false;

  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<DbVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<DbVariant | null>(null);
  const [activeThumb, setActiveThumb] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoadingExtras, setIsLoadingExtras] = useState<boolean>(true);

  // Fetch images & variants from Supabase
  useEffect(() => {
    let isMounted = true;
    async function fetchExtras() {
      if (!product) return;
      setIsLoadingExtras(true);
      try {
        const supabase = createClient();
        
        // Fetch gallery images
        const { data: imgData } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', product.id)
          .order('display_order', { ascending: true });

        // Fetch variants
        const { data: varData } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', product.id)
          .order('price_adjustment', { ascending: true });

        if (isMounted) {
          if (imgData && imgData.length > 0) {
            const urls = imgData.map((it: any) => it.image_url);
            setGalleryImages(urls);
            setActiveThumb(urls[0]);
          } else {
            setGalleryImages([product.image]);
            setActiveThumb(product.image);
          }

          if (varData && varData.length > 0) {
            setVariants(varData);
            setSelectedVariant(varData[0]);
          } else {
            setVariants([]);
            setSelectedVariant(null);
          }
        }
      } catch (err) {
        console.error('Error fetching product gallery & variants:', err);
        if (isMounted) {
          setGalleryImages([product.image]);
          setActiveThumb(product.image);
        }
      } finally {
        if (isMounted) setIsLoadingExtras(false);
      }
    }

    if (product) {
      setActiveThumb(product.image);
      setQuantity(1);
      fetchExtras();
    }

    return () => {
      isMounted = false;
    };
  }, [product]);

  const handleQuantityMinus = () => {
    setQuantity(q => Math.max(1, q - 1));
  };

  const handleQuantityPlus = () => {
    setQuantity(q => q + 1);
  };

  // Calculate dynamic price based on variant
  const effectivePrice = useMemo(() => {
    if (!product) return 0;
    const adjustment = selectedVariant ? Number(selectedVariant.price_adjustment || 0) : 0;
    return Math.max(0, product.price + adjustment);
  }, [product, selectedVariant]);

  const handleAddToCart = () => {
    if (!product) return;
    const variantPayload: SelectedVariant | undefined = selectedVariant
      ? {
          id: selectedVariant.id,
          variantName: selectedVariant.variant_name,
          priceAdjustment: Number(selectedVariant.price_adjustment || 0),
        }
      : undefined;

    addToCart(product, quantity, variantPayload);
  };

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const sameCat = products.filter(p => p.id !== product.id && p.category === product.category);
    if (sameCat.length >= 4) return sameCat.slice(0, 4);
    return products.filter(p => p.id !== product.id).slice(0, 4);
  }, [products, product]);

  if (!product) {
    return (
      <main className="main-content" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🏺</div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '10px' }}>Không tìm thấy sản phẩm</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 24px auto' }}>
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã ngừng kinh doanh.
          </p>
          <Link href="/product-list" className="btn btn-primary">
            Quay lại danh mục sản phẩm
          </Link>
        </div>
      </main>
    );
  }

  const thumbnails = galleryImages.length > 0 ? galleryImages : [product.image];

  return (
    <main className="main-content">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span className="breadcrumb-separator">›</span>
          <Link href="/product-list">Sản phẩm</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        {/* Detail Layout */}
        <div className="detail-layout">
          {/* Gallery Preview with Multi-Image Thumbnails */}
          <div className="gallery-wrapper">
            <div className="main-preview-img-box" style={{ position: 'relative' }}>
              <Image
                src={activeThumb || product.image}
                alt={product.name}
                fill
                priority
                unoptimized
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="main-preview-img"
                onError={() => {
                  if (activeThumb !== product.image) {
                    setActiveThumb(product.image);
                  }
                }}
              />
              {thumbnails.length > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    right: '16px',
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(6px)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <i className="fa-solid fa-images"></i>
                  <span>
                    {thumbnails.indexOf(activeThumb) + 1} / {thumbnails.length}
                  </span>
                </div>
              )}
            </div>
            
            {thumbnails.length > 1 && (
              <div className="thumb-grid">
                {thumbnails.map((img, idx) => (
                  <div
                    key={idx}
                    className={`thumb-item ${activeThumb === img ? 'active' : ''}`}
                    onClick={() => setActiveThumb(img)}
                    style={{ position: 'relative', cursor: 'pointer' }}
                  >
                    <Image
                      src={img}
                      alt={`Góc chụp ${idx + 1}`}
                      fill
                      unoptimized
                      sizes="80px"
                      style={{ objectFit: 'cover' }}
                      onError={(e: any) => {
                        e.currentTarget.src = product.image;
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="detail-info-box">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <span className="badge badge-emerald">✓ Còn hàng - Giao ngay</span>
              <span className="badge badge-terra">{product.categoryName}</span>
            </div>

            <h1 className="detail-title">{product.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '0.9rem', color: 'var(--accent-gold)' }}>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>(48 đánh giá chất lượng)</span>
            </div>

            {/* Dynamic Price Display */}
            <div className="detail-price-box">
              <span className="detail-price-current">{formatCurrency(effectivePrice)}</span>
              <span className="detail-price-original">{formatCurrency(Math.round(effectivePrice * 1.25))}</span>
              <span className="badge badge-terra" style={{ fontSize: '0.85rem' }}>-20% ƯU ĐÃI</span>
            </div>

            {/* Variants Selector Section */}
            {variants.length > 0 && (
              <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fa-solid fa-layer-group" style={{ color: 'var(--primary-color)' }}></i>
                    Tùy chọn kích thước & phiên bản ({variants.length}):
                  </span>
                  {selectedVariant && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--primary-color)', fontWeight: 700 }}>
                      {selectedVariant.variant_name}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {variants.map(v => {
                    const isSelected = selectedVariant?.id === v.id;
                    const adj = Number(v.price_adjustment || 0);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? '#ecfdf5' : 'var(--bg-surface)',
                          color: isSelected ? '#065f46' : 'var(--text-main)',
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: isSelected ? '0 2px 8px rgba(46, 125, 50, 0.2)' : 'var(--shadow-sm)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {isSelected && <i className="fa-solid fa-circle-check" style={{ color: 'var(--primary-color)' }}></i>}
                        <span>{v.variant_name}</span>
                        {adj > 0 && (
                          <span style={{ fontSize: '0.78rem', backgroundColor: isSelected ? '#d1fae5' : '#f1f5f9', padding: '2px 6px', borderRadius: '6px', color: isSelected ? '#047857' : '#64748b' }}>
                            +{formatCurrency(adj)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <p style={{ fontSize: '0.98rem', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: 'var(--space-xl)' }}>
              {product.description}. Sản phẩm được mạ men nung ở nhiệt độ tiêu chuẩn 1.300°C, bề mặt mịn đẹp mộc mạc. Đáp ứng tiêu chuẩn thẩm mỹ cao nhất cho không gian phòng khách & nếp nhà Việt.
            </p>

            {/* Quantity Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--space-xl)' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Số lượng:</span>
              <div className="quantity-control">
                <button type="button" className="qty-btn" onClick={handleQuantityMinus}>-</button>
                <input
                  type="number"
                  className="qty-input"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value || '1', 10)))}
                  min="1"
                />
                <button type="button" className="qty-btn" onClick={handleQuantityPlus}>+</button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: 'var(--space-xl)' }}>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
                onClick={handleAddToCart}
              >
                <i className="fa-solid fa-cart-shopping"></i> Thêm vào giỏ ({quantity})
              </button>

              <button
                type="button"
                className={`btn ${wishlisted ? 'btn-accent' : 'btn-outline'}`}
                onClick={() => toggleWishlist(product)}
                style={{ padding: '14px 20px' }}
                title="Yêu thích"
              >
                <i className={wishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
              </button>
            </div>

            {/* Trust Badges Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                <i className="fa-solid fa-shield-check" style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}></i>
                <span>Bảo hành 12 tháng</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                <i className="fa-solid fa-truck-ramp-box" style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}></i>
                <span>Kiểm hàng nhận thanh toán</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                <i className="fa-solid fa-rotate-left" style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}></i>
                <span>30 ngày đổi trả</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Tab Details */}
        <section className="detail-tabs-section">
          <div className="tab-header-list">
            <div className="tab-header-item active">Mô tả sản phẩm</div>
            <div className="tab-header-item">Thông số làng nghề</div>
            <div className="tab-header-item">Đánh giá khách hàng (48)</div>
          </div>

          <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '12px' }}>
              <strong>Nguồn gốc sản phẩm:</strong> Sản phẩm thuộc dòng đồ trang trí decor cao cấp, làm từ chất liệu tự nhiên như đất sét nung Bát Tràng, mây tre tự nhiên sấy chống mối mọt.
            </p>
            <p>
              <strong>Hướng dẫn bảo quản:</strong> Lau chùi nhẹ nhàng bằng khăn mềm ẩm. Tránh va đập mạnh hoặc dùng hóa chất tẩy rửa nồng độ cao để giữ trọn màu men và độ bóng bền lâu.
            </p>
          </div>
        </section>

        {/* Related Products Section */}
        <section style={{ marginBottom: 'var(--space-2xl)' }}>
          <div className="section-header">
            <div>
              <span className="eyebrow">Bộ sưu tập đồng điệu</span>
              <h2 className="section-title">Sản Phẩm Tương Tự</h2>
            </div>
            <Link href="/product-list" className="btn btn-outline-green btn-sm">
              Xem tất cả <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          <div className="product-grid">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
