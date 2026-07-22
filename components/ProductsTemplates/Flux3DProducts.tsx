'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { Badge } from '@/components/ui';
import { FavoriteButton } from '@/components/FavoriteButton';
import { StarRatingDisplay } from '@/components/StarRating';
import type { ProductCardData } from '@/components/ProductCard';
import type { ProductsTemplateProps } from './types';
import type { PlanePosition, SceneProduct } from './flux3d/Scene';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const Scene = dynamic(() => import('./flux3d/Scene'), { ssr: false });

const FRAME_COLOR = '#0b0d12';
const DEPTH_STEP_DESKTOP = 3.6;
const DEPTH_STEP_MOBILE = 2.8;

function Caption({
  product,
  shopSlug,
  accent,
  isFavorite,
  isAuthenticated,
  compact,
  setRef,
}: {
  product: ProductCardData;
  shopSlug: string;
  accent: string;
  isFavorite: boolean;
  isAuthenticated: boolean;
  compact: boolean;
  setRef: (el: HTMLDivElement | null) => void;
}) {
  const displayPrice = product.promoPrice ?? product.price;
  const hasPromo = typeof product.promoPrice === 'number' && product.promoPrice < product.price;

  return (
    <div
      ref={setRef}
      className="absolute top-0 left-0 flex flex-col items-center will-change-transform transition-opacity duration-300 ease-out"
      style={{ transform: 'translate3d(-50%, 40px, 0)', opacity: 0, pointerEvents: 'none' }}
    >
      <div className="flex flex-col items-center gap-1.5 md:gap-2 text-center">
        <div className="flex items-center gap-2">
          <FavoriteButton type="product" id={product._id} initialActive={isFavorite} isAuthenticated={isAuthenticated} />
          {!product.available && <Badge variant="sold-out">Épuisé</Badge>}
        </div>
        <Link href={`/${shopSlug}/${product.slug}`} className="flex flex-col items-center gap-1 md:gap-1.5">
          <p
            className={`font-display font-bold truncate ${compact ? 'text-xs max-w-[150px]' : 'text-sm md:text-base max-w-[220px]'}`}
            style={{ color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
          >
            {product.name}
          </p>
          {(product.reviewsCount ?? 0) > 0 && (
            <StarRatingDisplay value={product.rating ?? 0} count={product.reviewsCount} size={compact ? 10 : 11} />
          )}
          <div className="flex items-baseline gap-2 font-mono">
            {hasPromo && (
              <span className={compact ? 'text-[10px] line-through' : 'text-[11px] line-through'} style={{ color: 'rgba(255,255,255,0.55)' }}>
                {product.price} MAD
              </span>
            )}
            <span className={compact ? 'text-xs font-semibold' : 'text-sm font-semibold'} style={{ color: hasPromo ? accent : '#fff' }}>
              {displayPrice} MAD
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

export function Flux3DProducts({
  products,
  theme,
  accentColor,
  shopSlug,
  isAuthenticated = false,
  favoriteIds = [],
}: ProductsTemplateProps) {
  const accent = accentColor || theme.accent;
  const sectionRef = useRef<HTMLDivElement>(null);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const positions: PlanePosition[] = useMemo(
    () =>
      products.map((_, i) => ({
        x: (i % 2 === 0 ? 1 : -1) * (isMobile ? 0.42 : 1.1),
        y: Math.sin(i * 0.9) * (isMobile ? 0.16 : 0.32),
        z: -i * (isMobile ? DEPTH_STEP_MOBILE : DEPTH_STEP_DESKTOP),
        rotY: (i % 2 === 0 ? -1 : 1) * (isMobile ? 0.22 : 0.16),
      })),
    [products, isMobile]
  );

  const sceneItems: SceneProduct[] = useMemo(
    () => products.map((p) => ({ id: p._id, image: p.images[0] ?? null, href: `/${shopSlug}/${p.slug}` })),
    [products, shopSlug]
  );

  useEffect(() => {
    if (products.length === 0) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: () => `+=${Math.max(products.length - 1, 1) * window.innerHeight * (isMobile ? 0.95 : 1.05)}`,
        pin: true,
        scrub: 0.7,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          // Mise à jour directe de la jauge de défilement verticale
          if (progressBarRef.current) {
            progressBarRef.current.style.height = `${Math.min(self.progress * 100, 100)}%`;
          }
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [products.length, isMobile]);

  const handleActiveIndexChange = (idx: number) => {
    activeIndexRef.current = idx;
    setActiveIndex(idx);
  };

  const handleProject = (index: number, sx: number, sy: number, visible: boolean, focus: number) => {
    const el = captionRefs.current[index];
    if (!el) return;

    const shown = visible && focus > 0.05;

    el.style.opacity = shown ? String(focus) : '0';
    el.style.pointerEvents = shown && focus > 0.4 ? 'auto' : 'none';

    const scale = 0.85 + Math.min(focus, 1) * 0.15;
    el.style.transform = `translate3d(${sx - el.offsetWidth / 2}px, ${sy + (isMobile ? 20 : 34)}px, 0) scale(${scale})`;
  };

  return (
    <div
      ref={sectionRef}
      className="relative h-screen overflow-hidden rounded-[22px] md:rounded-[28px]"
      style={{
        background: `linear-gradient(160deg, #06070b 0%, ${accent}26 48%, #0b0d12 100%)`,
      }}
    >
      {products.length > 0 && (
        <Scene
          items={sceneItems}
          positions={positions}
          frameColor={FRAME_COLOR}
          accent={accent}
          mobile={isMobile}
          progressRef={progressRef}
          onProject={handleProject}
          onActiveIndexChange={handleActiveIndexChange}
        />
      )}

      <div className="absolute inset-0">
        {products.map((p, i) => (
          <Caption
            key={p._id}
            product={p}
            shopSlug={shopSlug}
            accent={accent}
            isFavorite={favoriteIds.includes(p._id)}
            isAuthenticated={isAuthenticated}
            compact={isMobile}
            setRef={(el) => {
              captionRefs.current[i] = el;
            }}
          />
        ))}
      </div>

      {/* Header Info */}
      <div className="absolute top-4 md:top-6 left-4 md:left-8 right-4 md:right-8 z-10 flex items-center justify-between pointer-events-none">
        <span className="text-[8px] md:text-[9px] tracking-[0.2em] md:tracking-[0.24em] uppercase font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Reveal 3D — Galerie
        </span>
        <span className="text-[8px] md:text-[9px] tracking-[0.2em] md:tracking-[0.24em] uppercase font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {String(activeIndex + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}
        </span>
      </div>

      {/* Indicateur UX de Scroll Gauche (Jauge + Texte + Flèche) */}
      <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-3 pointer-events-none">
        <span
          className="text-[8px] tracking-[0.2em] uppercase font-mono select-none"
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          Scroll Down
        </span>

        {/* Rail de la jauge */}
        <div className="w-[2px] h-16 md:h-24 bg-white/10 rounded-full overflow-hidden relative">
          {/* Barre active (couleur accent) */}
          <div
            ref={progressBarRef}
            className="w-full bg-current transition-all duration-75 ease-out rounded-full"
            style={{ color: accent, height: '0%' }}
          />
        </div>

        {/* Flèche animée */}
        <svg
          className="w-3 h-3 text-white/40 animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
}