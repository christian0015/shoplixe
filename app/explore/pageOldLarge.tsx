// app/explore/page.tsx
import Link from 'next/link';
import { getFeaturedProducts, getNewShops, getFypProducts } from '@/lib/public-data';
import { HeroSection } from '@/components/explore/HeroSectionOldLarge';
import { CategoryCarousel } from '@/components/explore/CategoryCarousel';
import { ExploreShopCard } from '@/components/explore/ExploreShopCard';
import { NearbyShopsSection } from '@/components/explore/NearbyShopsSection';
import { NearbyShopsWrapper } from '@/components/NearbyShopsWrapper';
import { InfiniteFypGrid } from '@/components/explore/InfiniteFypGrid';
import { SearchModal } from '@/components/explore/SearchModal';
import type { ShopSearchResult, ProductSearchResult } from '@/types';
import './explore.css';

export const metadata = {
  title: 'Explorer — Shoplixe',
  description: 'Galerie curated de boutiques indépendantes, créations uniques et studios locaux.',
};
export const dynamic = 'force-dynamic';

export default async function ExplorePage() {
  const [featuredProducts, newShops, fypData] = await Promise.all([
    getFeaturedProducts(4),
    getNewShops(6),
    getFypProducts(1, 8),
  ]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F0E0D] relative pb-24 awwward-grid-bg selection:bg-[#E25B38] selection:text-white">
      
      {/* SVG Décoratifs Flottants Subtils */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-15 overflow-hidden">
        <svg className="absolute top-28 left-8 w-6 h-6 animate-float-shape text-stone-900" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
        <svg className="absolute top-[55%] right-8 w-10 h-10 text-[#E25B38] animate-spin-shape" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>

      {/* Header Minimaliste */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/85 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-serif-editorial text-3xl italic tracking-tight">
              Shoplixe<span className="text-[#E25B38] font-sans font-bold">.</span>
            </Link>
            <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest text-stone-400 border-l border-stone-300 pl-4">
              Awwwards Showcase
            </span>
          </div>

          <div className="text-xs font-mono uppercase tracking-widest text-stone-600">
            [ Casablanca — Marrakech ]
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-8 space-y-24">
        
        {/* 1. HERO SECTION : Texter + Background Grainient + Pile 3D Sponsorisée */}
        <HeroSection featuredProducts={featuredProducts as unknown as ProductSearchResult[]} />

        {/* 2. NOUVEAUX STUDIOS (Max 6) */}
        {newShops.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-end justify-between border-b border-stone-200 pb-4">
              <div>
                <span className="text-xs font-mono uppercase text-[#E25B38]">Sélection récente</span>
                <h2 className="font-serif-editorial italic text-3xl">Nouveaux Studios</h2>
              </div>
              <span className="text-xs font-mono text-stone-400 uppercase">[ 06 Nouveautés ]</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(newShops as unknown as ShopSearchResult[]).map((shop) => (
                <ExploreShopCard key={shop._id} shop={shop} />
              ))}
            </div>
          </section>
        )}

        {/* 3. NEARBY SECTION (Avec fallback permissions) */}
        {/* <NearbyShopsSection /> */}
        <NearbyShopsWrapper />

        {/* 4. CARROUSEL DES CATÉGORIES */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-stone-400">
              [ Filtrer par Univers ]
            </span>
          </div>
          <CategoryCarousel />
        </section>

        {/* 5. FYP INFINITE PRODUCT GRID */}
        <InfiniteFypGrid
          initialProducts={fypData.products as unknown as ProductSearchResult[]}
          initialHasMore={fypData.hasMore}
        />

      </main>

      {/* Floating Trigger Search Modal */}
      <SearchModal />
    </div>
  );
}