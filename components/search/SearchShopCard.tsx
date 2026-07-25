// components/search/SearchShopCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import type { ShopSearchResult } from '@/types';

export function SearchShopCard({ shop }: { shop: ShopSearchResult }) {
  return (
    <Link
      href={`/${shop.slug}`}
      className="group flex items-center gap-5 p-5 rounded-2xl bg-[#13111A]/60 border border-white/10 backdrop-blur-md hover:border-[#A855F7]/50 transition-all duration-300"
    >
      {/* Logo / Cover */}
      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-900 shrink-0 border border-white/10">
        {shop.logo || shop.cover ? (
          <Image src={(shop.logo || shop.cover)!} alt={shop.name} fill className="object-cover" sizes="64px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-500 font-mono text-xs">
            ST
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-serif-editorial italic text-xl text-stone-100 group-hover:text-[#FF9FFC] transition-colors truncate">
            {shop.name}
          </h3>
          {shop.isVerified && (
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              CERTIFIÉ
            </span>
          )}
        </div>

        <p className="text-xs font-mono text-stone-400 uppercase tracking-widest">
          {[shop.district, shop.city].filter(Boolean).join(', ') || 'Maroc'}
          {typeof shop.distanceKm === 'number' && ` · ${shop.distanceKm} km`}
        </p>
      </div>

      <span className="text-xs font-mono uppercase tracking-widest text-stone-400 group-hover:text-white transition-colors">
        Visiter Studio →
      </span>
    </Link>
  );
}