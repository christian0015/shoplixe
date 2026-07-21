// components/ProductsTemplates/MagazineProducts.tsx
'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Badge } from '@/components/ui';
import { FavoriteButton } from '@/components/FavoriteButton';
import { StarRatingDisplay } from '@/components/StarRating';
import { ScrollUnderline, LoopRing } from '@/components/heros/HeroSvgAccents';
import type { ProductCardData } from '@/components/ProductCard';
import type { ProductsTemplateProps } from './types';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

// ============================================================
// MagazineProducts — mur de galerie. Chaque rangée est une cimaise :
// 3 cadres de largeurs inégales (5/4/3 puis miroir 3/4/5), alignés
// tantôt sur une ligne haute tantôt sur une ligne basse — comme des
// toiles accrochées à des hauteurs de clou différentes. Le mat
// (marge intérieure) garde l'image en object-contain : aucun crop
// disgracieux quel que soit le ratio produit (1:1, 4:5, 9:16, 16:9).
// ============================================================

interface RowSpec {
  cols: string; // grid-template-columns
  align: 'start' | 'end';
  heights: number[];
}

const ROW_A: RowSpec = { cols: '5fr 4fr 3fr', align: 'end', heights: [480, 360, 300] };
const ROW_B: RowSpec = { cols: '3fr 4fr 5fr', align: 'start', heights: [300, 360, 480] };

function rowSpec(i: number): RowSpec {
  return i % 2 === 0 ? ROW_A : ROW_B;
}

/** Petit repère de cimaise — écho du LoopRing/numérotation éditoriale du MagazineHero. */
function BayMarker({ index, color, accent }: { index: number; color: string; accent: string }) {
  return (
    <div className="flex items-center gap-3 mb-6 md:mb-8">
      <span className="font-display italic text-sm md:text-base" style={{ color }}>
        Collection
      </span>
      <ScrollUnderline color={accent} width={56} className="opacity-80" />
      <span className="text-[10px] font-mono uppercase tracking-[0.22em]" style={{ color }}>
        {String(index + 1).padStart(2, '0')}
      </span>
    </div>
  );
}

/** Séparateur entre baies — occupe le silence plutôt que de laisser un vide plat. */
function BaySpacer({ accent }: { accent: string }) {
  return (
    <div className="hidden md:flex items-center justify-center my-14 select-none">
      <div className="h-px flex-1" style={{ backgroundColor: `${accent}22` }} />
      <LoopRing color={accent} size={54} className="mx-6 opacity-60 shrink-0" />
      <div className="h-px flex-1" style={{ backgroundColor: `${accent}22` }} />
    </div>
  );
}

