// app/search/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import { searchProducts, searchShops, searchNearby, searchNearbyProducts } from '@/lib/search-actions';
import { SearchBar } from '@/components/SearchBar';
import { NearMeToggle } from '@/components/NearMeToggle';
import { CityFilter } from '@/components/CityFilter';
import { ShopCard } from '@/components/ShopCard';
import { ProductCard } from '@/components/ProductCard';
import { themes } from '@/lib/themes';
import { CATEGORY_LABELS, type ShopCategory } from '@/types';

export const metadata = { title: 'Résultats de recherche — VitrineMa' };

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
        ? await searchNearbyProducts(lat, lng, 15, category, params.q)
        : await searchProducts(params.q ?? '', { category, city: params.city })
      : [];

  const shops =
    tab === 'shops'
      ? isNear && lat && lng
        ? await searchNearby(lat, lng, 15, category)
        : await searchShops(params.q ?? '', { category, city: params.city })
      : [];

  const resultsCount = tab === 'products' ? products.length : shops.length;

  return (
    <main className="max-w-4xl mx-auto px-4 pb-10">
      <Suspense fallback={null}>
        <SearchBar />
      </Suspense>

      <div className="flex items-center justify-between flex-wrap gap-2 mt-4 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {category !== 'all' && (
            <Link
              href={`/search?tab=${tab}`}
              className="px-3 py-1 rounded-full bg-stone-100 text-sm text-stone-600 flex items-center gap-1"
            >
              {CATEGORY_LABELS[category]} ✕
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Suspense fallback={null}>
            <CityFilter />
          </Suspense>
          <Suspense fallback={null}>
            <NearMeToggle />
          </Suspense>
        </div>
      </div>

      <p className="text-sm text-stone-400 mb-3">
        {resultsCount} résultat{resultsCount > 1 ? 's' : ''} {isNear ? 'près de vous' : ''}
      </p>

      {tab === 'products' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              shopSlug={product.shop.slug}
              theme={themes.minimal}
              isAuthenticated={false}
            />
          ))}
          {products.length === 0 && (
            <p className="col-span-full text-center text-stone-400 py-10">Aucun produit ne correspond à votre recherche.</p>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {shops.map((shop) => (
            <ShopCard key={shop._id} shop={shop} />
          ))}
          {shops.length === 0 && (
            <p className="text-center text-stone-400 py-10">Aucune boutique ne correspond à votre recherche.</p>
          )}
        </div>
      )}
    </main>
  );
}
