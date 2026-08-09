'use client';

import React, { useState, useMemo } from 'react';
import { Product } from '@/data/products';
import { CategoryItem } from '../types/categories.types';
import { useProducts } from '@/context/ProductContext';
import CategoryFormModal, { CategoryFormData } from './CategoryFormModal';

interface CategoryManagementProps {
  productsList: Product[];
}

export default function CategoryManagement({ productsList }: CategoryManagementProps) {
  const { categories, addCategory, updateCategory, deleteCategory } = useProducts();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Modal Add / Edit Category State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    image: '',
    description: '',
    status: 'active',
  });

  const handleOpenAddModal = () => {
    setEditingCatId(null);
    setFormData({
      name: '',
      slug: '',
      image: '',
      description: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCatId(cat.id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      description: cat.description,
      status: cat.status,
    });
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (catId: string) => {
    const catToDelete = categories.find(c => c.id === catId);
    if (!catToDelete) return;

    // Check if any product is currently using this category
    const associatedCount = productsList.filter(p => p.category === catToDelete.slug).length;
    if (associatedCount > 0) {
      if (!confirm(`Danh mục "${catToDelete.name}" đang có ${associatedCount} sản phẩm liên kết. Bạn có chắc chắn muốn xóa không?`)) {
        return;
      }
    } else {
      if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${catToDelete.name}"?`)) {
        return;
      }
    }

    deleteCategory(catId);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      alert('Vui lòng điền đầy đủ Tên danh mục và Slug');
      return;
    }

    const defaultImg = formData.image.trim() || '/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp';

    if (editingCatId !== null) {
      updateCategory(editingCatId, {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        image: defaultImg,
        description: formData.description.trim(),
        status: formData.status,
      });
    } else {
      const newCat: CategoryItem = {
        id: `cat-${Date.now()}`,
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        image: defaultImg,
        description: formData.description.trim() || 'Danh mục sản phẩm thủ công cao cấp.',
        status: formData.status,
      };
      addCategory(newCat);

      // Automatically create folder on disk for this new category
      fetch('/api/categories/create-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: formData.slug.trim() }),
      }).catch(err => console.error('Auto create folder error:', err));
    }

    setIsModalOpen(false);
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      if (statusFilter !== 'all' && cat.status !== statusFilter) return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchName = cat.name.toLowerCase().includes(query);
        const matchSlug = cat.slug.toLowerCase().includes(query);
        const matchDesc = cat.description.toLowerCase().includes(query);
        if (!matchName && !matchSlug && !matchDesc) return false;
      }
      return true;
    });
  }, [categories, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCategories, currentPage]);

  return (
    <section className="admin-section-card" style={{ marginTop: '24px' }}>
      {/* Category Section Header */}
      <div className="admin-section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Quản lý Danh mục Sản phẩm
            </h3>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid #bbf7d0'
            }}>
              {categories.length} danh mục
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
            Tạo, phân loại nhóm ngành hàng và quản lý hiển thị các danh mục trên website
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-add-product"
          onClick={handleOpenAddModal}
          style={{ padding: '8px 16px', fontSize: '0.875rem' }}
        >
          <i className="fa-solid fa-folder-plus"></i>
          <span>Thêm danh mục mới</span>
        </button>
      </div>

      {/* Toolbar Search & Filter */}
      <div className="admin-table-toolbar">
        <div className="admin-search-box">
          <i className="fa-solid fa-magnifying-glass admin-search-icon"></i>
          <input
            type="text"
            className="admin-table-search"
            placeholder="Tìm theo tên danh mục, slug, mô tả..."
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="hidden">Tạm ẩn</option>
          </select>
        </div>
      </div>

      {/* Category Table */}
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>DANH MỤC</th>
              <th>MÃ SLUG (URL)</th>
              <th>MÔ TẢ</th>
              <th style={{ textAlign: 'center' }}>SẢN PHẨM LIÊN KẾT</th>
              <th>TRẠNG THÁI</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  Không tìm thấy danh mục nào phù hợp với điều kiện tìm kiếm.
                </td>
              </tr>
            ) : (
              paginatedCategories.map(cat => {
                const associatedCount = productsList.filter(
                  p => p.category === cat.slug || (cat.slug === 'decor' && p.category === 'trang-tri')
                ).length;

                return (
                  <tr key={cat.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={cat.image}
                          alt={cat.name}
                          style={{
                            width: '42px',
                            height: '42px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-subtle)'
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{cat.name}</div>
                          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{cat.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code style={{
                        fontSize: '0.8rem',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--primary-color)',
                        fontWeight: 700
                      }}>
                        {cat.slug}
                      </code>
                    </td>
                    <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)', maxWidth: '260px', lineHeight: 1.4 }}>
                      {cat.description}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        color: associatedCount > 0 ? 'var(--primary-color)' : 'var(--text-muted)',
                        backgroundColor: associatedCount > 0 ? '#f0fdf4' : 'var(--bg-subtle)',
                        border: `1px solid ${associatedCount > 0 ? '#bbf7d0' : 'var(--border-color)'}`,
                        padding: '2px 10px',
                        borderRadius: 'var(--radius-full)'
                      }}>
                        {associatedCount} món
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${cat.status === 'active' ? 'instock' : 'outstock'}`}>
                        {cat.status === 'active' ? 'Hoạt động' : 'Tạm ẩn'}
                      </span>
                    </td>
                    <td>
                      <div className="tbl-actions">
                        <button
                          type="button"
                          className="btn-tbl-action edit"
                          title="Chỉnh sửa danh mục"
                          onClick={() => handleOpenEditModal(cat)}
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          type="button"
                          className="btn-tbl-action delete"
                          title="Xóa danh mục"
                          onClick={() => handleDeleteCategory(cat.id)}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary & Pagination */}
      <div className="admin-table-footer-row">
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Hiển thị {filteredCategories.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–
          {Math.min(currentPage * itemsPerPage, filteredCategories.length)} trong {filteredCategories.length} danh mục
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

      {/* Category Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        editingCatId={editingCatId}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </section>
  );
}
