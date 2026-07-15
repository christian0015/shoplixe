// components/heros/GridHero.tsx
'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { RatingItem, ShopLogoRing, WhatsAppCTA, VerifiedBadge } from './HeroChrome';
import { LoopRing } from './HeroSvgAccents';
import type { HeroProps } from './types';

// ============================================================
// GridHero — direction "atelier de design" : grille technique
// visible (comme un plan de graphiste), tuiles carrées tracées
// à la règle, repères de coin façon outil de dessin, ticker
// d'identité en boucle. L'espace est plein, jamais du vide
// "marketplace" — chaque zone porte une info ou un repère.
// ============================================================

function CornerTick({ label, corner }: { label: string; corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const pos =
    corner === 'tl'
      ? 'top-4 left-4 md:top-6 md:left-6 items-start'
      : corner === 'tr'
      ? 'top-4 right-4 md:top-6 md:right-6 items-end text-right'
      : corner === 'bl'
      ? 'bottom-4 left-4 md:bottom-6 md:left-6 items-start'
      : 'bottom-4 right-4 md:bottom-6 md:right-6 items-end text-right';
  return (
    <div className={`absolute z-20 flex flex-col gap-1 ${pos}`}>
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="opacity-70">
        <path d="M7 0V14M0 7H14" stroke="currentColor" strokeWidth="1" />
      </svg>
      <span className="text-[9px] tracking-[0.18em] uppercase font-mono opacity-50 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

function GridOverlay({ color }: { color: string }) {
  const cols = 12;
  const rows = 7;
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.35]"
      preserveAspectRatio="none"
      viewBox="0 0 1200 700"
      aria-hidden
    >
      {Array.from({ length: cols + 1 }).map((_, i) => (
        <line key={`v${i}`} x1={(1200 / cols) * i} y1="0" x2={(1200 / cols) * i} y2="700" stroke={color} strokeWidth="0.5" />
      ))}
      {Array.from({ length: rows + 1 }).map((_, i) => (
        <line key={`h${i}`} x1="0" y1={(700 / rows) * i} x2="1200" y2={(700 / rows) * i} stroke={color} strokeWidth="0.5" />
      ))}
    </svg>
  );
}

function Marquee({ text, color, bg }: { text: string; color: string; bg: string }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const tween = gsap.to(el, { xPercent: -50, duration: 18, ease: 'none', repeat: -1 });
    return () => {
      tween.kill();
    };
  }, []);

  const item = (
    <span className="inline-flex items-center gap-3 px-6 text-[11px] md:text-xs tracking-[0.22em] uppercase font-mono shrink-0">
      {text}
      <span style={{ color }} aria-hidden>
        ✕
      </span>
    </span>
  );

  return (
    <div className="w-full overflow-hidden border-t border-b py-2.5" style={{ borderColor: `${color}33`, backgroundColor: bg }}>
      <div ref={trackRef} className="flex w-max whitespace-nowrap" style={{ color }}>
        {item}
        {item}
        {item}
        {item}
      </div>
    </div>
  );
}

/** Tuile carrée tracée à la règle — image si dispo, sinon plan de composition vide numéroté. */
function SquareTile({
  index,
  image,
  size,
  rotate = 0,
  border,
  bg,
  filled = true,
}: {
  index: string;
  image?: string | null;
  size: number;
  rotate?: number;
  border: string;
  bg: string;
  filled?: boolean;
}) {
  return (
    <div
      className="tile relative shrink-0 border overflow-hidden"
      style={{ width: size, height: size, borderColor: border, backgroundColor: bg, transform: `rotate(${rotate}deg)` }}
    >
      {image && filled ? (
        <Image src={image} alt="" fill className="object-cover" sizes="240px" />
      ) : (
        <>
          <svg className="absolute inset-0 w-full h-full opacity-40" aria-hidden>
            <line x1="0" y1="0" x2="100%" y2="100%" stroke={border} strokeWidth="1" />
            <line x1="100%" y1="0" x2="0" y2="100%" stroke={border} strokeWidth="1" />
          </svg>
        </>
      )}
      <span
        className="absolute bottom-1.5 left-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded-sm"
        style={{ color: image ? '#fff' : border, backgroundColor: image ? 'rgba(0,0,0,0.35)' : 'transparent' }}
      >
        {index}
      </span>
    </div>
  );
}

