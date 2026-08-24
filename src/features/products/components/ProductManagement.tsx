'use client';

import React, { useState, useMemo } from 'react';
import { Product, formatCurrency } from '@/data/products';
import { useProducts } from '@/context/ProductContext';
import ProductFormModal from './ProductFormModal';
import CategoryManagement from '@/features/categories/components/CategoryManagement';

export default function ProductManagement() {
  const { products: productsList, addProduct, updateProduct, deleteProduct, categories, getCategoryLabel } = useProducts();

  const [selectedCatPill, setSelectedCatPill] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Modal Add / Edit Product State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'noi-that',
    price: '',
    image: '',
    stockCount: '15',
    inStock: true,
  });

  const handleOpenAddModal = () => {
    setEditingProdId(null);
    setFormData({
      name: '',
      category: categories[0]?.slug || 'noi-that',
      price: '',
      image: '',
      stockCount: '15',
      inStock: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProdId(prod.id.toString());
    const stockVal = prod.stockCount !== undefined ? prod.stockCount : 0;
    setFormData({
      name: prod.name,
      category: prod.category,
      price: prod.price.toString(),
      image: prod.image,
      stockCount: stockVal.toString(),
      inStock: prod.inStock !== false && stockVal > 0,
    });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (id: string | number, name?: string) => {
    const displayName = name ? ` "${name}"` : '';
    if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm${displayName} khỏi cơ sở dữ liệu Supabase?\nThao tác này sẽ xóa sản phẩm vĩnh viễn.`)) {
      deleteProduct(id);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    const priceNum = parseInt(formData.price, 10) || 0;
    const defaultImg = formData.image.trim() || '/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp';
    const parsedStock = Math.max(0, parseInt(formData.stockCount, 10) || 0);
    const finalInStock = formData.inStock && parsedStock > 0;

    if (editingProdId !== null) {
      updateProduct(editingProdId, {
        name: formData.name,
        category: formData.category,
        categoryName: getCategoryLabel(formData.category),
        price: priceNum,
        image: defaultImg,
        inStock: finalInStock,
        stockCount: parsedStock,
      });
    } else {
      const newId = `p${Date.now()}`;
      const newProd: Product = {
        id: newId,
        name: formData.name,
        category: formData.category,
        categoryName: getCategoryLabel(formData.category),
        price: priceNum,
        image: defaultImg,
        inStock: finalInStock,
        stockCount: parsedStock,
        featured: true,
        description: 'Sản phẩm mới vừa được tạo từ trang Quản trị Admin.',
        sku: `SKU-NEW-${Math.floor(10 + Math.random() * 90)}`,
        soldCount: 0,
      };
      addProduct(newProd);
    }

    setIsModalOpen(false);
  };

  // Filtered products calculation
  const filteredProducts = useMemo(() => {
    return productsList.filter(prod => {
      if (selectedCatPill !== 'all') {
        if (selectedCatPill === 'decor' && prod.category !== 'decor' && prod.category !== 'trang-tri') return false;
        if (selectedCatPill !== 'decor' && prod.category !== selectedCatPill) return false;
      }
      if (catFilter !== 'all') {
        if (catFilter === 'decor' && prod.category !== 'decor' && prod.category !== 'trang-tri') return false;
        if (catFilter !== 'decor' && prod.category !== catFilter) return false;
      }
      if (statusFilter === 'in_stock' && prod.inStock === false) return false;
      if (statusFilter === 'out_of_stock' && prod.inStock !== false) return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchName = prod.name.toLowerCase().includes(query);
        const matchSku = (prod.sku || `MS-${prod.id}`).toLowerCase().includes(query);
        if (!matchName && !matchSku) return false;
      }
      return true;
    });
  }, [productsList, selectedCatPill, catFilter, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const activeCategories = categories.filter(c => c.status === 'active');

  return (
    <div className="admin-tab-page" id="tab-products">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>Quản lý sản phẩm</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Quản lý danh sách sản phẩm, giá bán, tồn kho và cập nhật kho hàng</p>
        </div>

        <div className="product-cat-pills" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`cat-pill-btn ${selectedCatPill === 'all' ? 'active' : ''}`}
            onClick={() => { setSelectedCatPill('all'); setCurrentPage(1); }}
          >
            Tất cả ({productsList.length})
          </button>
          {activeCategories.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`cat-pill-btn ${selectedCatPill === cat.slug ? 'active' : ''}`}
              onClick={() => { setSelectedCatPill(cat.slug); setCurrentPage(1); }}
            >
              {cat.name} ({productsList.filter(p => p.category === cat.slug || (cat.slug === 'decor' && p.category === 'trang-tri')).length})
            </button>
          ))}
        </div>
      </div>

      <section className="admin-section-card">
        <div className="admin-section-header">
          <h3 className="admin-section-title">Danh sách sản phẩm kinh doanh</h3>
          <button type="button" className="btn-add-product" onClick={handleOpenAddModal}>
            <i className="fa-solid fa-plus"></i>
            <span>+ Thêm sản phẩm mới</span>
          </button>
        </div>

        {/* Table Toolbar */}
        <div className="admin-table-toolbar">
          <div className="admin-search-box">
            <i className="fa-solid fa-magnifying-glass admin-search-icon"></i>
            <input
              type="text"
              className="admin-table-search"
              placeholder="Tìm tên hoặc mã SKU sản phẩm..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="admin-filter-controls">
            <select
              className="admin-select-filter"
              value={catFilter}
              onChange={(e) => {
                setCatFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tất cả danh mục</option>
              {activeCategories.map(cat => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>

            <select
              className="admin-select-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="in_stock">Còn hàng (In Stock)</option>
              <option value="out_of_stock">Hết hàng (Out of Stock)</option>
            </select>
          </div>
        </div>

        {/* Product Table */}
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>SẢN PHẨM</th>
                <th>MÃ SKU</th>
                <th>DANH MỤC</th>
                <th>GIÁ BÁN</th>
                <th>TỒN KHO</th>
                <th>TRẠNG THÁI</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map(prod => (
                  <tr key={prod.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={prod.image}
                          alt={prod.name}
                          style={{
                            width: '42px',
                            height: '42px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)'
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{prod.name}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {prod.id}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                      {prod.sku || `MS-PROD-${prod.id}`}
                    </td>
                    <td>{getCategoryLabel(prod.category)}</td>
                    <td style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                      {formatCurrency(prod.price)}
                    </td>
                    <td style={{ fontWeight: 800, color: (prod.stockCount ?? 0) > 0 && prod.inStock !== false ? 'var(--primary-color)' : '#ef4444' }}>
                      {prod.inStock === false || (prod.stockCount ?? 0) <= 0 ? 0 : (prod.stockCount ?? 0)}
                    </td>
                    <td>
                      <span className={`status-pill ${(prod.stockCount ?? 0) > 0 && prod.inStock !== false ? 'instock' : 'outstock'}`}>
                        {(prod.stockCount ?? 0) > 0 && prod.inStock !== false ? 'Còn hàng' : 'Hết hàng'}
                      </span>
                    </td>
                    <td>
                      <div className="tbl-actions">
                        <button
                          type="button"
                          className="btn-tbl-action edit"
                          title="Chỉnh sửa sản phẩm"
                          onClick={() => handleOpenEditModal(prod)}
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          type="button"
                          className="btn-tbl-action delete"
                          title="Xóa sản phẩm"
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary & Pagination */}
        <div className="admin-table-footer-row">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Hiển thị {filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–
            {Math.min(currentPage * itemsPerPage, filteredProducts.length)} trong {filteredProducts.length} sản phẩm
          </span>

          <div className="pagination-wrapper" style={{ marginTop: 0 }}>
            <ul className="pagination-list">
              <li>
                <button
                  type="button"
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  « Trước
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <li key={page}>
                  <button
                    type="button"
                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
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
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Sau »
                </button>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CATEGORY MANAGEMENT PANEL (BELOW PRODUCT LIST) */}
      <CategoryManagement productsList={productsList} />

      {/* Product Add/Edit Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        editingProdId={editingProdId}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
