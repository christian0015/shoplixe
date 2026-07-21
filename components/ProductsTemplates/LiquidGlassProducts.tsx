// components/ProductsTemplates/LiquidGlassProducts.tsx
'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Badge } from '@/components/ui';
import { FavoriteButton } from '@/components/FavoriteButton';
import { StarRatingDisplay } from '@/components/StarRating';
import { FloatingBlob } from '@/components/heros/HeroSvgAccents';
import type { ProductCardData } from '@/components/ProductCard';
import type { ProductsTemplateProps } from './types';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

// ============================================================
// LiquidGlassProducts — la matière à distordre est TOUJOURS un
// dégradé + des blobs colorés qui dérivent en continu (jamais
// l'image produit : le verre flotterait alors sur une photo figée,
// et l'effet de flou liquide ne se lirait pas). Le stage image
// (sticky, desktop) reste net et séparé, hors du verre. Les cartes
// de verre ne contiennent QUE l'info produit et flottent au-dessus
// du fond animé — c'est là que la distorsion se voit vraiment.
// Au scroll, chaque carte "active" son image dans le stage.
// ============================================================

/** Fond dérivant — dégradé du thème + blobs en mouvement lent, jamais figé. */
function DriftBackdrop({ theme, accent }: { theme: ProductsTemplateProps['theme']; accent: string }) {
  const blobA = useRef<HTMLDivElement>(null);
  const blobB = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(blobA.current, { x: 60, y: -40, duration: 14, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to(blobB.current, { x: -50, y: 50, duration: 17, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden rounded-[32px]" style={{ background: theme.gradient ?? theme.bg }}>
      <div ref={blobA} className="absolute -top-24 -left-16">
        <FloatingBlob color={accent} size={360} className="opacity-45" />
      </div>
      <div ref={blobB} className="absolute -bottom-28 -right-10">
        <FloatingBlob color={theme.bentoPalette?.[1] ?? accent} size={320} className="opacity-35" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25 pointer-events-none" />
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" aria-hidden>
        <filter id="lg-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#lg-grain)" />
      </svg>
    </div>
  );
}

function GlassInfoCard({
  product,
  index,
  shopSlug,
  accent,
  isFavorite,
  isAuthenticated,
  active,
}: {
  product: ProductCardData;
  index: number;
  shopSlug: string;
  accent: string;
  isFavorite: boolean;
  isAuthenticated: boolean;
  active: boolean;
}) {
  const displayPrice = product.promoPrice ?? product.price;
  const hasPromo = typeof product.promoPrice === 'number' && product.promoPrice < product.price;

  return (
    <Link
      href={`/${shopSlug}/${product.slug}`}
      data-index={index}
      className={[
        'liquid-card glass-card glass-card--strong relative block rounded-[26px] p-5 md:p-6 transition-[transform,opacity] duration-500',
        active ? 'md:scale-[1.03] opacity-100' : 'md:scale-[0.97] opacity-90 md:opacity-70',
      ].join(' ')}
    >
      <div className="absolute top-4 right-4 z-10">
        <FavoriteButton type="product" id={product._id} initialActive={isFavorite} isAuthenticated={isAuthenticated} />
      </div>

      <span className="text-[9px] font-mono tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.55)' }}>
        Pièce N°{String(index + 1).padStart(3, '0')}
      </span>

      <p className="mt-2 font-display font-bold text-lg md:text-xl leading-tight" style={{ color: '#fff' }}>
        {product.name}
      </p>

      {!product.available && (
        <div className="mt-2">
          <Badge variant="sold-out">Épuisé</Badge>
        </div>
      )}

      {(product.reviewsCount ?? 0) > 0 && (
        <div className="mt-3">
          <StarRatingDisplay value={product.rating ?? 0} count={product.reviewsCount} size={12} />
        </div>
      )}

      <div className="mt-4 flex items-baseline gap-2 font-mono">
        {hasPromo && (
          <span className="text-xs line-through" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {product.price} MAD
          </span>
        )}
        <span className="text-base font-semibold" style={{ color: hasPromo ? accent : '#fff' }}>
          {displayPrice} MAD
        </span>
      </div>

      {/* Image miniature — visible uniquement mobile, où il n'y a pas de stage sticky */}
      <div className="md:hidden relative mt-4 h-56 rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
        {product.images[0] && (
          <Image src={product.images[0]} alt={product.name} fill className="object-contain" sizes="90vw" />
        )}
      </div>
    </Link>
  );
}

export function LiquidGlassProducts({
  products,
  theme,
  accentColor,
  shopSlug,
  isAuthenticated = false,
  favoriteIds = [],
}: ProductsTemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageImgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const accent = accentColor || theme.accent;

  // Reveal des cartes au scroll
  useEffect(() => {
    const cards = containerRef.current?.querySelectorAll('.liquid-card');
    if (!cards?.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: 'power3.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 88%' },
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [products]);

  // Chaque carte "active" son image dans le stage sticky quand elle traverse le centre de l'écran
  useEffect(() => {
    const cards = containerRef.current?.querySelectorAll('.liquid-card');
    if (!cards?.length || window.matchMedia('(max-width: 767px)').matches) return;
    const triggers = Array.from(cards).map((card, i) =>
      ScrollTrigger.create({
        trigger: card,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          if (self.isActive) setActiveIndex(i);
        },
      })
    );
    return () => triggers.forEach((t) => t.kill());
  }, [products]);

  // Petit "pop" GSAP sur l'image du stage à chaque changement
  useEffect(() => {
    const el = stageImgRefs.current[activeIndex];
    if (!el) return;
    gsap.fromTo(el, { scale: 0.93, opacity: 0.6 }, { scale: 1, opacity: 1, duration: 0.55, ease: 'power3.out' });
  }, [activeIndex]);

  return (
    <div ref={containerRef} className="relative rounded-[32px] overflow-hidden px-3 md:px-8 py-8 md:py-14">
      <DriftBackdrop theme={theme} accent={accent} />

      <div className="relative grid md:grid-cols-[0.9fr_1.1fr] gap-8 md:gap-14">
        {/* ---------- STAGE — sticky desktop, net, hors du verre ---------- */}
        <div className="hidden md:block sticky top-24 h-[560px] self-start">
          <div className="relative w-full h-full">
            {products.map((p, i) => (
              <div
                key={p._id}
                ref={(el) => {
                  stageImgRefs.current[i] = el;
                }}
                className="absolute inset-0 flex items-center justify-center transition-opacity duration-700"
                style={{ opacity: activeIndex === i ? 1 : 0, pointerEvents: activeIndex === i ? 'auto' : 'none' }}
              >
                {p.images[0] ? (
                  <div className="relative w-full h-full rounded-[24px] overflow-hidden" style={{ boxShadow: `0 40px 90px -35px ${accent}55` }}>
                    <Image src={p.images[0]} alt={p.name} fill className="object-contain" sizes="45vw" />
                  </div>
                ) : (
                  <div
                    className="w-full h-full rounded-[24px] flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                  >
                    <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      Sans visuel
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <span
            className="absolute -bottom-7 left-1 text-[10px] font-mono tracking-[0.2em] uppercase"
            style={{ color: theme.text, opacity: 0.5 }}
          >
            {String(activeIndex + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}
          </span>
        </div>

        {/* ---------- Colonne de verre — une carte par produit ---------- */}
        <div className="flex flex-col gap-6 md:gap-[18vh] md:py-[8vh]">
          {products.map((p, i) => (
            <GlassInfoCard
              key={p._id}
              product={p}
              index={i}
              shopSlug={shopSlug}
              accent={accent}
              isFavorite={favoriteIds.includes(p._id)}
              isAuthenticated={isAuthenticated}
              active={activeIndex === i}
            />
          ))}
        </div>
      </div>
    </div>
  );
}