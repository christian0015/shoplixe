// components/explore/InfiniteFypGrid.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ExploreProductCard } from './ExploreProductCard';
import { fetchFypProductsAction } from '@/lib/actionswappers/fyp';
import type { ProductSearchResult } from '@/types';

export function InfiniteFypGrid({
  initialProducts,
  initialHasMore,
}: {
  initialProducts: ProductSearchResult[];
  initialHasMore: boolean;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;

    try {
      const res = await fetchFypProductsAction(nextPage, 8);
      if (res.products && res.products.length > 0) {
        setProducts((prev) => [...prev, ...res.products]);
        setHasMore(res.hasMore);
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Erreur FYP Infinite Observer:', err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  // Détection automatique du bas de page
  useEffect(() => {
    const el = observerRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <section className="space-y-8">
      <div className="flex items-end justify-between border-b border-stone-200 pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#E25B38]">For You Page</span>
          <h2 className="font-serif-editorial italic text-3xl text-stone-900">Inspirations Continues</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <ExploreProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Target invisible pour le déclenchement automatique du scroll infini */}
      <div ref={observerRef} className="py-8 text-center min-h-[60px]">
        {loading && (
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-400">
            <span className="w-2 h-2 rounded-full bg-[#E25B38] animate-ping" />
            Chargement des créations...
          </div>
        )}
      </div>
    </section>
  );
}