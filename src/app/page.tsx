import React from 'react';
import HomeHero from '@/features/products/components/HomeHero';
import HomeCategories from '@/features/products/components/HomeCategories';
import FeaturedProductsSection from '@/features/products/components/FeaturedProductsSection';
import ArtisanStory from '@/features/products/components/ArtisanStory';
import CustomerReviews from '@/features/products/components/CustomerReviews';

export default function HomePage() {
  return (
    <main className="main-content">
      {/* 1. EDITORIAL MAGAZINE HERO BANNER */}
      <HomeHero />

      {/* 2. VISUAL CATEGORIES GRID */}
      <HomeCategories />

      {/* 3. FEATURED PRODUCTS SECTION */}
      <FeaturedProductsSection />

      {/* 4. ARTISAN CRAFT MANIFESTO STORY BANNER */}
      <ArtisanStory />

      {/* 5. CUSTOMER TESTIMONIAL REVIEWS */}
      <CustomerReviews />
    </main>
  );
}
