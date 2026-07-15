// app/explore/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import { getTrendingProducts, getNewShops } from '@/lib/public-data';
import { SearchBar } from '@/components/SearchBar';
import { CategoryCarousel } from '@/components/CategoryCarousel';
import { NearbyShopsSection } from '@/components/NearbyShopsSection';
import { ProductCard } from '@/components/ProductCard';
import { ShopCard } from '@/components/ShopCard';
import { themes } from '@/lib/themes';
import type { ShopSearchResult, ProductSearchResult } from '@/types';

export const metadata = { title: 'Explorer — VitrineMa' };
export const dynamic = 'force-dynamic';

export default async function ExplorePage() {
  const [trending, newShops] = await Promise.all([getTrendingProducts(8), getNewShops(8)]);

  return (
    <main className="max-w-4xl mx-auto px-4 pb-16 space-y-10">
      <Suspense fallback={null}>
        <SearchBar />
      </Suspense>

      <CategoryCarousel />

      {trending.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display font-bold text-lg">Tendances</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(trending as unknown as ProductSearchResult[]).map((product) => (
              <ProductCard key={product._id} product={product} shopSlug={product.shop.slug} theme={themes.minimal} />
            ))}
          </div>
        </section>
      )}

      <Suspense fallback={null}>
        <NearbyShopsSection />
      </Suspense>

      {newShops.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display font-bold text-lg">Nouvelles boutiques</h2>
          <div className="grid gap-3">
            {(newShops as unknown as ShopSearchResult[]).map((shop) => (
              <ShopCard key={shop._id} shop={shop} />
            ))}
          </div>
        </section>
      )}

      <p className="text-center text-sm text-stone-400">
        <Link href="/search" className="underline">Recherche avancée →</Link>
      </p>
    </main>
  );
}
