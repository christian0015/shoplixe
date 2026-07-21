// components/ProductsTemplates/Flux3DProducts.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
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

// Le canvas r3f ne doit jamais être rendu côté serveur.
const Scene = dynamic(() => import('./flux3d/Scene'), { ssr: false });

const DEPTH_STEP = 3.6;

/** Cartel DOM superposé — vraie info produit, positionné chaque frame via projection caméra. */
function Caption({
  product,
  shopSlug,
  accent,
  isFavorite,
  isAuthenticated,
  setRef,
}: {
  product: ProductCardData;
  shopSlug: string;
  accent: string;
  isFavorite: boolean;
  isAuthenticated: boolean;
  setRef: (el: HTMLDivElement | null) => void;
}) {
  const displayPrice = product.promoPrice ?? product.price;
  const hasPromo = typeof product.promoPrice === 'number' && product.promoPrice < product.price;

  return (
    <div
      ref={setRef}
      className="absolute top-0 left-0 flex flex-col items-center pointer-events-none will-change-transform"
      style={{ transform: 'translate3d(-50%, 40px, 0)' }}
    >
      <div className="pointer-events-auto flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2">
          <FavoriteButton type="product" id={product._id} initialActive={isFavorite} isAuthenticated={isAuthenticated} />
          {!product.available && <Badge variant="sold-out">Épuisé</Badge>}
        </div>
        <Link href={`/${shopSlug}/${product.slug}`} className="flex flex-col items-center gap-1.5">
          <p className="font-display font-bold text-sm md:text-base text-white drop-shadow-sm max-w-[220px] truncate">
            {product.name}
          </p>
          {(product.reviewsCount ?? 0) > 0 && <StarRatingDisplay value={product.rating ?? 0} count={product.reviewsCount} size={11} />}
          <div className="flex items-baseline gap-2 font-mono">
            {hasPromo && (
              <span className="text-[11px] line-through" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {product.price} MAD
              </span>
            )}
            <span className="text-sm font-semibold" style={{ color: hasPromo ? accent : '#fff' }}>
              {displayPrice} MAD
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

/** Repli mobile — pas de scène 3D pilotée au scroll (coût/UX), mais un cartel façon musée qui garde l'esprit "vitrine" du hero. */
function MobileFallback({ products, theme, accent, shopSlug, isAuthenticated, favoriteIds }: ProductsTemplateProps) {
  return (
    <div className="md:hidden flex flex-col gap-8 px-1 py-4">
      {products.map((p, i) => {
        const displayPrice = p.promoPrice ?? p.price;
        const hasPromo = typeof p.promoPrice === 'number' && p.promoPrice < p.price;
        return (
          <Link
            key={p._id}
            href={`/${shopSlug}/${p.slug}`}
            className="relative flex flex-col gap-3 rounded-[24px] overflow-hidden p-3"
            style={{ backgroundColor: '#0C0E12', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="relative h-64 rounded-2xl overflow-hidden" style={{ backgroundColor: '#050608' }}>
              {p.images[0] && <Image src={p.images[0]} alt={p.name} fill className="object-contain" sizes="92vw" />}
              <span
                className="absolute bottom-2 left-2 text-[9px] font-mono tracking-[0.16em] uppercase px-2 py-1 rounded-sm"
                style={{ backgroundColor: 'rgba(5,6,8,0.6)', color: 'rgba(255,255,255,0.7)' }}
              >
                Pièce N°{String(i + 1).padStart(3, '0')}
              </span>
              <div className="absolute top-2 right-2">
                <FavoriteButton type="product" id={p._id} initialActive={favoriteIds?.includes(p._id) ?? false} isAuthenticated={isAuthenticated} />
              </div>
            </div>
            <div className="flex items-center justify-between px-1">
              <p className="font-display font-bold text-sm text-white truncate">{p.name}</p>
              <div className="flex items-baseline gap-2 font-mono shrink-0">
                {hasPromo && (
                  <span className="text-[11px] line-through" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {p.price}
                  </span>
                )}
                <span className="text-sm font-semibold" style={{ color: hasPromo ? accent : '#fff' }}>
                  {displayPrice} MAD
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function Flux3DProducts(props: ProductsTemplateProps) {
  const { products, theme, accentColor, shopSlug, isAuthenticated = false, favoriteIds = [] } = props;
  const accent = accentColor || theme.accent;
  const sectionRef = useRef<HTMLDivElement>(null);
  const captionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  const positions: PlanePosition[] = useMemo(
    () =>
      products.map((_, i) => ({
        x: (i % 2 === 0 ? 1 : -1) * 1.1,
        y: Math.sin(i * 0.9) * 0.32,
        z: -i * DEPTH_STEP,
        rotY: (i % 2 === 0 ? -1 : 1) * 0.16,
      })),
    [products]
  );

  const sceneItems: SceneProduct[] = useMemo(
    () => products.map((p) => ({ id: p._id, image: p.images[0] ?? null, href: `/${shopSlug}/${p.slug}` })),
    [products, shopSlug]
  );

  useEffect(() => {
    if (window.matchMedia('(max-width: 767px)').matches || products.length === 0) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: () => `+=${Math.max(products.length - 1, 1) * window.innerHeight * 0.95}`,
        pin: true,
        scrub: 0.7,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          const idx = Math.round(self.progress * (products.length - 1));
          if (idx !== activeIndexRef.current) {
            activeIndexRef.current = idx;
            setActiveIndex(idx);
          }
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [products.length]);

  const handleProject = (index: number, sx: number, sy: number, visible: boolean, scale: number) => {
    const el = captionRefs.current[index];
    if (!el) return;
    el.style.opacity = visible ? String(Math.max(scale, 0.15)) : '0';
    el.style.transform = `translate3d(${sx - el.offsetWidth / 2}px, ${sy + 34}px, 0) scale(${0.85 + scale * 0.15})`;
  };

  return (
    <>
      {/* ---------- DESKTOP : scène 3D pilotée au scroll ---------- */}
      <div ref={sectionRef} className="hidden md:block relative h-screen overflow-hidden rounded-[28px]" style={{ backgroundColor: '#050608' }}>
        {products.length > 0 && (
          <Scene items={sceneItems} positions={positions} bg="#050608" accent={accent} progressRef={progressRef} onProject={handleProject} />
        )}

        {/* Cartels DOM superposés, projetés depuis la scène 3D */}
        <div className="absolute inset-0 pointer-events-none">
          {products.map((p, i) => (
            <Caption
              key={p._id}
              product={p}
              shopSlug={shopSlug}
              accent={accent}
              isFavorite={favoriteIds.includes(p._id)}
              isAuthenticated={isAuthenticated}
              setRef={(el) => {
                captionRefs.current[i] = el;
              }}
            />
          ))}
        </div>

        {/* Bandeau repère — écho du Flux3DHero */}
        <div className="absolute top-6 left-8 right-8 z-10 flex items-center justify-between pointer-events-none">
          <span className="text-[9px] tracking-[0.24em] uppercase font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Reveal 3D — Galerie
          </span>
          <span className="text-[9px] tracking-[0.24em] uppercase font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {String(activeIndex + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* ---------- MOBILE : repli vitrine 2D ---------- */}
      <MobileFallback {...props} />
    </>
  );
}