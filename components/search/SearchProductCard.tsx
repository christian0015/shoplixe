// components/search/SearchProductCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ProductSearchResult } from '@/types';

export function SearchProductCard({ product }: { product: ProductSearchResult }) {
  const displayPrice = product.promoPrice ?? product.price;

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-[#13111A]/60 border border-white/10 backdrop-blur-md transition-all duration-500 hover:border-[#A855F7]/50 hover:-translate-y-1.5 flex flex-col justify-between p-4">
      {/* Media Image */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-stone-900/80 mb-4">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-600 font-mono text-xs">
            [ SANS IMAGE ]
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity" />

        {/* Badge Studio Origin */}
        <span className="absolute top-3 left-3 text-[10px] font-mono uppercase tracking-wider bg-black/60 backdrop-blur-md text-stone-300 border border-white/10 px-2.5 py-1 rounded-full">
          {product.shop?.name}
        </span>

        {/* Badge Prix */}
        <span className="absolute top-3 right-3 text-xs font-mono font-bold bg-[#FAF8F5] text-stone-900 px-3 py-1 rounded-full shadow-lg">
          {displayPrice} MAD
        </span>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
          <span>{product.shop?.city || 'Maroc'}</span>
          {typeof product.distanceKm === 'number' && <span>{product.distanceKm} km</span>}
        </div>
        <h3 className="font-serif-editorial italic text-lg text-stone-100 truncate group-hover:text-[#FF9FFC] transition-colors">
          {product.name}
        </h3>
      </div>

      {/* Action Link */}
      <div className="pt-3 border-t border-white/10 mt-3 flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400">
          Pièce Authentique
        </span>
        <Link
          href={`/${product.shop?.slug}/${product.slug}`}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#A855F7] border border-white/20 flex items-center justify-center text-white text-xs transition-colors"
        >
          →
        </Link>
      </div>
    </div>
  );
}