// components/ProductsTemplates/GridProducts.tsx
'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Badge } from '@/components/ui';
import { FavoriteButton } from '@/components/FavoriteButton';
import { StarRatingDisplay } from '@/components/StarRating';
import type { ProductCardData } from '@/components/ProductCard';
import type { ProductsTemplateProps } from './types';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

type Variant = 'tallSplit' | 'wideSplit' | 'plain';

interface Slot {
  variant: Variant;
  col: string;
  row: string;
}

// ============================================================
// Modules 12 x 6 — pavage exact vérifié (30 + 9 + 16 + 9 + 8 = 72
// = 12 x 6). Le module B est le miroir horizontal du module A :
// le "hero" (tallSplit) alterne gauche/droite à chaque groupe de
// 5 produits, ce qui casse toute répétition visible sans jamais
// improviser un layout bancal.
// ============================================================
const MODULE_A: Slot[] = [
  { variant: 'tallSplit', col: '1 / 6', row: '1 / 7' },
  { variant: 'plain', col: '6 / 9', row: '1 / 4' },
  { variant: 'plain', col: '9 / 13', row: '1 / 5' },
  { variant: 'plain', col: '6 / 9', row: '4 / 7' },
  { variant: 'wideSplit', col: '9 / 13', row: '5 / 7' },
];

const MODULE_B: Slot[] = [
  { variant: 'tallSplit', col: '8 / 13', row: '1 / 7' },
  { variant: 'plain', col: '5 / 8', row: '1 / 4' },
  { variant: 'plain', col: '1 / 5', row: '1 / 5' },
  { variant: 'plain', col: '5 / 8', row: '4 / 7' },
  { variant: 'wideSplit', col: '1 / 5', row: '5 / 7' },
];

const ROW_UNIT = 'clamp(78px, 7.4vw, 118px)';

// Petit repère "atelier", écho des CornerTick du GridHero — sert à
// occuper les silences entre modules plutôt que de laisser du vide mou.
function ModuleMarker({ index, color, accent }: { index: number; color: string; accent: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 px-0.5 select-none">
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="shrink-0">
        <path d="M5 0V10M0 5H10" stroke={accent} strokeWidth="1" />
      </svg>
      <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-[0.22em]" style={{ color }}>
        Sélection — {String(index + 1).padStart(2, '0')}
      </span>
      <span className="flex-1 h-px" style={{ backgroundColor: `${color}33` }} />
    </div>
  );
}

/** Fond flouté (même image, scale + blur) derrière l'image nette en object-contain — jamais d'étirement disgracieux quel que soit le ratio produit. */
function MediaFill({ src, alt }: { src?: string | null; alt: string }) {
  if (!src) return <div className="absolute inset-0 bg-stone-100" aria-hidden />;
  return (
    <>
      <Image src={src} alt="" fill aria-hidden className="object-cover scale-125 blur-2xl opacity-40 saturate-150" sizes="1px" />
      <Image
        src={src}
        alt={alt}
        fill
        className="relative object-contain transition-transform duration-700 ease-out group-hover:scale-[1.045]"
        sizes="(max-width: 768px) 100vw, 40vw"
      />
    </>
  );
}

function PriceRow({
  product,
  textColor,
  mutedColor,
  accent,
}: {
  product: ProductCardData;
  textColor: string;
  mutedColor: string;
  accent: string;
}) {
  const displayPrice = product.promoPrice ?? product.price;
  const hasPromo = typeof product.promoPrice === 'number' && product.promoPrice < product.price;
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-display font-bold text-sm md:text-[15px] leading-tight line-clamp-2" style={{ color: textColor }}>
        {product.name}
      </p>
      {(product.reviewsCount ?? 0) > 0 && <StarRatingDisplay value={product.rating ?? 0} count={product.reviewsCount} size={11} />}
      <div className="flex items-baseline gap-2 font-mono">
        {hasPromo && (
          <span className="text-[11px] line-through opacity-60" style={{ color: mutedColor }}>
            {product.price} MAD
          </span>
        )}
        <span className={`text-sm font-semibold ${!product.available ? 'opacity-60' : ''}`} style={{ color: hasPromo ? accent : textColor }}>
          {displayPrice} MAD
        </span>
      </div>
    </div>
  );
}

function CardChrome({
  product,
  isFavorite,
  isAuthenticated,
  onImage = false,
}: {
  product: ProductCardData;
  isFavorite: boolean;
  isAuthenticated: boolean;
  onImage?: boolean;
}) {
  return (
    <>
      <div className="absolute top-2 right-2 z-20">
        <FavoriteButton type="product" id={product._id} initialActive={isFavorite} isAuthenticated={isAuthenticated} />
      </div>
      {!product.available && (
        <div className="absolute top-2 left-2 z-20">
          <Badge variant="sold-out">Épuisé</Badge>
        </div>
      )}
    </>
  );
}

