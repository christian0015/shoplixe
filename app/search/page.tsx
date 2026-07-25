// app/search/page.tsx
import { Suspense } from 'react';
import { searchProducts, searchShops, searchNearby, searchNearbyProducts } from '@/lib/search-actions';
import { SearchRadarCanvas } from '@/components/search/SearchRadarCanvas';
import { SearchControlHeader } from '@/components/search/SearchControlHeader';
import { SearchProductCard } from '@/components/search/SearchProductCard';
import { SearchShopCard } from '@/components/search/SearchShopCard';
import type { ShopCategory, ProductSearchResult, ShopSearchResult } from '@/types';

export const metadata = {
  title: 'Radar de Créateurs — Shoplixe',
  description: 'Immersion dans le réseau de boutiques indépendantes et ateliers certifiés du Maroc.',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string; category?: string; city?: string; near?: string; lat?: string; lng?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === 'shops' ? 'shops' : 'products';
  const category = (params.category as ShopCategory | 'all') ?? 'all';
  const isNear = params.near === 'true' && params.lat && params.lng;
  const lat = params.lat ? parseFloat(params.lat) : undefined;
  const lng = params.lng ? parseFloat(params.lng) : undefined;

  const products =
    tab === 'products'
      ? isNear && lat && lng
        ? await searchNearbyProducts(lat, lng, 25, category, params.q)
        : await searchProducts(params.q ?? '', { category, city: params.city })
      : [];

  const shops =
    tab === 'shops'
      ? isNear && lat && lng
        ? await searchNearby(lat, lng, 25, category)
        : await searchShops(params.q ?? '', { category, city: params.city })
      : [];

  const resultsCount = tab === 'products' ? products.length : shops.length;

  return (
    <div className="relative min-h-screen text-[#FAF8F5] pb-24">
      {/* 1. Ondulations MagicRings omniprésentes en arrière-plan */}
      <SearchRadarCanvas isSearching={Boolean(params.q)} />

      {/* 2. Contenu principal flottant */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-12 space-y-10">
        
        {/* En-tête Éditorial */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#FF9FFC]">
            [ Radar de Découverte ]
          </span>
          <h1 className="font-serif-editorial italic text-4xl sm:text-5xl font-normal">
            Le réseau des créateurs d’exception.
          </h1>
          <p className="text-stone-400 font-sans text-sm md:text-base font-light max-w-xl">
            En prise directe avec les ateliers authentiques. Zéro contrefaçon, qualité certifiée par la communauté.
          </p>
        </div>

        {/* Console de Contrôle (Barre, Filtres, GPS) */}
        <Suspense fallback={<div className="h-24 rounded-full bg-white/5 animate-pulse" />}>
          <SearchControlHeader />
        </Suspense>

        {/* Indicateur de résultats */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs font-mono text-stone-400">
          <span>
            {resultsCount} {tab === 'products' ? 'CRÉATION(S)' : 'STUDIO(S)'} DÉTECTÉ(S)
          </span>
          {isNear && <span className="text-[#A855F7]">● PERIMÈTRE GPS ACTIF</span>}
        </div>

        {/* Grille de résultats */}
        {tab === 'products' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {(products as unknown as ProductSearchResult[]).map((product) => (
              <SearchProductCard key={product._id} product={product} />
            ))}
            {products.length === 0 && (
              <div className="col-span-full text-center py-20 space-y-3">
                <p className="font-serif-editorial italic text-2xl text-stone-400">
                  Aucune création ne répond à ce signal.
                </p>
                <p className="text-xs font-mono text-stone-500 uppercase">
                  Essayez d'élargir votre recherche ou de réinitialiser vos filtres.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(shops as unknown as ShopSearchResult[]).map((shop) => (
              <SearchShopCard key={shop._id} shop={shop} />
            ))}
            {shops.length === 0 && (
              <div className="col-span-full text-center py-20 space-y-3">
                <p className="font-serif-editorial italic text-2xl text-stone-400">
                  Aucun studio localisé dans ce secteur.
                </p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}