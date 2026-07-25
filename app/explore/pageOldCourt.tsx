// app/explore/page.tsx
import Link from 'next/link';
import { getFeaturedProducts, getNewShops, getFypProducts } from '@/lib/public-data';
import { CategoryCarousel } from '@/components/explore/CategoryCarousel';
import { ExploreShopCard } from '@/components/explore/ExploreShopCard';
import { HeroSection } from '@/components/explore/HeroSectionOldCourt';
import { NearbySection } from '@/components/explore/NearbyShopsSection';
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

      {/* Header avec Safe Area Mobile (Encoches) & Padding Desktop ajusté */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/85 backdrop-blur-md border-b border-stone-200/80 pt-10 sm:pt-3 pb-3">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="font-serif-editorial text-3xl italic tracking-tight">
            Shoplixe<span className="text-[#E25B38] font-sans font-bold">.</span>
          </Link>

          <div className="text-xs font-mono uppercase tracking-widest text-stone-500 bg-stone-100/80 px-3 py-1 rounded-full border border-stone-200">
            [ MAROC — STUDIO ]
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-10 space-y-20">
        
        {/* 1. HERO SECTION : Textes sur fond clair + Card Grainient 3D */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <p className="text-xs font-mono uppercase tracking-widest text-[#E25B38]">
              Curated Showcase
            </p>
            <h1 className="font-serif-editorial italic text-5xl sm:text-6xl md:text-7xl font-normal leading-[1.03] text-stone-900">
              L’élégance du commerce direct.
            </h1>
            <p className="text-stone-600 font-sans text-base sm:text-lg max-w-xl font-light leading-relaxed">
              Parcourez les univers uniques façonnés par nos créateurs indépendants. Une sélection minutieuse en prise directe avec les studios ateliers.
            </p>

            <div className="pt-2 flex items-center gap-6 text-xs font-mono text-stone-500 border-t border-stone-200/60">
              <div><span className="text-stone-900 font-bold">01.</span> ARTISANAT AUTHENTIQUE</div>
              <div><span className="text-stone-900 font-bold">02.</span> EXPÉDITION DIRECTE</div>
            </div>
          </div>

          {/* Carte Grainient 1 : À la une */}
          <div className="lg:col-span-5 flex justify-center">
            <HeroSection products={featuredProducts as unknown as ProductSearchResult[]} />
          </div>
        </section>

        {/* 2. CARROUSEL DES CATÉGORIES */}
        <section>
          <CategoryCarousel />
        </section>

        {/* 3. NOUVEAUX STUDIOS (Max 6) */}
        {newShops.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-end justify-between border-b border-stone-200 pb-4">
              <div>
                <span className="text-xs font-mono uppercase text-stone-400">Créateurs</span>
                <h2 className="font-serif-editorial italic text-3xl text-stone-900">Nouveaux Studios</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(newShops as unknown as ShopSearchResult[]).map((shop) => (
                <ExploreShopCard key={shop._id} shop={shop} />
              ))}
            </div>
          </section>
        )}

        {/* 4. Section Grainient 2 : À Proximité / Nearby */}
        <NearbySection />

        {/* 5. FYP INFINITE PRODUCT GRID (Scroll Infini automatique) */}
        <InfiniteFypGrid
          initialProducts={fypData.products as unknown as ProductSearchResult[]}
          initialHasMore={fypData.hasMore}
        />

      </main>

      {/* Trigger Modal de Recherche */}
      <SearchModal />
    </div>
  );
}