function GridProductTile({
  product,
  index,
  variant,
  shopSlug,
  theme,
  accent,
  isFavorite,
  isAuthenticated,
  style,
}: {
  product: ProductCardData;
  index: number;
  variant: Variant;
  shopSlug: string;
  theme: ProductsTemplateProps['theme'];
  accent: string;
  isFavorite: boolean;
  isAuthenticated: boolean;
  style?: CSSProperties;
}) {
  const idxLabel = `N°${String(index + 1).padStart(3, '0')}`;

  return (
    <Link
      href={`/${shopSlug}/${product.slug}`}
      className="product-card group relative block rounded-2xl overflow-hidden"
      style={style}
    >
      {variant === 'plain' && (
        <div className="relative w-full h-full">
          <MediaFill src={product.images[0]} alt={product.name} />
          <CardChrome product={product} isFavorite={isFavorite} isAuthenticated={isAuthenticated} />
          <div className="absolute inset-x-0 bottom-0 z-10 p-3 md:p-4 bg-gradient-to-t from-black/60 via-black/15 to-transparent">
            <PriceRow product={product} textColor="#fff" mutedColor="rgba(255,255,255,0.72)" accent={accent} />
          </div>
        </div>
      )}

      {variant === 'tallSplit' && (
        <div className="relative w-full h-full flex flex-col" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
          <div className="relative overflow-hidden" style={{ flex: '7 1 0' }}>
            <MediaFill src={product.images[0]} alt={product.name} />
            <CardChrome product={product} isFavorite={isFavorite} isAuthenticated={isAuthenticated} />
            <span
              className="absolute bottom-2.5 left-2.5 z-10 text-[9px] font-mono px-1.5 py-0.5 rounded-sm text-white"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            >
              {idxLabel}
            </span>
          </div>
          <div className="flex flex-col justify-center gap-2 p-4 border-t" style={{ flex: '3 1 0', borderColor: theme.border }}>
            <PriceRow product={product} textColor={theme.text} mutedColor={theme.textMuted} accent={accent} />
          </div>
        </div>
      )}

      {variant === 'wideSplit' && (
        <div className="relative w-full h-full flex flex-row" style={{ border: `1px solid ${theme.border}`, background: theme.surface }}>
          <div className="relative overflow-hidden" style={{ flex: '6 1 0' }}>
            <MediaFill src={product.images[0]} alt={product.name} />
            <CardChrome product={product} isFavorite={isFavorite} isAuthenticated={isAuthenticated} />
          </div>
          <div className="flex flex-col justify-center gap-2 p-3 md:p-4 border-l" style={{ flex: '4 1 0', borderColor: theme.border }}>
            <PriceRow product={product} textColor={theme.text} mutedColor={theme.textMuted} accent={accent} />
          </div>
        </div>
      )}
    </Link>
  );
}

export function GridProducts({
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
    const cards = containerRef.current?.querySelectorAll('.product-card');
    if (!cards?.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 34 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.045,
          ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 88%' },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [products]);

  const groups: ProductCardData[][] = [];
  for (let i = 0; i < products.length; i += 5) groups.push(products.slice(i, i + 5));

  return (
    <div ref={containerRef} className="relative">
      {/* ---------- DESKTOP : modules 12 x 6, miroir A/B ---------- */}
      {groups.map((group, gi) => {
        const full = group.length === 5;
        const slots = gi % 2 === 0 ? MODULE_A : MODULE_B;

        if (full) {
          return (
            <div key={gi} className="hidden md:block mb-8">
              <ModuleMarker index={gi} color={theme.textMuted} accent={accent} />
              <div
                className="grid grid-cols-12 gap-4"
                style={{ gridTemplateRows: `repeat(6, ${ROW_UNIT})` }}
              >
                {group.map((p, i) => (
                  <GridProductTile
                    key={p._id}
                    product={p}
                    index={gi * 5 + i}
                    variant={slots[i].variant}
                    style={{ gridColumn: slots[i].col, gridRow: slots[i].row }}
                    shopSlug={shopSlug}
                    theme={theme}
                    accent={accent}
                    isFavorite={favoriteIds.includes(p._id)}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </div>
            </div>
          );
        }

        // Reliquat final (< 5 produits) : rendu simple, sans risque de débordement.
        return (
          <div key={gi} className="hidden md:block mb-8">
            <ModuleMarker index={gi} color={theme.textMuted} accent={accent} />
            <div className="grid grid-cols-3 gap-4">
              {group.map((p, i) => (
                <GridProductTile
                  key={p._id}
                  product={p}
                  index={gi * 5 + i}
                  variant="plain"
                  style={{ aspectRatio: '4 / 5' }}
                  shopSlug={shopSlug}
                  theme={theme}
                  accent={accent}
                  isFavorite={favoriteIds.includes(p._id)}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* ---------- MOBILE : empilement rythmé, jamais de 2x2 systématique ---------- */}
      <div className="md:hidden flex flex-col gap-8">
        {groups.map((group, gi) => {
          const [a, b, c, d, e] = group;
          const common = { shopSlug, theme, accent, isAuthenticated };
          return (
            <div key={gi} className="flex flex-col gap-4">
              <ModuleMarker index={gi} color={theme.textMuted} accent={accent} />

              {a && (
                <GridProductTile
                  product={a}
                  index={gi * 5}
                  variant="tallSplit"
                  style={{ height: 420 }}
                  isFavorite={favoriteIds.includes(a._id)}
                  {...common}
                />
              )}

              {(b || c) && (
                <div className="grid grid-cols-2 gap-4">
                  {b && (
                    <GridProductTile
                      product={b}
                      index={gi * 5 + 1}
                      variant="plain"
                      style={{ height: 210 }}
                      isFavorite={favoriteIds.includes(b._id)}
                      {...common}
                    />
                  )}
                  {c && (
                    <GridProductTile
                      product={c}
                      index={gi * 5 + 2}
                      variant="plain"
                      style={{ height: 210 }}
                      isFavorite={favoriteIds.includes(c._id)}
                      {...common}
                    />
                  )}
                </div>
              )}

              {d && (
                <GridProductTile
                  product={d}
                  index={gi * 5 + 3}
                  variant="plain"
                  style={{ height: 300 }}
                  isFavorite={favoriteIds.includes(d._id)}
                  {...common}
                />
              )}

              {e && (
                <GridProductTile
                  product={e}
                  index={gi * 5 + 4}
                  variant="wideSplit"
                  style={{ height: 190 }}
                  isFavorite={favoriteIds.includes(e._id)}
                  {...common}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}