// components/explore/ExploreProductCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ProductSearchResult } from '@/types';

export function ExploreProductCard({ product }: { product: ProductSearchResult }) {
  const displayPrice = product.promoPrice ?? product.price;

  return (
    <div className="explore-glass-card rounded-3xl overflow-hidden group flex flex-col justify-between">
      <Link href={`/${product.shop.slug}/${product.slug}`} className="block relative aspect-[4/5] bg-stone-100 overflow-hidden">
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        )}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md text-xs font-mono text-stone-900 border border-white/60">
          {displayPrice} MAD
        </div>
      </Link>

      <div className="p-4 space-y-1">
        <p className="text-xs font-mono uppercase text-[#E25B38] tracking-widest truncate">
          {product.shop.name}
        </p>
        <h3 className="font-serif-editorial italic text-lg leading-snug truncate text-stone-900">
          {product.name}
        </h3>
      </div>
    </div>
  );
}