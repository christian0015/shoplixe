// components/explore/ExploreShopCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import type { ShopSearchResult } from '@/types';

export function ExploreShopCard({ shop }: { shop: ShopSearchResult }) {
  return (
    <Link
      href={`/${shop.slug}`}
      className="explore-glass-card rounded-3xl p-5 flex items-center gap-5 group"
    >
      <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-stone-200 shrink-0 border border-stone-300/50">
        {shop.logo ? (
          <Image src={shop.logo} alt={shop.name} fill className="object-cover group-hover:scale-105 transition-transform" />
        ) : (
          shop.cover && <Image src={shop.cover} alt={shop.name} fill className="object-cover group-hover:scale-105 transition-transform" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="font-serif-editorial italic text-xl text-stone-900 truncate">
            {shop.name}
          </h4>
          {shop.isVerified && <span className="text-xs text-[#E25B38]">✓</span>}
        </div>
        <p className="text-xs font-mono text-stone-500 uppercase tracking-wider">
          {shop.city || 'Studio Indépendant'}
        </p>
      </div>

      <span className="w-10 h-10 rounded-full bg-stone-900 text-[#FAF8F5] flex items-center justify-center shrink-0 group-hover:bg-[#E25B38] transition-colors">
        →
      </span>
    </Link>
  );
}