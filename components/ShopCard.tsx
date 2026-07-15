// components/ShopCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui';
import { StarRatingDisplay } from '@/components/StarRating';
import { CATEGORY_LABELS, type ShopSearchResult } from '@/types';

export function ShopCard({ shop }: { shop: ShopSearchResult }) {
  return (
    <Link
      href={`/${shop.slug}`}
      className="flex gap-3 rounded-2xl border border-stone-200 p-3 hover:border-stone-300 transition-colors"
    >
      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0">
        {shop.logo ? (
          <Image src={shop.logo} alt={shop.name} fill className="object-cover" sizes="80px" />
        ) : (
          shop.cover && <Image src={shop.cover} alt={shop.name} fill className="object-cover" sizes="80px" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{shop.name}</p>
          {shop.isVerified && <Badge variant="verified">✓</Badge>}
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs text-stone-500">
          <Badge>{CATEGORY_LABELS[shop.category]}</Badge>
          {(shop.city || shop.district) && <span>{[shop.district, shop.city].filter(Boolean).join(', ')}</span>}
          {typeof shop.distanceKm === 'number' && <span>· {shop.distanceKm} km</span>}
        </div>

        {shop.reviewsCount > 0 && <StarRatingDisplay value={shop.rating} count={shop.reviewsCount} size={13} />}
      </div>
    </Link>
  );
}
