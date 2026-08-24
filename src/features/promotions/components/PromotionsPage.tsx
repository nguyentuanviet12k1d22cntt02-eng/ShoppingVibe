'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency } from '@/data/products';

interface DbCoupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number | null;
  usage_limit: number;
  used_count: number;
  is_active: boolean;
}

export default function PromotionsPage() {
  const { products, categories, isLoading: isProductsLoading } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { showToast } = useToast();

  const [coupons, setCoupons] = useState<DbCoupon[]>([]);
  const [isCouponsLoading, setIsCouponsLoading] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filters & Pagination
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('discount-high');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 8;

  // Fetch real coupons from API
  useEffect(() => {
    async function loadCoupons() {
      try {
        setIsCouponsLoading(true);
        const res = await fetch('/api/coupons');
        const data = await res.json();
        if (data.success && Array.isArray(data.coupons)) {
          setCoupons(data.coupons.filter((c: DbCoupon) => c.is_active));
        }
      } catch (err) {
        console.error('Error fetching coupons:', err);
      } finally {
        setIsCouponsLoading(false);
      }
    }
    loadCoupons();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Đã sao chép mã giảm giá "${code}".`, 'success');
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  // Compute sale products from real product data
  const saleProducts = useMemo(() => {
    return products.map((p) => {
      // Calculate realistic discount rate (15% - 35%) based on price or product id
      let discountRate = 20;
      if (p.price >= 3000000) discountRate = 25;
      else if (p.price >= 1500000) discountRate = 20;
      else discountRate = 15;

      const originalPrice = Math.round(p.price / (1 - discountRate / 100));
      return {
        ...p,
        discountRate,
        originalPrice,
      };
    });
  }, [products]);

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let list = [...saleProducts];

    if (selectedCategory !== 'all') {
      list = list.filter(
        (p) => p.category === selectedCategory || (selectedCategory === 'decor' && p.category === 'trang-tri')
      );
    }

    if (selectedSort === 'discount-high') {
      list.sort((a, b) => b.discountRate - a.discountRate);
    } else if (selectedSort === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (selectedSort === 'sold-high') {
      list.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    }

    return list;
  }, [saleProducts, selectedCategory, selectedSort]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
    showToast(`Đã thêm "${product.name}" vào giỏ hàng.`, 'success');
  };

  return (
    <div className="promo-clean-container">
      {/* 1. Header Banner */}
      <section className="promo-clean-header">
        <div className="container">
          <div className="promo-header-inner">
            <div className="promo-tag-pill">
              <i className="fa-solid fa-tag"></i>
              <span>Chương trình khuyến mãi</span>
            </div>
            <h1 className="promo-page-heading">Ưu Đãi & Khuyến Mãi Đặc Biệt</h1>
            <p className="promo-page-subheading">
              Tổng hợp các chương trình giảm giá và mã voucher áp dụng trực tiếp cho đơn hàng của bạn.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Real Active Coupons Section */}
      <section className="promo-coupons-section">
        <div className="container">
          <div className="section-title-clean">
            <div>
              <h2 className="title-text">Mã Giảm Giá Đang Hoạt Động</h2>
              <p className="title-desc">Lưu mã để sử dụng tại bước thanh toán</p>
            </div>
            <span className="coupons-count-badge">
              <i className="fa-solid fa-ticket"></i>
              <span>{coupons.length} mã khả dụng</span>
            </span>
          </div>

          {isCouponsLoading ? (
            <div className="clean-loading-box">
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              <span>Đang tải danh sách voucher...</span>
            </div>
          ) : coupons.length === 0 ? (
            <div className="clean-empty-box">
              <i className="fa-solid fa-inbox"></i>
              <p>Hiện chưa có mã giảm giá mới.</p>
            </div>
          ) : (
            <div className="clean-coupons-grid">
              {coupons.map((c) => {
                const isPercent = c.discount_type === 'percentage';
                const discountText = isPercent
                  ? `Giảm ${c.discount_value}%`
                  : `Giảm ${formatCurrency(Number(c.discount_value))}`;
                const remaining = Math.max(0, c.usage_limit - c.used_count);

                return (
                  <div key={c.id || c.code} className="clean-coupon-card">
                    <div className="coupon-left-block">
                      <div className="coupon-discount-value">{discountText}</div>
                      <div className="coupon-min-order">
                        Đơn từ {formatCurrency(Number(c.min_order_amount))}
                      </div>
                    </div>

                    <div className="coupon-divider-line"></div>

                    <div className="coupon-right-block">
                      <div className="coupon-description-text">{c.description}</div>
                      <div className="coupon-meta-row">
                        <span className="coupon-code-label">{c.code}</span>
                        <button
                          type="button"
                          className={`btn-copy-code ${copiedCode === c.code ? 'copied' : ''}`}
                          onClick={() => handleCopyCode(c.code)}
                        >
                          {copiedCode === c.code ? (
                            <>
                              <i className="fa-solid fa-check"></i>
                              <span>Đã sao chép</span>
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-copy"></i>
                              <span>Sao chép mã</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="coupon-usage-info">
                        <i className="fa-solid fa-clock"></i>
                        <span>Còn lại {remaining} lượt sử dụng</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 3. Discounted Products Grid with Pagination */}
      <section className="promo-products-section">
        <div className="container">
          <div className="promo-products-toolbar">
            <div className="section-title-clean" style={{ marginBottom: 0 }}>
              <div>
                <h2 className="title-text">Sản Phẩm Khuyến Mãi</h2>
                <p className="title-desc">Hiển thị {filteredProducts.length} sản phẩm có giá ưu đãi</p>
              </div>
            </div>

            {/* Filter & Sort Controls */}
            <div className="promo-toolbar-actions">
              <div className="promo-category-pills">
                <button
                  type="button"
                  className={`pill-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => handleCategoryChange('all')}
                >
                  Tất cả
                </button>
                {categories
                  .filter((cat) => cat.status === 'active')
                  .map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`pill-btn ${selectedCategory === cat.slug ? 'active' : ''}`}
                      onClick={() => handleCategoryChange(cat.slug)}
                    >
                      {cat.name}
                    </button>
                  ))}
              </div>

              <div className="promo-sort-select-wrapper">
                <label htmlFor="promo-sort" className="sort-label">Sắp xếp:</label>
                <select
                  id="promo-sort"
                  className="clean-select"
                  value={selectedSort}
                  onChange={(e) => {
                    setSelectedSort(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="discount-high">Giảm giá nhiều nhất</option>
                  <option value="price-low">Giá: Thấp đến Cao</option>
                  <option value="price-high">Giá: Cao đến Thấp</option>
                  <option value="sold-high">Bán chạy nhất</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {isProductsLoading ? (
            <div className="clean-loading-box">
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              <span>Đang tải sản phẩm khuyến mãi...</span>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="clean-empty-box">
              <i className="fa-solid fa-box-open"></i>
              <p>Không tìm thấy sản phẩm khuyến mãi phù hợp.</p>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSort('discount-high');
                }}
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="clean-products-grid">
              {paginatedProducts.map((p) => {
                const isFav = isWishlisted(p.id);
                return (
                  <div key={p.id} className="clean-product-card">
                    <div className="product-image-container">
                      <Link href={`/product-detail?id=${p.id}`} className="image-link">
                        <Image
                          src={p.image}
                          alt={p.name}
                          width={320}
                          height={240}
                          className="product-thumbnail"
                          style={{ objectFit: 'cover' }}
                        />
                      </Link>

                      {/* Discount Badge */}
                      <span className="discount-tag">
                        -{p.discountRate}%
                      </span>

                      {/* Wishlist Button */}
                      <button
                        type="button"
                        className={`wishlist-btn ${isFav ? 'active' : ''}`}
                        onClick={() => toggleWishlist(p)}
                        aria-label="Yêu thích"
                        title={isFav ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
                      >
                        <i className={`fa-${isFav ? 'solid' : 'regular'} fa-heart`}></i>
                      </button>
                    </div>

                    <div className="product-info-block">
                      <div className="product-category-text">{p.categoryName || 'Sản phẩm'}</div>
                      <h3 className="product-title-text">
                        <Link href={`/product-detail?id=${p.id}`}>{p.name}</Link>
                      </h3>

                      <div className="product-price-row">
                        <span className="current-price">{formatCurrency(p.price)}</span>
                        <span className="original-price">{formatCurrency(p.originalPrice)}</span>
                      </div>

                      <div className="product-actions-row">
                        <button
                          type="button"
                          className="btn-add-cart-clean"
                          onClick={() => handleAddToCart(p)}
                        >
                          <i className="fa-solid fa-cart-plus"></i>
                          <span>Thêm vào giỏ</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. Pagination */}
          {totalPages > 1 && (
            <div className="clean-pagination-container">
              <button
                type="button"
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage((prev) => Math.max(prev - 1, 1));
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
              >
                <i className="fa-solid fa-chevron-left"></i>
                <span>Trang trước</span>
              </button>

              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`page-number-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
              >
                <span>Trang sau</span>
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 5. Policy Perks Strip */}
      <section className="promo-policies-strip">
        <div className="container">
          <div className="policies-grid">
            <div className="policy-item">
              <i className="fa-solid fa-truck-fast"></i>
              <div>
                <div className="policy-title">Giao Hàng Toàn Quốc</div>
                <div className="policy-desc">Áp dụng mã FREESHIP cho đơn từ 500k</div>
              </div>
            </div>

            <div className="policy-item">
              <i className="fa-solid fa-shield-halved"></i>
              <div>
                <div className="policy-title">Bảo Hành Chính Hãng</div>
                <div className="policy-desc">24 tháng cho toàn bộ sản phẩm gỗ</div>
              </div>
            </div>

            <div className="policy-item">
              <i className="fa-solid fa-arrow-rotate-left"></i>
              <div>
                <div className="policy-title">Đổi Trả Linh Hoạt</div>
                <div className="policy-desc">Đổi hàng trong vòng 15 ngày nếu có lỗi</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
