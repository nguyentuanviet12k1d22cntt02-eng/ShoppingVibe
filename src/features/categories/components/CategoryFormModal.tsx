'use client';

import React, { useState, useRef } from 'react';

export interface CategoryFormData {
  name: string;
  slug: string;
  image: string;
  description: string;
  status: 'active' | 'hidden';
}

interface CategoryFormModalProps {
  isOpen: boolean;
  editingCatId: string | null;
  formData: CategoryFormData;
  setFormData: React.Dispatch<React.SetStateAction<CategoryFormData>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CategoryFormModal({
  isOpen,
  editingCatId,
  formData,
  setFormData,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  // Auto-generate slug from name if adding new category
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!editingCatId) {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setFormData(prev => ({ ...prev, name, slug }));
    } else {
      setFormData(prev => ({ ...prev, name }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: previewUrl }));

      try {
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('category', formData.slug || 'decor');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          setFormData(prev => ({ ...prev, image: data.url }));
        }
      } catch (err) {
        console.error('Category image upload error:', err);
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    setSelectedFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`admin-modal-backdrop ${isOpen ? 'active' : ''}`} id="category-modal">
      <div className="admin-modal-card">
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-folder-tree" style={{ color: 'var(--primary-color)' }}></i>
            <span>{editingCatId !== null ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</span>
          </h3>
          <button
            type="button"
            className="btn-close-modal"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="admin-modal-body custom-slim-scrollbar">
            
            <div className="form-group">
              <label className="form-label" htmlFor="cat-name">
                Tên danh mục <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                id="cat-name"
                className="form-input"
                required
                placeholder="VD: Gốm sứ thủ công..."
                value={formData.name}
                onChange={handleNameChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cat-slug">
                Đường dẫn tĩnh (Slug) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                id="cat-slug"
                className="form-input"
                required
                placeholder="VD: gom-su"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
              
              {/* Category Folder path badge */}
              <div style={{
                fontSize: '0.775rem',
                color: '#0f766e',
                backgroundColor: '#f0fdfa',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #ccfbf1',
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <i className="fa-solid fa-folder-plus"></i>
                <span>Thư mục tài nguyên sẽ tạo: <code>assets/images/products/{formData.slug || 'slug'}/</code></span>
              </div>
            </div>

            {/* Category Image Upload Area */}
            <div className="form-group" style={{ backgroundColor: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 800 }}>
                  <i className="fa-solid fa-image" style={{ color: 'var(--primary-color)', marginRight: '6px' }}></i>
                  Ảnh đại diện danh mục
                </label>
                
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className={`cat-pill-btn ${uploadMode === 'file' ? 'active' : ''}`}
                    onClick={() => setUploadMode('file')}
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    <i className="fa-solid fa-upload"></i> Chọn từ máy
                  </button>
                  <button
                    type="button"
                    className={`cat-pill-btn ${uploadMode === 'url' ? 'active' : ''}`}
                    onClick={() => setUploadMode('url')}
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    <i className="fa-solid fa-link"></i> Nhập link URL
                  </button>
                </div>
              </div>

              {uploadMode === 'file' ? (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="cat-file-input"
                  />
                  
                  {!formData.image ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: '2px dashed var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '20px 16px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: 'var(--bg-surface)',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '1.8rem', color: 'var(--primary-color)', marginBottom: '6px' }}></i>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                        Nhấp để chọn ảnh bìa danh mục từ máy
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <img
                        src={formData.image}
                        alt="Category Preview"
                        style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {selectedFileName || 'Ảnh danh mục đã chọn'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>
                          ✓ Đã sẵn sàng làm ảnh đại diện
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => fileInputRef.current?.click()}
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          title="Đổi ảnh khác"
                        >
                          <i className="fa-solid fa-rotate"></i>
                        </button>
                        <button
                          type="button"
                          className="btn-tbl-action delete"
                          onClick={handleRemoveImage}
                          title="Xóa ảnh"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <input
                    type="text"
                    id="cat-image"
                    className="form-input"
                    placeholder="/assets/images/products/... (để trống sẽ dùng ảnh mặc định)"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cat-desc">Mô tả ngắn danh mục</label>
              <textarea
                id="cat-desc"
                rows={2}
                className="form-input"
                placeholder="Mô tả tóm tắt nét đặc trưng của danh mục này..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ resize: 'none' }}
              />
            </div>

            <div className="form-status-row">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>Trạng thái danh mục</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cho phép hiển thị và lọc sản phẩm trên website</div>
              </div>
              <select
                className="form-input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'hidden' })}
                style={{ width: 'auto', minWidth: '130px', padding: '8px 12px', fontWeight: 700 }}
              >
                <option value="active">Hoạt động</option>
                <option value="hidden">Tạm ẩn</option>
              </select>
            </div>

          </div>

          {/* Fixed Footer */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-color)', marginTop: '8px', flexShrink: 0 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              <i className="fa-solid fa-floppy-disk"></i>
              <span>{editingCatId !== null ? 'Cập nhật' : 'Thêm mới'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
