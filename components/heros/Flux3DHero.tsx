// components/heros/Flux3DHero.tsx
'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import Beams from '@/components/reactbits/Beams';
import { RatingItem, ShopLogoRing, WhatsAppCTA, VerifiedBadge } from './HeroChrome';
import type { HeroProps } from './types';

// Le canvas WebGL de la déformation ne doit jamais être rendu côté serveur.
const FluxImagePlane = dynamic(() => import('./FluxImagePlane').then((m) => m.FluxImagePlane), {
  ssr: false,
});

export function Flux3DHero({ shop, theme, accent, secondaryImage, waLink }: HeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const heroImage = secondaryImage || shop.cover;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hdr-text', { opacity: 0, y: 24, duration: 0.8, stagger: 0.08, ease: 'power3.out' });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // Parallax souris subtil sur le bloc de texte (desktop uniquement) — l'image
  // 3D gère déjà sa propre réaction au curseur via son shader.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(max-width: 767px)').matches) return;
    const moveX = gsap.quickTo(textRef.current, 'x', { duration: 0.7, ease: 'power3.out' });
    const moveY = gsap.quickTo(textRef.current, 'y', { duration: 0.7, ease: 'power3.out' });
    const onMove = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      moveX(relX * 14);
      moveY(relY * 10);
    };
    root.addEventListener('mousemove', onMove);
    return () => root.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative w-full min-h-[85svh] md:h-[100svh] md:max-h-[900px] overflow-hidden flex flex-col md:flex-row items-center"
      style={{ background: '#050608', paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}
    >
      <div className="absolute inset-0">
        <Beams beamWidth={0.6} beamHeight={20} beamNumber={26} lightColor={accent} speed={4.5} noiseIntensity={1.4} scale={0.22} rotation={8} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 pointer-events-none" />

      {/* Pièce centrale — le mesh-image qui se déforme sous le curseur */}
      <div className="relative w-full md:w-1/2 h-[42svh] md:h-full order-1 md:order-2">
        {heroImage && <FluxImagePlane image={heroImage} />}
        {!heroImage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Aucune image de couverture
            </span>
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: 'radial-gradient(60% 55% at 50% 50%, transparent 40%, #050608 100%)' }}
        />
      </div>

      <div ref={textRef} className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left gap-5 px-6 md:px-14 order-2 md:order-1 w-full md:w-1/2 pb-8 md:pb-0">
        <ShopLogoRing logo={shop.logo} name={shop.name} ringColor="rgba(255,255,255,0.25)" bg="rgba(255,255,255,0.08)" size={60} />

        <div className="hdr-text flex flex-col items-center md:items-start gap-2">
          {shop.isVerified && <VerifiedBadge theme={theme} />}
          <h1 className="font-display font-extrabold text-[13vw] md:text-6xl lg:text-7xl leading-[0.92]" style={{ color: '#fff' }}>
            {shop.name}
          </h1>
        </div>

        {shop.description && (
          <p className="hdr-text max-w-md text-sm md:text-base" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {shop.description}
          </p>
        )}

        {(shop.reviewsCount ?? 0) > 0 && (
          <div className="hdr-text flex gap-6">
            <RatingItem label="Service" value={shop.serviceRating ?? 0} muted="rgba(255,255,255,0.6)" />
            <RatingItem label="Communication" value={shop.communicationRating ?? 0} muted="rgba(255,255,255,0.6)" />
            <RatingItem label="Fiabilité" value={shop.reliabilityRating ?? 0} muted="rgba(255,255,255,0.6)" />
          </div>
        )}

        <WhatsAppCTA waLink={waLink} accent={accent} className="hdr-text mt-1 hidden md:inline-flex" />
      </div>
    </div>
  );
}