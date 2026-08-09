'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useProducts } from '@/context/ProductContext';
import ProductCard from './ProductCard';

export default function ProductList() {
  const searchParams = useSearchParams();
  const { products, categories: globalCategories } = useProducts();

  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [selectedPrice, setSelectedPrice] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('default');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync state with URL Search Params dynamically
  useEffect(() => {
    const s = searchParams.get('search') || '';
    const c = searchParams.get('category') || searchParams.get('cat') || 'all';
    setIsLoading(true);
    setSearchQuery(s);
    setSelectedCat(c);
    setCurrentPage(1);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleCategoryChange = (catId: string) => {
    setIsLoading(true);
    setSelectedCat(catId);
    setCurrentPage(1);
    setTimeout(() => setIsLoading(false), 200);
  };

  const handlePriceChange = (priceVal: string) => {
    setIsLoading(true);
    setSelectedPrice(priceVal);
    setCurrentPage(1);
    setTimeout(() => setIsLoading(false), 200);
  };

  const handleSortChange = (sortVal: string) => {
    setIsLoading(true);
    setSortOption(sortVal);
    setTimeout(() => setIsLoading(false), 150);
  };

  const ITEMS_PER_PAGE = 6;

  const dynamicCategories = useMemo(() => {
    const activeCats = globalCategories.filter(c => c.status === 'active');
    return [
      { id: 'all', name: 'Tất cả sản phẩm', icon: 'fa-solid fa-border-all', count: products.length },
      ...activeCats.map(cat => {
        const count = products.filter(
          p => p.category === cat.slug || (cat.slug === 'decor' && p.category === 'trang-tri')
        ).length;
        let icon = 'fa-solid fa-folder';
        if (cat.slug === 'noi-that') icon = 'fa-solid fa-couch';
        else if (cat.slug === 'den') icon = 'fa-solid fa-lightbulb';
        else if (cat.slug === 'decor' || cat.slug === 'trang-tri') icon = 'fa-solid fa-icons';
        else if (cat.slug === 'luu-tru') icon = 'fa-solid fa-box-archive';
        else if (cat.slug === 'gom-su') icon = 'fa-solid fa-jar';

        return {
          id: cat.slug,
          name: cat.name,
          icon,
          count,
        };
      }),
    ];
  }, [globalCategories, products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCat !== 'all') {
      result = result.filter(
        p => p.category === selectedCat || (selectedCat === 'decor' && p.category === 'trang-tri')
      );
    }

    if (selectedPrice === 'under-500') {
      result = result.filter(p => p.price < 500000);
    } else if (selectedPrice === '500-1000') {
      result = result.filter(p => p.price >= 500000 && p.price <= 1000000);
    } else if (selectedPrice === '1000-2000') {
      result = result.filter(p => p.price >= 1000000 && p.price <= 2000000);
    } else if (selectedPrice === 'over-2000') {
      result = result.filter(p => p.price > 2000000);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }

    if (sortOption === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, selectedCat, selectedPrice, searchQuery, sortOption]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleResetFilters = () => {
    setIsLoading(true);
    setSelectedCat('all');
    setSelectedPrice('all');
    setSearchQuery('');
    setSortOption('default');
    setCurrentPage(1);
    setTimeout(() => setIsLoading(false), 200);
  };

  return (
    <main className="main-content" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Danh mục sản phẩm</span>
        </nav>

        {/* Hero Title Area */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <span className="eyebrow">Bộ sưu tập tuyển chọn</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            Đồ Thủ Công & Nội Thất Decor
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
            Khám phá hơn {products.length}+ sản phẩm mộc mạc mang đậm hồn quê Việt kết hợp phong cách tối giản Bắc Âu hiện đại.
          </p>
        </div>

        {/* 2-Column Main Layout: Sidebar Left + Products Right */}
        <div className="product-list-layout">
          {/* LEFT SIDEBAR: FILTERS */}
          <aside className="sidebar-filters">
            {/* Filter Card 1: Categories */}
            <div className="filter-card">
              <h3 className="filter-title">
                <span>Danh mục ngành hàng</span>
                <i className="fa-solid fa-list-ul filter-title-icon"></i>
              </h3>
              <ul className="filter-list">
                {dynamicCategories.map(cat => (
                  <li
                    key={cat.id}
                    className={`filter-item ${selectedCat === cat.id ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    <div className="filter-item-left">
                      <i className={`${cat.icon} filter-icon`}></i>
                      <span>{cat.name}</span>
                    </div>
                    <span className="filter-count">({cat.count})</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Filter Card 2: Price Range Radio */}
            <div className="filter-card">
              <h3 className="filter-title">
                <span>Khoảng giá (VNĐ)</span>
                <i className="fa-solid fa-tag filter-title-icon"></i>
              </h3>
              <div className="price-radio-group">
                {[
                  { id: 'all', label: 'Tất cả mức giá' },
                  { id: 'under-500', label: 'Dưới 500.000đ' },
                  { id: '500-1000', label: '500.000đ - 1.000.000đ' },
                  { id: '1000-2000', label: '1.000.000đ - 2.000.000đ' },
                  { id: 'over-2000', label: 'Trên 2.000.000đ' },
                ].map(price => (
                  <label
                    key={price.id}
                    className={`price-radio-label ${selectedPrice === price.id ? 'active' : ''}`}
                    onClick={() => handlePriceChange(price.id)}
                  >
                    <input
                      type="radio"
                      name="price_filter"
                      value={price.id}
                      checked={selectedPrice === price.id}
                      onChange={() => handlePriceChange(price.id)}
                    />
                    <span>{price.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reset Filter Button */}
            <button
              type="button"
              className="btn-reset-filters"
              onClick={handleResetFilters}
            >
              <i className="fa-solid fa-rotate-left"></i> Xóa tất cả bộ lọc
            </button>
          </aside>

          {/* RIGHT CONTENT: TOOLBAR & PRODUCT GRID */}
          <section className="products-main-content">
            {/* Toolbar */}
            <div className="sort-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="result-count">Hiển thị <strong>{filteredProducts.length}</strong> sản phẩm</span>
                {selectedCat !== 'all' && (
                  <span className="active-filter-badge">
                    Danh mục: {dynamicCategories.find(c => c.id === selectedCat)?.name}
                    <button type="button" onClick={() => handleCategoryChange('all')}>✕</button>
                  </span>
                )}
                {selectedPrice !== 'all' && (
                  <span className="active-filter-badge">
                    Lọc giá
                    <button type="button" onClick={() => handlePriceChange('all')}>✕</button>
                  </span>
                )}
              </div>

              {/* Sorting options */}
              <div className="sort-controls">
                <label htmlFor="sort-select" className="sort-label">Sắp xếp:</label>
                <select
                  id="sort-select"
                  className="sort-select"
                  value={sortOption}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="default">Mặc định nổi bật</option>
                  <option value="price-low">Giá: Thấp đến Cao</option>
                  <option value="price-high">Giá: Cao đến Thấp</option>
                  <option value="name">Tên sản phẩm: A-Z</option>
                </select>
              </div>
            </div>

            {/* Products Grid Loading / Empty / Data States */}
            {isLoading ? (
              <div className="products-loading-state" style={{ minHeight: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-products-state" style={{ minHeight: '350px', textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <i className="fa-solid fa-box-open" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '16px' }}></i>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Không tìm thấy sản phẩm nào</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Hãy thử thay đổi điều kiện tìm kiếm hoặc khoảng giá.</p>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleResetFilters}>
                  Xem tất cả sản phẩm
                </button>
              </div>
            ) : (
              <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                {paginatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-wrapper">
                <ul className="pagination-list">
                  <li>
                    <button
                      type="button"
                      className="page-btn"
                      disabled={currentPage === 1}
                      onClick={() => {
                        const newP = Math.max(currentPage - 1, 1);
                        setCurrentPage(newP);
                        window.scrollTo({ top: 120, behavior: 'smooth' });
                      }}
                    >
                      « Trước
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <li key={page}>
                      <button
                        type="button"
                        className={`page-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => {
                          setCurrentPage(page);
                          window.scrollTo({ top: 120, behavior: 'smooth' });
                        }}
                      >
                        {page}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      className="page-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        const newP = Math.min(currentPage + 1, totalPages);
                        setCurrentPage(newP);
                        window.scrollTo({ top: 120, behavior: 'smooth' });
                      }}
                    >
                      Sau »
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