/** Cadre + mat + cartouche façon étiquette de musée. */
function GalleryFrame({
  product,
  index,
  shopSlug,
  theme,
  accent,
  isFavorite,
  isAuthenticated,
  height,
}: {
  product: ProductCardData;
  index: number;
  shopSlug: string;
  theme: ProductsTemplateProps['theme'];
  accent: string;
  isFavorite: boolean;
  isAuthenticated: boolean;
  height: number;
}) {
  const displayPrice = product.promoPrice ?? product.price;
  const hasPromo = typeof product.promoPrice === 'number' && product.promoPrice < product.price;

  return (
    <Link href={`/${shopSlug}/${product.slug}`} className="product-card group flex flex-col" style={{ height }}>
      {/* Cadre — mat en fond, image toujours contain, jamais étirée */}
      <div
        className="relative flex-1 overflow-hidden rounded-sm"
        style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}
      >
        <div className="absolute inset-3 md:inset-4 overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.035]"
              sizes="(max-width: 768px) 90vw, 30vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[10px] font-mono uppercase tracking-widest opacity-30" style={{ color: theme.textMuted }}>
                Sans visuel
              </span>
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton type="product" id={product._id} initialActive={isFavorite} isAuthenticated={isAuthenticated} />
        </div>
        {!product.available && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="sold-out">Épuisé</Badge>
          </div>
        )}

        {/* Numéro de pièce — coin bas-gauche du cadre, discret */}
        <span
          className="absolute bottom-3 left-3 text-[9px] font-mono tracking-[0.15em] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ color: theme.textMuted }}
        >
          PIÈCE N°{String(index + 1).padStart(3, '0')}
        </span>
      </div>

      {/* Cartouche — étiquette de musée sous le cadre */}
      <div className="pt-3 flex items-start justify-between gap-3 border-t" style={{ borderColor: theme.border }}>
        <div className="min-w-0">
          <p className="font-display italic text-sm md:text-[15px] leading-snug truncate" style={{ color: theme.text }}>
            {product.name}
          </p>
          {(product.reviewsCount ?? 0) > 0 && (
            <div className="mt-1">
              <StarRatingDisplay value={product.rating ?? 0} count={product.reviewsCount} size={10} />
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-2 font-mono shrink-0">
          {hasPromo && (
            <span className="text-[10px] line-through opacity-55" style={{ color: theme.textMuted }}>
              {product.price}
            </span>
          )}
          <span className={`text-xs font-semibold ${!product.available ? 'opacity-55' : ''}`} style={{ color: hasPromo ? accent : theme.text }}>
            {displayPrice} MAD
          </span>
        </div>
      </div>
    </Link>
  );
}

export function MagazineProducts({
  products,
  theme,
  accentColor,
  shopSlug,
  isAuthenticated = false,
  favoriteIds = [],
}: ProductsTemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const accent = accentColor || theme.accent;

  useEffect(() => {
    const frames = containerRef.current?.querySelectorAll('.product-card');
    if (!frames?.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        frames,
        { opacity: 0, y: 46 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.09,
          ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 85%' },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [products]);

  const rows: ProductCardData[][] = [];
  for (let i = 0; i < products.length; i += 3) rows.push(products.slice(i, i + 3));

  return (
    <div ref={containerRef} className="relative py-6 md:py-10">
      {/* ---------- DESKTOP : cimaise, cadres à hauteurs inégales ---------- */}
      <div className="hidden md:block">
        {rows.map((row, ri) => {
          const spec = rowSpec(ri);
          const full = row.length === 3;

          return (
            <div key={ri}>
              {ri === 0 && <BayMarker index={ri} color={theme.textMuted} accent={accent} />}

              <div
                className={`grid gap-8 lg:gap-10 items-${spec.align}`}
                style={{ gridTemplateColumns: full ? spec.cols : row.map(() => '1fr').join(' ') }}
              >
                {row.map((p, i) => (
                  <GalleryFrame
                    key={p._id}
                    product={p}
                    index={ri * 3 + i}
                    height={full ? spec.heights[i] : 360}
                    shopSlug={shopSlug}
                    theme={theme}
                    accent={accent}
                    isFavorite={favoriteIds.includes(p._id)}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </div>

              {ri < rows.length - 1 && <BaySpacer accent={accent} />}
            </div>
          );
        })}
      </div>

      {/* ---------- MOBILE : défilement respiré, une pièce à la fois ---------- */}
      <div className="md:hidden flex flex-col gap-12 px-1">
        <BayMarker index={0} color={theme.textMuted} accent={accent} />
        {products.map((p, i) => (
          <div key={p._id} className="flex flex-col gap-8">
            <GalleryFrame
              product={p}
              index={i}
              height={i % 3 === 1 ? 340 : 420}
              shopSlug={shopSlug}
              theme={theme}
              accent={accent}
              isFavorite={favoriteIds.includes(p._id)}
              isAuthenticated={isAuthenticated}
            />
            {i % 4 === 3 && i < products.length - 1 && (
              <div className="flex items-center justify-center">
                <LoopRing color={accent} size={44} className="opacity-50" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}