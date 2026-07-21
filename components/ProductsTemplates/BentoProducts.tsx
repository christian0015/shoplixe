// components/ProductsTemplates/BentoProducts.tsx
'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Badge } from '@/components/ui';
import { FavoriteButton } from '@/components/FavoriteButton';
import { StarRatingDisplay } from '@/components/StarRating';
import { FloatingBlob } from '@/components/heros/HeroSvgAccents';
import { isColorDark, shade } from '@/components/heros/utils';
import type { ProductCardData } from '@/components/ProductCard';
import type { ProductsTemplateProps } from './types';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

type Variant = 'tallSplit' | 'wideSplit' | 'plain';

interface Slot {
  variant: Variant;
  col: string;
  row: string;
}

interface AccentSlot {
  col: string;
  row: string;
}

// ============================================================
// Modules 12 x 6 — pavage exact vérifié (24 + 12 + 12 + 12 + 12 = 72
// = 12 x 6). Chaque module associe 4 produits + 1 panneau couleur
// décoratif (esprit BentoHero : un bloc plein qui porte l'identité,
// pas un produit). Le module B est le miroir complet (colonnes ET
// lignes) du module A : le hero saute de bord, le panneau change
// de coin — aucune répétition perceptible sur plusieurs modules.
// ============================================================
const MODULE_A: { hero: Slot; plainTop: Slot; plainBottom: Slot; wide: Slot; accent: AccentSlot } = {
  hero: { variant: 'tallSplit', col: '1 / 5', row: '1 / 7' },
  accent: { col: '5 / 9', row: '1 / 4' },
  plainBottom: { variant: 'plain', col: '5 / 9', row: '4 / 7' },
  plainTop: { variant: 'plain', col: '9 / 13', row: '1 / 4' },
  wide: { variant: 'wideSplit', col: '9 / 13', row: '4 / 7' },
};

const MODULE_B: { hero: Slot; plainTop: Slot; plainBottom: Slot; wide: Slot; accent: AccentSlot } = {
  hero: { variant: 'tallSplit', col: '9 / 13', row: '1 / 7' },
  accent: { col: '5 / 9', row: '4 / 7' },
  plainTop: { variant: 'plain', col: '5 / 9', row: '1 / 4' },
  plainBottom: { variant: 'plain', col: '1 / 5', row: '4 / 7' },
  wide: { variant: 'wideSplit', col: '1 / 5', row: '1 / 4' },
};

const ROW_UNIT = 'clamp(80px, 7.6vw, 122px)';

