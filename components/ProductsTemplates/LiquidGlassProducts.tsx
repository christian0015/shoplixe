// components/ProductsTemplates/LiquidGlassProducts.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Badge } from '@/components/ui';
import { FavoriteButton } from '@/components/FavoriteButton';
import { StarRatingDisplay } from '@/components/StarRating';
import type { ProductCardData } from '@/components/ProductCard';
import type { ProductsTemplateProps } from './types';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Overlay UX : Indicateurs limités uniquement à la zone des produits
 */
function ScrollProgressOverlay({
  current,
  total,
  accent,
  visible,
}: {
  current: number;
  total: number;
  accent: string;
  visible: boolean;
}) {
  const progressPercent = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-50 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* 1. Indicateur Horizontal - Pilule flottante au-dessus du contenu */}
      <div className="pointer-events-auto absolute top-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/15 px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-widest text-white/70 uppercase">
            Produit
          </span>
          <span className="text-[11px] font-mono font-bold text-white">
            {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </div>
        <div className="w-20 sm:w-28 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%`, backgroundColor: accent }}
          />
        </div>
      </div>

      {/* 2. Indicateur Vertical avec Animation de Scroll (Left Fixed) */}
      <div className="pointer-events-auto absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 bg-black/50 backdrop-blur-xl border border-white/15 p-2.5 sm:p-3 rounded-full shadow-2xl">
        <span className="text-[10px] font-mono font-bold text-white tracking-wider">
          {String(current).padStart(2, '0')}
        </span>

        {/* Rail de la jauge */}
        <div className="relative w-1.5 h-20 sm:h-28 bg-white/20 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 transition-all duration-300 ease-out rounded-full"
            style={{ height: `${progressPercent}%`, backgroundColor: accent }}
          />
        </div>

        <span className="text-[10px] font-mono text-white/50">
          {String(total).padStart(2, '0')}
        </span>

        {/* Animation visuelle "Scroll down" */}
        <div className="mt-1 flex flex-col items-center gap-1 opacity-80 animate-bounce">
          <div className="w-3 h-5 border border-white/50 rounded-full flex justify-center pt-1">
            <div className="w-1 h-1.5 bg-white rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MotionProductSection({
  product,
  index,
  shopSlug,
  accent,
  isFavorite,
  isAuthenticated,
  isLast,
  onActive,
}: {
  product: ProductCardData;
  index: number;
  shopSlug: string;
  accent: string;
  isFavorite: boolean;
  isAuthenticated: boolean;
  isLast: boolean;
  onActive: (index: number) => void;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLAnchorElement>(null);

  const displayPrice = product.promoPrice ?? product.price;
  const hasPromo = typeof product.promoPrice === 'number' && product.promoPrice < product.price;

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const imgWrapper = imageWrapperRef.current;
    const card = cardRef.current;

    if (!section || !content || !imgWrapper || !card) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=100%',
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          onEnter: () => onActive(index + 1),
          onEnterBack: () => onActive(index + 1),
        },
      });

      // Entrée & Motion Chiasma
      tl.fromTo(
        content,
        { opacity: 0 },
        { opacity: 1, duration: 0.15, ease: 'power1.out' },
        0
      )
        .fromTo(
          imgWrapper,
          { yPercent: -12 },
          { yPercent: 12, ease: 'none', duration: 0.8 },
          0
        )
        .fromTo(
          card,
          { y: 60, opacity: 0.3 },
          { y: 0, opacity: 1, ease: 'power2.out', duration: 0.8 },
          0
        );

      // Fondu noir très court (Pro)
      if (!isLast) {
        tl.to(
          content,
          {
            opacity: 0,
            scale: 0.97,
            duration: 0.12,
            ease: 'power2.in',
          },
          0.88
        );
      }
    }, section);

    return () => ctx.revert();
  }, [index, isLast, onActive]);

  return (
    <div
      ref={sectionRef}
      className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      <div
        ref={contentRef}
        className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col md:flex-row items-center justify-start relative pt-12"
      >
        {/* Cadre de l'image (Descend au scroll) */}
        <div
          ref={imageWrapperRef}
          className="relative w-full md:w-[58%] h-[320px] sm:h-[420px] md:h-[520px] rounded-[32px] overflow-hidden z-0 flex items-center justify-center bg-white/5 border border-white/10"
        >
          {product.images[0] ? (
            <div className="relative w-full h-full p-2">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 58vw"
                priority={index === 0}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs font-mono uppercase text-white/40">
                Sans visuel
              </span>
            </div>
          )}

          <span className="absolute bottom-4 left-4 text-[10px] font-mono tracking-widest text-white/70 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full z-10">
            PIÈCE N°{String(index + 1).padStart(3, '0')}
          </span>
        </div>

        {/* Card Glass (Monte au scroll) */}
        <div className="w-full md:w-[48%] mt-[-40px] md:mt-0 md:-ml-28 lg:-ml-36 z-10 relative flex justify-center md:justify-start">
          <Link
            ref={cardRef}
            href={`/${shopSlug}/${product.slug}`}
            className="glass-card glass-card--strong relative w-full max-w-md p-6 sm:p-8 rounded-[28px] border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl transition-colors hover:border-white/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/60">
                N°{String(index + 1).padStart(2, '0')}
              </span>
              <div className="relative z-20" onClick={(e) => e.stopPropagation()}>
                <FavoriteButton
                  type="product"
                  id={product._id}
                  initialActive={isFavorite}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            </div>

            <div className="mt-4">
              <h3 className="font-display font-bold text-xl sm:text-2xl text-white leading-snug">
                {product.name}
              </h3>

              {!product.available && (
                <div className="mt-2">
                  <Badge variant="sold-out">Épuisé</Badge>
                </div>
              )}

              {(product.reviewsCount ?? 0) > 0 && (
                <div className="mt-3">
                  <StarRatingDisplay
                    value={product.rating ?? 0}
                    count={product.reviewsCount}
                    size={14}
                  />
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-baseline gap-3 font-mono">
              {hasPromo && (
                <span className="text-sm line-through text-white/50">
                  {product.price} MAD
                </span>
              )}
              <span
                className="text-lg font-bold"
                style={{ color: hasPromo ? accent : '#ffffff' }}
              >
                {displayPrice} MAD
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function LiquidGlassProducts({
  products,
  accentColor,
  theme,
  shopSlug,
  isAuthenticated = false,
  favoriteIds = [],
}: ProductsTemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const accent = accentColor || theme.accent;

  // Contrôle de visibilité des indicateurs : uniquement dans ce composant
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setIsOverlayVisible(true),
        onLeave: () => setIsOverlayVisible(false),
        onEnterBack: () => setIsOverlayVisible(true),
        onLeaveBack: () => setIsOverlayVisible(false),
      });
    }, container);

    return () => ctx.revert();
  }, []);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative w-full bg-black">
      {/* Overlay UX actif UNIQUEMENT quand l'utilisateur survole la section produits */}
      <ScrollProgressOverlay
        current={activeStep}
        total={products.length}
        accent={accent}
        visible={isOverlayVisible}
      />

      {/* Sections produits */}
      {products.map((product, index) => (
        <MotionProductSection
          key={product._id}
          product={product}
          index={index}
          total={products.length}
          shopSlug={shopSlug}
          accent={accent}
          isFavorite={favoriteIds.includes(product._id)}
          isAuthenticated={isAuthenticated}
          isLast={index === products.length - 1}
          onActive={setActiveStep}
        />
      ))}
    </div>
  );
}