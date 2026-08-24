'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency, PRODUCTS } from '@/data/products';
import { useProducts } from '@/context/ProductContext';
import { useCart, SelectedVariant } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
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

interface Review {
  id: string;
  product_id: string;
  user_name: string;
  user_email?: string;
  rating: number;
  comment: string;
  location?: string;
  is_verified_purchase: boolean;
  created_at: string;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const searchParams = useSearchParams();
  const id = productId || searchParams.get('id') || 'p1';
  const { products, isLoading: isProductsLoading } = useProducts();
  const { user } = useAuth();
  const { showToast } = useToast();

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
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  // Reviews state & Form
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewName, setReviewName] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

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
            const fallbackGallery = (product as any)?.gallery || [product.image];
            setGalleryImages(fallbackGallery);
            setActiveThumb(fallbackGallery[0] || product.image);
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
          const fallbackGallery = (product as any)?.gallery || [product.image];
          setGalleryImages(fallbackGallery);
          setActiveThumb(fallbackGallery[0] || product.image);
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

  // Load reviews for this product
  useEffect(() => {
    async function loadReviews() {
      if (!product) return;
      try {
        const res = await fetch(`/api/reviews?productId=${product.id}`);
        const data = await res.json();
        if (data.success && data.reviews) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error('Error fetching product reviews:', err);
      }
    }
    loadReviews();
  }, [product]);

  // Set default review name from logged-in user
  useEffect(() => {
    if (user?.name && !reviewName) {
      setReviewName(user.name);
    }
  }, [user, reviewName]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!reviewName.trim() || !reviewComment.trim()) {
      showToast('Vui lòng nhập họ tên và nhận xét của bạn.', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userName: reviewName.trim(),
          userEmail: user?.email || '',
          rating: reviewRating,
          comment: reviewComment.trim(),
          location: 'Hà Nội',
        }),
      });

      const data = await res.json();
      if (data.success && data.review) {
        setReviews(prev => [data.review, ...prev]);
        setReviewComment('');
        showToast('Đã gửi đánh giá sản phẩm thành công!', 'success');
      } else {
        showToast(data.error || 'Lỗi gửi đánh giá', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi gửi đánh giá', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 5;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return Number((total / reviews.length).toFixed(1));
  }, [reviews]);

  const maxAvailableStock = useMemo(() => {
    if (!product) return 0;
    if (product.inStock === false) return 0;
    return product.stockCount !== undefined ? product.stockCount : 99;
  }, [product]);

  const isOutOfStock = maxAvailableStock <= 0;

  const handleQuantityMinus = () => {
    setQuantity(q => Math.max(1, q - 1));
  };

  const handleQuantityPlus = () => {
    if (isOutOfStock) return;
    setQuantity(q => {
      if (q >= maxAvailableStock) {
        showToast(`Chỉ còn ${maxAvailableStock} sản phẩm có sẵn trong kho!`, 'warning');
        return maxAvailableStock;
      }
      return q + 1;
    });
  };

  // Calculate dynamic price based on variant
  const effectivePrice = useMemo(() => {
    if (!product) return 0;
    const adjustment = selectedVariant ? Number(selectedVariant.price_adjustment || 0) : 0;
    return Math.max(0, product.price + adjustment);
  }, [product, selectedVariant]);

  const handleAddToCart = () => {
    if (!product) return;
    if (isOutOfStock) {
      showToast('Sản phẩm hiện đã hết hàng!', 'error');
      return;
    }
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
              {isOutOfStock ? (
                <span className="badge" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontWeight: 700 }}>
                  ✕ Đã hết hàng
                </span>
              ) : (
                <span className="badge badge-emerald">
                  ✓ Còn {maxAvailableStock} sản phẩm - Sẵn sàng giao
                </span>
              )}
              <span className="badge badge-terra">{product.categoryName}</span>
            </div>

            <h1 className="detail-title">{product.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '0.9rem', color: 'var(--accent-gold)' }}>
              <div style={{ display: 'flex', gap: '3px' }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <i
                    key={i}
                    className={`fa-${i < Math.round(averageRating) ? 'solid' : 'regular'} fa-star`}
                    style={{ color: i < Math.round(averageRating) ? '#f59e0b' : '#cbd5e1' }}
                  ></i>
                ))}
              </div>
              <span style={{ color: 'var(--text-main)', fontWeight: 800 }}>{averageRating}</span>
              <span
                onClick={() => setActiveTab('reviews')}
                style={{ color: 'var(--primary-color)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
              >
                ({reviews.length} đánh giá thực tế)
              </span>
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
                <button type="button" className="qty-btn" onClick={handleQuantityMinus} disabled={isOutOfStock || quantity <= 1}>-</button>
                <input
                  type="number"
                  className="qty-input"
                  value={quantity}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value || '1', 10);
                    if (isNaN(parsed) || parsed < 1) setQuantity(1);
                    else if (parsed > maxAvailableStock) {
                      showToast(`Chỉ còn tối đa ${maxAvailableStock} món trong kho!`, 'warning');
                      setQuantity(maxAvailableStock);
                    } else {
                      setQuantity(parsed);
                    }
                  }}
                  min="1"
                  max={maxAvailableStock}
                  disabled={isOutOfStock}
                />
                <button type="button" className="qty-btn" onClick={handleQuantityPlus} disabled={isOutOfStock || quantity >= maxAvailableStock}>+</button>
              </div>
              <span style={{ fontSize: '0.85rem', color: isOutOfStock ? '#dc2626' : 'var(--text-muted)' }}>
                {isOutOfStock ? '(Hết hàng)' : `(Tối đa: ${maxAvailableStock} món)`}
              </span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: 'var(--space-xl)' }}>
              <button
                type="button"
                className={`btn btn-primary btn-lg ${isOutOfStock ? 'btn-disabled' : ''}`}
                style={{ flex: 1, opacity: isOutOfStock ? 0.6 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <i className="fa-solid fa-cart-shopping"></i> {isOutOfStock ? 'Hết hàng trong kho' : `Thêm vào giỏ (${quantity})`}
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

        {/* Specifications & Reviews Tab Details */}
        <section className="detail-tabs-section" style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)', marginBottom: 'var(--space-2xl)' }}>
          <div className="tab-header-list" style={{ display: 'flex', gap: '16px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('desc')}
              style={{
                border: 'none',
                background: 'none',
                padding: '8px 16px',
                fontSize: '1rem',
                fontWeight: activeTab === 'desc' ? 800 : 600,
                color: activeTab === 'desc' ? 'var(--primary-color)' : 'var(--text-muted)',
                borderBottom: activeTab === 'desc' ? '3px solid var(--primary-color)' : '3px solid transparent',
                cursor: 'pointer',
                marginBottom: '-14px',
                transition: 'all 0.2s',
              }}
            >
              Mô tả sản phẩm
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              style={{
                border: 'none',
                background: 'none',
                padding: '8px 16px',
                fontSize: '1rem',
                fontWeight: activeTab === 'specs' ? 800 : 600,
                color: activeTab === 'specs' ? 'var(--primary-color)' : 'var(--text-muted)',
                borderBottom: activeTab === 'specs' ? '3px solid var(--primary-color)' : '3px solid transparent',
                cursor: 'pointer',
                marginBottom: '-14px',
                transition: 'all 0.2s',
              }}
            >
              Thông số làng nghề
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              style={{
                border: 'none',
                background: 'none',
                padding: '8px 16px',
                fontSize: '1rem',
                fontWeight: activeTab === 'reviews' ? 800 : 600,
                color: activeTab === 'reviews' ? 'var(--primary-color)' : 'var(--text-muted)',
                borderBottom: activeTab === 'reviews' ? '3px solid var(--primary-color)' : '3px solid transparent',
                cursor: 'pointer',
                marginBottom: '-14px',
                transition: 'all 0.2s',
              }}
            >
              Đánh giá từ khách hàng ({reviews.length})
            </button>
          </div>

          {activeTab === 'desc' && (
            <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '12px' }}>
                <strong>Nguồn gốc sản phẩm:</strong> Sản phẩm thuộc dòng đồ trang trí decor cao cấp, làm từ chất liệu tự nhiên như đất sét nung Bát Tràng, mây tre tự nhiên sấy chống mối mọt.
              </p>
              <p>
                <strong>Hướng dẫn bảo quản:</strong> Lau chùi nhẹ nhàng bằng khăn mềm ẩm. Tránh va đập mạnh hoặc dùng hóa chất tẩy rửa nồng độ cao để giữ trọn màu men và độ bóng bền lâu.
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', fontSize: '0.9rem' }}>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Xuất xứ</span>
                <strong style={{ color: 'var(--text-main)' }}>Làng nghề truyền thống Việt Nam</strong>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Chất liệu</span>
                <strong style={{ color: 'var(--text-main)' }}>Gốm sứ tráng men / Mây tre đan tự nhiên</strong>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem' }}>Quy cách đóng gói</span>
                <strong style={{ color: 'var(--text-main)' }}>Hộp carton bọc xốp chống sốc 3 lớp</strong>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              {/* Review summary & Form */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px', marginBottom: '32px' }}>
                {/* Score block */}
                <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{averageRating}</div>
                  <div style={{ color: '#f59e0b', fontSize: '1.2rem', margin: '8px 0', display: 'flex', gap: '4px' }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <i
                        key={i}
                        className={`fa-${i < Math.round(averageRating) ? 'solid' : 'regular'} fa-star`}
                      ></i>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>Dựa trên {reviews.length} đánh giá đã xác thực</span>
                </div>

                {/* Form to submit review */}
                <form onSubmit={handleReviewSubmit} style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px' }}>Viết đánh giá của bạn</h3>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#475569' }}>
                      Chọn số sao hài lòng:
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          style={{
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            fontSize: '1.4rem',
                            color: star <= reviewRating ? '#f59e0b' : '#cbd5e1',
                            padding: '2px',
                            transition: 'transform 0.1s',
                          }}
                        >
                          ★
                        </button>
                      ))}
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, alignSelf: 'center', color: '#f59e0b', marginLeft: '6px' }}>
                        {reviewRating === 5 ? 'Tuyệt vời' : reviewRating === 4 ? 'Hài lòng' : reviewRating === 3 ? 'Bình thường' : 'Chưa ưng ý'}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#475569' }}>
                      Họ và tên của bạn *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Hoàng Long"
                      value={reviewName}
                      onChange={e => setReviewName(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#475569' }}>
                      Nội dung nhận xét & cảm nhận *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Chia sẻ trải nghiệm về chất lượng men, đóng gói hoặc thời gian giao hàng..."
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', resize: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '8px 20px', fontWeight: 700, borderRadius: '8px' }}
                    >
                      {isSubmittingReview ? <><i className="fa-solid fa-spinner fa-spin"></i> Đang gửi...</> : 'Gửi đánh giá'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Review list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reviews.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên để lại nhận xét!</p>
                ) : (
                  reviews.map(rev => (
                    <div key={rev.id} style={{ padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>{rev.user_name}</strong>
                          {rev.is_verified_purchase && (
                            <span style={{ fontSize: '0.72rem', backgroundColor: '#dcfce7', color: '#16a34a', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>
                              ✓ Đã mua hàng
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      <div style={{ color: '#f59e0b', fontSize: '0.8rem', display: 'flex', gap: '2px', marginBottom: '8px' }}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <i
                            key={i}
                            className={`fa-${i < rev.rating ? 'solid' : 'regular'} fa-star`}
                          ></i>
                        ))}
                      </div>

                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                        {rev.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
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