/** Fond flouté (même image) derrière l'image nette en object-contain — jamais d'étirement quel que soit le ratio produit. */
function MediaFill({ src, alt }: { src?: string | null; alt: string }) {
  if (!src) return <div className="absolute inset-0 bg-stone-100" aria-hidden />;
  return (
    <>
      <Image src={src} alt="" fill aria-hidden className="object-cover scale-125 blur-2xl opacity-40 saturate-150" sizes="1px" />
      <Image
        src={src}
        alt={alt}
        fill
        className="relative object-contain transition-transform duration-700 ease-out group-hover:scale-[1.05]"
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

function CardChrome({ product, isFavorite, isAuthenticated }: { product: ProductCardData; isFavorite: boolean; isAuthenticated: boolean }) {
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

function BentoProductTile({
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
    <Link href={`/${shopSlug}/${product.slug}`} className="product-card group relative block rounded-[26px] overflow-hidden" style={style}>
      {variant === 'plain' && (
        <div className="relative w-full h-full" style={{ backgroundColor: theme.surface }}>
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

/** Panneau décoratif — pas un produit : bloc couleur forte + blob + repère,
 *  vient toujours occuper la case qui serait sinon "vide" dans le module. */
function AccentPanel({
  color,
  theme,
  moduleIndex,
  style,
  compact = false,
}: {
  color: string;
  theme: ProductsTemplateProps['theme'];
  moduleIndex: number;
  style?: CSSProperties;
  compact?: boolean;
}) {
  const dark = isColorDark(color);
  const textColor = dark ? '#FAFAF8' : '#141414';
  const mutedColor = dark ? 'rgba(250,250,248,0.65)' : 'rgba(20,20,20,0.55)';

  return (
    <div
      className="accent-panel relative flex flex-col justify-between overflow-hidden rounded-[26px] p-4 md:p-5"
      style={{ backgroundColor: color, ...style }}
    >
      <FloatingBlob
        color={shade(color, dark ? 0.3 : -0.15)}
        size={compact ? 140 : 220}
        className="absolute -right-10 -top-10 opacity-50 pointer-events-none"
      />
      <div className="relative flex items-center gap-2">
        <svg width="9" height="9" viewBox="0 0 9 9" aria-hidden>
          <path d="M4.5 0V9M0 4.5H9" stroke={textColor} strokeWidth="1" />
        </svg>
        <span className="text-[9px] font-mono uppercase tracking-[0.2em]" style={{ color: mutedColor }}>
          Module {String(moduleIndex + 1).padStart(2, '0')}
        </span>
      </div>
      <p className="relative font-display font-bold leading-[0.95] text-lg md:text-2xl" style={{ color: textColor }}>
        Fait&nbsp;main,
        <br />
        pensé pour vous.
      </p>
    </div>
  );
}

export function BentoProducts({
  products,
  theme,
  accentColor,
  shopSlug,
  isAuthenticated = false,
  favoriteIds = [],
}: ProductsTemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const accent = accentColor || theme.accent;
  const palette = theme.bentoPalette && theme.bentoPalette.length > 0 ? theme.bentoPalette : [theme.accent];

  useEffect(() => {
    const cards = containerRef.current?.querySelectorAll('.product-card, .accent-panel');
    if (!cards?.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          stagger: 0.05,
          ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 88%' },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [products]);

  const groups: ProductCardData[][] = [];
  for (let i = 0; i < products.length; i += 4) groups.push(products.slice(i, i + 4));

  return (
    <div ref={containerRef} className="relative">
      {/* ---------- DESKTOP : modules 12 x 6, panneau couleur + miroir A/B ---------- */}
      {groups.map((group, gi) => {
        const full = group.length === 4;
        const layout = gi % 2 === 0 ? MODULE_A : MODULE_B;
        const panelColor = palette[gi % palette.length];

        if (full) {
          const [heroP, plainTopP, plainBottomP, wideP] = group;
          const base = gi * 4;
          return (
            <div key={gi} className="hidden md:block mb-8">
              <div className="grid grid-cols-12 gap-4" style={{ gridTemplateRows: `repeat(6, ${ROW_UNIT})` }}>
                <BentoProductTile
                  product={heroP}
                  index={base}
                  variant={layout.hero.variant}
                  style={{ gridColumn: layout.hero.col, gridRow: layout.hero.row }}
                  shopSlug={shopSlug}
                  theme={theme}
                  accent={accent}
                  isFavorite={favoriteIds.includes(heroP._id)}
                  isAuthenticated={isAuthenticated}
                />
                <AccentPanel
                  color={panelColor}
                  theme={theme}
                  moduleIndex={gi}
                  style={{ gridColumn: layout.accent.col, gridRow: layout.accent.row }}
                />
                <BentoProductTile
                  product={plainTopP}
                  index={base + 1}
                  variant={layout.plainTop.variant}
                  style={{ gridColumn: layout.plainTop.col, gridRow: layout.plainTop.row }}
                  shopSlug={shopSlug}
                  theme={theme}
                  accent={accent}
                  isFavorite={favoriteIds.includes(plainTopP._id)}
                  isAuthenticated={isAuthenticated}
                />
                <BentoProductTile
                  product={plainBottomP}
                  index={base + 2}
                  variant={layout.plainBottom.variant}
                  style={{ gridColumn: layout.plainBottom.col, gridRow: layout.plainBottom.row }}
                  shopSlug={shopSlug}
                  theme={theme}
                  accent={accent}
                  isFavorite={favoriteIds.includes(plainBottomP._id)}
                  isAuthenticated={isAuthenticated}
                />
                <BentoProductTile
                  product={wideP}
                  index={base + 3}
                  variant={layout.wide.variant}
                  style={{ gridColumn: layout.wide.col, gridRow: layout.wide.row }}
                  shopSlug={shopSlug}
                  theme={theme}
                  accent={accent}
                  isFavorite={favoriteIds.includes(wideP._id)}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            </div>
          );
        }

        // Reliquat final (< 4 produits) : rendu simple, sans risque de débordement.
        return (
          <div key={gi} className="hidden md:block mb-8">
            <div className="grid grid-cols-3 gap-4">
              {group.map((p, i) => (
                <BentoProductTile
                  key={p._id}
                  product={p}
                  index={gi * 4 + i}
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

      {/* ---------- MOBILE : hero plein écran, panneau couleur en bandeau, duo, large ---------- */}
      <div className="md:hidden flex flex-col gap-4">
        {groups.map((group, gi) => {
          const [heroP, plainTopP, plainBottomP, wideP] = group;
          const panelColor = palette[gi % palette.length];
          const common = { shopSlug, theme, accent, isAuthenticated };
          const base = gi * 4;

          return (
            <div key={gi} className="flex flex-col gap-4">
              {heroP && (
                <BentoProductTile
                  product={heroP}
                  index={base}
                  variant="tallSplit"
                  style={{ height: 400 }}
                  isFavorite={favoriteIds.includes(heroP._id)}
                  {...common}
                />
              )}

              <AccentPanel color={panelColor} theme={theme} moduleIndex={gi} style={{ height: 110 }} compact />

              {(plainTopP || plainBottomP) && (
                <div className="grid grid-cols-2 gap-4">
                  {plainTopP && (
                    <BentoProductTile
                      product={plainTopP}
                      index={base + 1}
                      variant="plain"
                      style={{ height: 210 }}
                      isFavorite={favoriteIds.includes(plainTopP._id)}
                      {...common}
                    />
                  )}
                  {plainBottomP && (
                    <BentoProductTile
                      product={plainBottomP}
                      index={base + 2}
                      variant="plain"
                      style={{ height: 210 }}
                      isFavorite={favoriteIds.includes(plainBottomP._id)}
                      {...common}
                    />
                  )}
                </div>
              )}

              {wideP && (
                <BentoProductTile
                  product={wideP}
                  index={base + 3}
                  variant="wideSplit"
                  style={{ height: 190 }}
                  isFavorite={favoriteIds.includes(wideP._id)}
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