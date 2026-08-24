'use client';

import React, { useState, useRef } from 'react';
import { useProducts } from '@/context/ProductContext';

interface ProductFormData {
  name: string;
  category: string;
  price: string;
  image: string;
  stockCount: string;
  inStock: boolean;
}

interface ProductFormModalProps {
  isOpen: boolean;
  editingProdId: string | null;
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ProductFormModal({
  isOpen,
  editingProdId,
  formData,
  setFormData,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const { categories } = useProducts();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [isSimulatingUpload, setIsSimulatingUpload] = useState<boolean>(false);

  // Map category slug to folder name representation
  const getCategoryFolder = (categorySlug: string) => {
    switch (categorySlug) {
      case 'noi-that': return 'noi-that-gia-dung';
      case 'den': return 'do-my-nghe';
      case 'decor': case 'trang-tri': return 'do-my-nghe';
      case 'luu-tru': return 'do-thu-cong';
      case 'gom-su': return 'do-my-nghe';
      default: return categorySlug;
    }
  };

  // Handle local image selection from device and physically upload to disk
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSimulatingUpload(true);
      setSelectedFileName(file.name);

      // Create preview object URL immediately for instant UI feedback
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: previewUrl }));

      try {
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('category', formData.category);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData,
        });

        const data = await res.json();
        if (data.success && data.url) {
          setFormData(prev => ({ ...prev, image: data.url }));
        }
      } catch (err) {
        console.error('Error uploading file to server disk:', err);
      } finally {
        setIsSimulatingUpload(false);
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
    <div className={`admin-modal-backdrop ${isOpen ? 'active' : ''}`} id="product-modal">
      <div className="admin-modal-card">
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-box-open" style={{ color: 'var(--primary-color)' }}></i>
            <span>{editingProdId !== null ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</span>
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
            
            {/* Field: Product Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="prod-name">
                Tên sản phẩm <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                id="prod-name"
                className="form-input"
                placeholder="VD: Bình gốm mộc tráng men..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Row 2: Category & Price */}
            <div className="modal-form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="prod-category">
                  Danh mục sản phẩm <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  id="prod-category"
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  {categories && categories.length > 0 ? (
                    categories
                      .filter(c => c.status !== 'hidden')
                      .map(cat => (
                        <option key={cat.id || cat.slug} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))
                  ) : (
                    <>
                      <option value="noi-that">Nội thất gia dụng</option>
                      <option value="den">Đèn & Chiếu sáng</option>
                      <option value="trang-tri">Đồ trang trí Decor</option>
                      <option value="luu-tru">Giỏ & Kệ lưu trữ</option>
                      <option value="gom-su">Gốm sứ thủ công</option>
                      <option value="nha-bep">Đồ dùng Nhà bếp</option>
                    </>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod-price">
                  Đơn giá (VNĐ) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  id="prod-price"
                  className="form-input"
                  placeholder="290000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Image Upload Area with Local Device File Picker */}
            <div className="form-group" style={{ backgroundColor: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 800 }}>
                  <i className="fa-solid fa-image" style={{ color: 'var(--primary-color)', marginRight: '6px' }}></i>
                  Hình ảnh sản phẩm
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
                    id="product-file-input"
                  />
                  
                  {!formData.image ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: '2px dashed var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '24px 16px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: 'var(--bg-surface)',
                        transition: 'var(--transition-fast)'
                      }}
                    >
                      <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '8px' }}></i>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        Nhấp để chọn ảnh từ máy tính
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Hỗ trợ định dạng JPG, PNG, WEBP (Tự động lưu vào <code>assets/images/products/{getCategoryFolder(formData.category)}/</code>)
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: 'var(--bg-surface)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <img
                        src={formData.image}
                        alt="Preview"
                        style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {selectedFileName || 'Ảnh đã chọn'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <i className="fa-solid fa-circle-check"></i>
                          <span>Đã nạp ảnh vào thư mục: <code>assets/images/products/{getCategoryFolder(formData.category)}/</code></span>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    id="prod-image-url"
                    className="form-input"
                    placeholder="/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Ví dụ: <code>/assets/images/products/{getCategoryFolder(formData.category)}/ten-anh.webp</code>
                  </span>
                </div>
              )}
            </div>

            {/* Row 4: Stock Count & Status */}
            <div className="modal-form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="prod-stock-count">Số lượng tồn kho</label>
                <input
                  type="number"
                  id="prod-stock-count"
                  className="form-input"
                  placeholder="0"
                  min="0"
                  value={formData.stockCount}
                  onChange={(e) => {
                    const val = e.target.value;
                    const num = parseInt(val, 10);
                    setFormData({
                      ...formData,
                      stockCount: val,
                      inStock: !isNaN(num) && num > 0,
                    });
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod-stock">Trạng thái kho hàng</label>
                <select
                  id="prod-stock"
                  className="form-input"
                  value={formData.inStock && parseInt(formData.stockCount || '0', 10) > 0 ? 'true' : 'false'}
                  onChange={(e) => {
                    const isTrue = e.target.value === 'true';
                    setFormData({
                      ...formData,
                      inStock: isTrue,
                      stockCount: isTrue ? (parseInt(formData.stockCount, 10) > 0 ? formData.stockCount : '10') : '0',
                    });
                  }}
                >
                  <option value="true">Còn hàng (In Stock)</option>
                  <option value="false">Hết hàng (Out of Stock)</option>
                </select>
              </div>
            </div>

          </div>

          {/* Fixed Modal Footer */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-color)', marginTop: '8px', flexShrink: 0 }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
            >
              Hủy bỏ
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="fa-solid fa-floppy-disk"></i>
              <span>{editingProdId !== null ? 'Lưu cập nhật' : 'Thêm sản phẩm'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