export function GridHero({ shop, theme, accent, secondaryImage, waLink }: HeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const composeRef = useRef<HTMLDivElement>(null);
  const cover = shop.cover;
  const second = secondaryImage || shop.cover;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hdr-text', { y: 20, opacity: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out' });
      gsap.from('.tile', {
        opacity: 0,
        scale: 0.8,
        duration: 0.6,
        stagger: 0.06,
        ease: 'back.out(1.6)',
        delay: 0.15,
      });
      gsap.from('.gridline', { opacity: 0, duration: 1.1, ease: 'power1.out' });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // Léger parallax des tuiles au mouvement de la souris — desktop seulement.
  useEffect(() => {
    const root = rootRef.current;
    const compose = composeRef.current;
    if (!root || !compose || window.matchMedia('(max-width: 767px)').matches) return;
    const tiles = compose.querySelectorAll<HTMLElement>('.tile');
    const movers = Array.from(tiles).map((t, i) =>
      gsap.quickTo(t, 'y', { duration: 0.6, ease: 'power3.out' })
    );
    const onMove = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      movers.forEach((m, i) => m(relY * (10 + i * 4)));
    };
    root.addEventListener('mousemove', onMove);
    return () => root.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative w-full min-h-[92svh] md:h-[100svh] md:max-h-[960px] overflow-hidden flex flex-col"
      style={{ background: theme.bg, paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}
    >
      <div className="gridline absolute inset-0" style={{ color: theme.textMuted }}>
        <GridOverlay color={theme.textMuted} />
      </div>

      <CornerTick label="VITRINE / 01" corner="tl" />
      <CornerTick label={`ÉCH. 1:1`} corner="tr" />
      <CornerTick label={[shop.district, shop.city].filter(Boolean).join(' — ') || 'MAROC'} corner="bl" />
      <CornerTick label="SCROLL ↓" corner="br" />

      <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center md:items-stretch px-5 md:px-14 gap-10 md:gap-6 pt-16 pb-8 md:py-0">
        {/* Colonne texte */}
        <div className="flex-1 flex flex-col justify-center gap-5 md:gap-6 min-w-0">
          <div className="hdr-text flex items-center gap-3">
            <ShopLogoRing logo={shop.logo} name={shop.name} ringColor={theme.bg} bg={theme.surface} size={52} />
            {shop.isVerified && <VerifiedBadge theme={theme} />}
          </div>

          <h1
            className="hdr-text font-display font-extrabold leading-[0.9] text-[15vw] md:text-[6.2vw] lg:text-8xl tracking-tight"
            style={{ color: theme.text }}
          >
            {shop.name}
          </h1>

          {shop.description && (
            <p className="hdr-text max-w-md text-sm md:text-base leading-relaxed" style={{ color: theme.textMuted }}>
              {shop.description}
            </p>
          )}

          {(shop.reviewsCount ?? 0) > 0 && (
            <div className="hdr-text flex gap-6">
              <RatingItem label="Service" value={shop.serviceRating ?? 0} muted={theme.textMuted} />
              <RatingItem label="Communication" value={shop.communicationRating ?? 0} muted={theme.textMuted} />
              <RatingItem label="Fiabilité" value={shop.reliabilityRating ?? 0} muted={theme.textMuted} />
            </div>
          )}

          <WhatsAppCTA waLink={waLink} accent={accent} className="hdr-text mt-1 w-fit hidden md:inline-flex" />
        </div>

        {/* Colonne composition — grille de carrés tracés, empilement asymétrique */}
        <div ref={composeRef} className="relative flex-1 w-full flex items-center justify-center md:justify-end min-h-[260px]">
          <LoopRing color={accent} size={130} className="absolute -top-2 left-2 md:top-6 md:left-0 opacity-70" />

          <div className="relative flex items-end gap-3 md:gap-4">
            <div className="flex flex-col gap-3 md:gap-4">
              <SquareTile index="A" image={cover} size={120} border={theme.border} bg={theme.surface} rotate={-2} />
              <SquareTile index="B" size={72} border={theme.border} bg={theme.surface} filled={false} rotate={3} />
            </div>
            <div className="flex flex-col gap-3 md:gap-4 -mb-8 md:-mb-10">
              <SquareTile index="C" image={second} size={168} border={accent} bg={theme.surface} rotate={1.5} />
            </div>
            <div className="hidden sm:flex flex-col gap-3 md:gap-4 mt-6">
              <SquareTile index="D" size={64} border={theme.border} bg={theme.surface} filled={false} rotate={-4} />
              <SquareTile index="E" image={cover} size={96} border={theme.border} bg={theme.surface} rotate={2} />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <Marquee
          text={`${shop.name} • ${[shop.district, shop.city].filter(Boolean).join(', ') || 'Livraison locale'} • Commande sur WhatsApp`}
          color={accent}
          bg={theme.surface}
        />
      </div>

      <a
        href={waLink}
        target="_blank"
        rel="noreferrer"
        className="hdr-text md:hidden mx-5 my-4 inline-flex items-center justify-center gap-2 py-3 rounded-2xl font-medium text-white relative z-10"
        style={{ backgroundColor: accent }}
      >
        Commander sur WhatsApp
      </a>
    </div>
  );
}