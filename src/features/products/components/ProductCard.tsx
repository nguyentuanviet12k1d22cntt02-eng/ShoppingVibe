'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, formatCurrency } from '@/data/products';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }: { product: Product }) {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { addToCart } = useCart();
  const wishlisted = isWishlisted(product.id);

  // Calculate mock original price for discount badge
  const discountPercent = product.featured ? 15 : 0;
  const originalPrice = discountPercent > 0 ? Math.round(product.price / (1 - discountPercent / 100)) : null;

  return (
    <article
      className="product-card"
      data-id={product.id}
      data-category={product.category}
      data-name={product.name}
      data-price={product.price}
    >
      <div className="product-card-img-wrapper" style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', overflow: 'hidden' }}>
        <Link href={`/products/${product.id}`} style={{ display: 'block', width: '100%', height: '100%', position: 'relative' }}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="product-card-img"
            style={{ objectFit: 'cover' }}
            priority={false}
          />
        </Link>

        {/* Badges Overlay */}
        <div className="card-badge-container">
          {discountPercent > 0 && (
            <span className="card-tag card-tag-discount">-{discountPercent}%</span>
          )}
          <span className="card-tag card-tag-craft">Thủ công</span>
        </div>

        {/* Hover Quick Action Buttons */}
        <div className="product-card-overlay">
          <Link
            href={`/products/${product.id}`}
            className="action-icon-btn"
            title="Xem chi tiết sản phẩm"
            aria-label="Xem chi tiết"
          >
            <i className="fa-regular fa-eye"></i>
          </Link>
          <button
            type="button"
            className="action-icon-btn"
            title="Thêm vào giỏ hàng"
            aria-label="Thêm vào giỏ"
            onClick={(e) => {
              e.preventDefault();
              addToCart(product, 1);
            }}
          >
            <i className="fa-solid fa-cart-shopping"></i>
          </button>
          <button
            type="button"
            className={`action-icon-btn ${wishlisted ? 'wishlist-active' : ''}`}
            title={wishlisted ? "Bỏ yêu thích" : "Yêu thích"}
            aria-label="Yêu thích"
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
            }}
          >
            <i className={wishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
          </button>
        </div>
      </div>

      <div className="product-card-body">
        <div className="product-card-category">{product.categoryName}</div>
        <h3 className="product-card-title">
          <Link href={`/products/${product.id}`}>
            {product.name}
          </Link>
        </h3>
        <p className="product-card-desc">{product.description}</p>

        <div className="product-card-rating">
          <i className="fa-solid fa-star"></i>
          <i className="fa-solid fa-star"></i>
          <i className="fa-solid fa-star"></i>
          <i className="fa-solid fa-star"></i>
          <i className="fa-solid fa-star"></i>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '4px' }}>(4.9)</span>
        </div>

        <div className="product-card-footer">
          <div className="product-card-price">
            <span className="price-current">{formatCurrency(product.price)}</span>
            {originalPrice && (
              <span className="price-original">{formatCurrency(originalPrice)}</span>
            )}
          </div>
          <button
            type="button"
            className="btn btn-outline-green btn-sm"
            onClick={() => addToCart(product, 1)}
          >
            + Giỏ hàng
          </button>
        </div>
      </div>
    </article>
  );
}
