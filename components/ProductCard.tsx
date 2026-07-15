// components/ProductCard.tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { Badge } from '@/components/ui';
import { FavoriteButton } from '@/components/FavoriteButton';
import { StarRatingDisplay } from '@/components/StarRating';
import type { ThemeTokens, ShopTemplate } from '@/types';

// Le canvas three.js ne doit jamais être rendu côté serveur, et n'est monté
// que quand la carte entre dans le viewport (voir IntersectionObserver plus bas).
const ProductPlane3D = dynamic(
  () => import('@/components/ProductPlane3D').then((m) => m.ProductPlane3D),
  { ssr: false }
);

export interface ProductCardData {
  _id: string;
  name: string;
  price: number;
  promoPrice?: number | null;
  images: string[];
  available: boolean;
  rating?: number;
  reviewsCount?: number;
  slug: string;
}

function isColorDark(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length < 6) return false;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

export function ProductCard({
  product,
  shopSlug,
  theme,
  accentColor,
  isAuthenticated = false,
  isFavorite = false,
  template = 'grid',
  paletteColor,
}: {
  product: ProductCardData;
  shopSlug: string;
  theme: ThemeTokens;
  accentColor?: string | null;
  isAuthenticated?: boolean;
  isFavorite?: boolean;
  template?: ShopTemplate;
  /** Couleur forte assignée par le ProductGrid pour les templates bento */
  paletteColor?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const accent = accentColor || theme.accent;
  const [inView, setInView] = useState(false);

  const isGlass = template === 'liquidGlass';
  const isBento = template === 'bento';
  const is3D = template === 'flux3d';

  // Monte le canvas 3D seulement quand la carte devient visible — évite
  // d'instancier des dizaines de contextes WebGL sur une grande grille.
  useEffect(() => {
    if (!is3D) return;
    const el = mediaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [is3D]);

  useEffect(() => {
    // Le hover du template 3D est géré dans le canvas lui-même (raycast three.js).
    if (is3D) return;
    const el = cardRef.current;
    if (!el) return;
    // const enter = () =>
    //   gsap.to(el, { y: -4, boxShadow: `0 22px 48px -18px ${accent}55`, duration: 0.3, ease: 'power2.out' });
    // const leave = () => gsap.to(el, { y: 0, boxShadow: '0 0px 0px transparent', duration: 0.3, ease: 'power2.out' });
    // el.addEventListener('mouseenter', enter);
    // el.addEventListener('mouseleave', leave);
    // return () => {
    //   el.removeEventListener('mouseenter', enter);
    //   el.removeEventListener('mouseleave', leave);
    // };
  }, [accent, is3D]);

  const displayPrice = product.promoPrice ?? product.price;
  const hasPromo = typeof product.promoPrice === 'number' && product.promoPrice < product.price;

  const bentoBg = isBento ? paletteColor ?? theme.accent : undefined;
  const bentoDark = isBento && bentoBg ? isColorDark(bentoBg) : false;
  const textColor = bentoDark ? '#FAFAF8' : theme.text;
  const mutedColor = bentoDark ? 'rgba(250,250,248,0.68)' : theme.textMuted;

  return (
    <div
      ref={cardRef}
      className={[
        'product-card bento-cell group relative overflow-hidden border',
        isGlass ? 'glass-card rounded-[28px]' : 'rounded-3xl',
        isBento ? 'flex flex-col h-full' : '',
      ].join(' ')}
      style={{
        backgroundColor: isGlass ? undefined : bentoBg ?? theme.surface,
        borderColor: isGlass ? 'transparent' : bentoDark ? 'rgba(255,255,255,0.12)' : theme.border,
      }}
    >
      <div className="absolute top-2.5 left-2.5 z-10">
        <FavoriteButton type="product" id={product._id} initialActive={isFavorite} isAuthenticated={isAuthenticated} />
      </div>

      {!product.available && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <Badge variant="sold-out">Épuisé</Badge>
        </div>
      )}

      <Link href={`/${shopSlug}/${product.slug}`} className={isBento ? 'flex flex-col h-full' : ''}>
        <div
          ref={mediaRef}
          className={[
            'relative w-full overflow-hidden',
            isBento ? 'flex-1 min-h-[140px]' : 'aspect-square',
            isGlass ? 'bg-transparent' : 'bg-stone-100',
          ].join(' ')}
        >
          {is3D ? (
            <>
              {inView && product.images[0] && <ProductPlane3D image={product.images[0]} />}
              {!inView && product.images[0] && (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover grayscale scale-95 opacity-80"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              )}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.18)_100%)]" />
            </>
          ) : (
            product.images[0] && (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className={[
                  'object-cover transition-transform duration-500',
                  !product.available ? 'opacity-60' : '',
                  isGlass || isBento ? 'group-hover:scale-[1.06]' : '',
                ].join(' ')}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            )
          )}

          {isGlass && <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/10" />}
        </div>

        <div className={isBento ? 'p-4 space-y-1.5' : 'p-3 space-y-1'}>
          <p
            className={isBento ? 'font-display font-bold text-base leading-tight' : 'text-sm font-medium truncate'}
            style={{ color: isGlass ? '#fff' : textColor }}
          >
            {product.name}
          </p>

          {(product.reviewsCount ?? 0) > 0 && (
            <StarRatingDisplay value={product.rating ?? 0} count={product.reviewsCount} size={12} />
          )}

          <div className="flex items-center gap-2 font-mono">
            {hasPromo && (
              <span
                className="text-xs line-through opacity-60"
                style={{ color: isGlass ? 'rgba(255,255,255,0.7)' : mutedColor }}
              >
                {product.price} MAD
              </span>
            )}
            <span
              className={`text-sm font-semibold ${!product.available ? 'opacity-60' : ''}`}
              style={{ color: isGlass ? '#fff' : hasPromo ? accent : textColor }}
            >
              {displayPrice} MAD
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}