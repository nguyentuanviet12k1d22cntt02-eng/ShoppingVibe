'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '@/data/products';
import { CategoryItem } from '@/features/categories/types/categories.types';
import { createClient } from '@/utils/supabase/client';

import { useToast } from '@/context/ToastContext';

interface ProductContextType {
  products: Product[];
  categories: CategoryItem[];
  isLoading: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string | number, updatedProduct: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string | number) => Promise<void>;
  addCategory: (category: CategoryItem) => Promise<void>;
  updateCategory: (id: string, updatedCategory: Partial<CategoryItem>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryLabel: (slug: string) => string;
  refreshData: () => Promise<void>;
  isMounted: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const PRODUCTS_STORAGE_KEY = 'minishop_products_data';
const CATEGORIES_STORAGE_KEY = 'minishop_categories_data';

// Helper to map DB row to Product interface
function mapSupabaseProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    category: row.category || 'decor',
    categoryName: row.category_name || '',
    image: row.image || '/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp',
    description: row.description || '',
    featured: Boolean(row.featured),
    stockCount: row.stock_count ?? 0,
    inStock: Boolean(row.in_stock),
    soldCount: row.sold_count ?? 0,
    sku: row.sku || '',
  };
}

// Helper to map DB row to CategoryItem interface
function mapSupabaseCategory(row: any): CategoryItem {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    image: row.image || '',
    description: row.description || '',
    status: (row.status === 'hidden' ? 'hidden' : 'active') as 'active' | 'hidden',
  };
}

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const { showToast } = useToast();

  const supabase = createClient();

  // Fetch fresh data from Supabase
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);

      // 1. Fetch categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (catError) {
        console.error('Error fetching categories from Supabase:', catError);
      } else if (catData) {
        const mappedCats = catData.map(mapSupabaseCategory);
        setCategories(mappedCats);
        if (typeof window !== 'undefined') {
          localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(mappedCats));
        }
      }

      // 2. Fetch products
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });

      if (prodError) {
        console.error('Error fetching products from Supabase:', prodError);
      } else if (prodData) {
        const mappedProds = prodData.map(mapSupabaseProduct);
        setProducts(mappedProds);
        if (typeof window !== 'undefined') {
          localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(mappedProds));
        }
      }
    } catch (err) {
      console.error('Failed to load data from Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  // Initial load
  useEffect(() => {
    setIsMounted(true);

    // First, load from localStorage if available for immediate render
    try {
      const savedProds = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (savedProds) {
        setProducts(JSON.parse(savedProds));
      }
      const savedCats = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (savedCats) {
        setCategories(JSON.parse(savedCats));
      }
    } catch (e) {
      console.error('Error reading localStorage cache:', e);
    }

    // Then fetch the source of truth directly from Supabase
    refreshData();
  }, [refreshData]);

  const addProduct = async (newProd: Product) => {
    const prevProducts = products;
    setProducts(prev => [newProd, ...prev]);
    try {
      const { error } = await supabase.from('products').insert({
        id: newProd.id,
        name: newProd.name,
        price: newProd.price,
        category: newProd.category,
        category_name: newProd.categoryName,
        image: newProd.image,
        description: newProd.description,
        featured: newProd.featured,
        stock_count: newProd.stockCount ?? 0,
        in_stock: newProd.inStock ?? true,
        sold_count: newProd.soldCount ?? 0,
        sku: newProd.sku || '',
      });

      if (error) throw error;
      showToast(`Đã thêm sản phẩm "${newProd.name}" thành công!`, 'success');
    } catch (e: any) {
      console.error('Error adding product to Supabase:', e);
      setProducts(prevProducts);
      showToast(`Không thể thêm sản phẩm: ${e.message || 'Lỗi mạng'}`, 'error');
    }
  };

  const updateProduct = async (id: string | number, updated: Partial<Product>) => {
    const prevProducts = products;
    setProducts(prev =>
      prev.map(p => (p.id.toString() === id.toString() ? { ...p, ...updated } : p))
    );
    try {
      const payload: Record<string, any> = {};
      if (updated.name !== undefined) payload.name = updated.name;
      if (updated.price !== undefined) payload.price = updated.price;
      if (updated.category !== undefined) payload.category = updated.category;
      if (updated.categoryName !== undefined) payload.category_name = updated.categoryName;
      if (updated.image !== undefined) payload.image = updated.image;
      if (updated.description !== undefined) payload.description = updated.description;
      if (updated.featured !== undefined) payload.featured = updated.featured;
      if (updated.stockCount !== undefined) payload.stock_count = updated.stockCount;
      if (updated.inStock !== undefined) payload.in_stock = updated.inStock;
      if (updated.soldCount !== undefined) payload.sold_count = updated.soldCount;
      if (updated.sku !== undefined) payload.sku = updated.sku;

      const { error } = await supabase.from('products').update(payload).eq('id', id.toString());
      if (error) throw error;
      showToast('Cập nhật sản phẩm thành công!', 'success');
    } catch (e: any) {
      console.error('Error updating product in Supabase:', e);
      setProducts(prevProducts);
      showToast(`Không thể cập nhật sản phẩm: ${e.message || 'Lỗi mạng'}`, 'error');
    }
  };

  const deleteProduct = async (id: string | number) => {
    const prevProducts = products;
    setProducts(prev => prev.filter(p => p.id.toString() !== id.toString()));
    try {
      const { error } = await supabase.from('products').delete().eq('id', id.toString());
      if (error) throw error;
      showToast('Đã xóa sản phẩm thành công!', 'info');
    } catch (e: any) {
      console.error('Error deleting product from Supabase:', e);
      setProducts(prevProducts);
      showToast(`Không thể xóa sản phẩm: ${e.message || 'Lỗi mạng'}`, 'error');
    }
  };

  const addCategory = async (newCat: CategoryItem) => {
    const prevCats = categories;
    setCategories(prev => [newCat, ...prev]);
    try {
      const { error } = await supabase.from('categories').insert({
        id: newCat.id,
        name: newCat.name,
        slug: newCat.slug,
        image: newCat.image,
        description: newCat.description,
        status: newCat.status,
      });
      if (error) throw error;
      showToast(`Đã thêm danh mục "${newCat.name}" thành công!`, 'success');
    } catch (e: any) {
      console.error('Error adding category to Supabase:', e);
      setCategories(prevCats);
      showToast(`Không thể thêm danh mục: ${e.message || 'Lỗi mạng'}`, 'error');
    }
  };

  const updateCategory = async (id: string, updated: Partial<CategoryItem>) => {
    const prevCats = categories;
    setCategories(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updated } : c))
    );
    try {
      const payload: Record<string, any> = {};
      if (updated.name !== undefined) payload.name = updated.name;
      if (updated.slug !== undefined) payload.slug = updated.slug;
      if (updated.image !== undefined) payload.image = updated.image;
      if (updated.description !== undefined) payload.description = updated.description;
      if (updated.status !== undefined) payload.status = updated.status;

      const { error } = await supabase.from('categories').update(payload).eq('id', id);
      if (error) throw error;
      showToast('Cập nhật danh mục thành công!', 'success');
    } catch (e: any) {
      console.error('Error updating category in Supabase:', e);
      setCategories(prevCats);
      showToast(`Không thể cập nhật danh mục: ${e.message || 'Lỗi mạng'}`, 'error');
    }
  };

  const deleteCategory = async (id: string) => {
    const prevCats = categories;
    setCategories(prev => prev.filter(c => c.id !== id));
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      showToast('Đã xóa danh mục thành công!', 'info');
    } catch (e: any) {
      console.error('Error deleting category from Supabase:', e);
      setCategories(prevCats);
      showToast(`Không thể xóa danh mục: ${e.message || 'Lỗi mạng'}`, 'error');
    }
  };

  const getCategoryLabel = (slug: string): string => {
    const found = categories.find(c => c.slug === slug);
    if (found) return found.name;
    switch (slug) {
      case 'noi-that': return 'Nội thất gia dụng';
      case 'den': return 'Đèn & Chiếu sáng';
      case 'decor': case 'trang-tri': return 'Đồ trang trí Decor';
      case 'luu-tru': return 'Giỏ & Kệ lưu trữ';
      case 'gom-su': return 'Gốm sứ thủ công';
      case 'nha-bep': return 'Đồ dùng Nhà bếp';
      default: return 'Khác';
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        isLoading,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryLabel,
        refreshData,
        isMounted,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}

