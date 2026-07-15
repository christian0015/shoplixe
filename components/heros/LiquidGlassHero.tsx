// components/heros/LiquidGlassHero.shaderbg.tsx
//
// VARIANTE 2 — "fond shader animé" (reactbits)
// La matière à distordre derrière le verre est un fond shader animé
// (ColorBends). Rendu constaté (cf. brief) : Grainient et ColorBends sont
// les plus lisibles derrière le verre liquide ; LaserFlow est plus
// anisotrope et convient mieux à un thème "tech" à dominante sombre.
//
// DIRECTION — au lieu d'un unique panneau de verre centré, l'identité de
// la boutique est éclatée en plusieurs surfaces de verre indépendantes,
// dispersées aux quatre coins de la page : puce d'identité, panneau-titre
// incliné, cadre-image, cartel de notes, CTA flottant. Plus il y a de
// verre à l'écran, plus l'effet de distorsion liquide se lit — un mot
// géant en filigrane, placé derrière les panneaux, se déforme visuellement
// sous le flou du verre.
'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { HeaderTextPair, RatingItem, ShopLogoRing, WhatsAppCTA, VerifiedBadge } from './HeroChrome';
import { LoopRing, FloatingBlob } from './HeroSvgAccents';
import type { HeroProps } from './types';

// --- import du fond — garde uniquement celui que tu utilises actif ---
// import Grainient from '@/components/reactbits/Grainient';
// import LaserFlow from '@/components/reactbits/LaserFlow';
import ColorBends from '@/components/reactbits/ColorBends';

function ShaderBackdrop() {
  return (
    <div className="absolute inset-0 -z-1" style={{ backgroundColor: 'black' }}>
      <ColorBends
        rotation={90}
        speed={0.2}
        colors={['#3d17d7', '#3a0839', '#624f18']}
        transparent={false}
        autoRotate={0}
        scale={1}
        frequency={1}
        warpStrength={1}
        mouseInfluence={1}
        parallax={0.5}
        noise={0.15}
        iterations={1}
        intensity={1.5}
        bandWidth={6}
      />
      {/* Voile de lisibilité léger — le shader doit rester la matière visible sous le verre,
         pas être noyé, donc ce voile reste plus discret que sur un fond photo. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25 pointer-events-none" />
    </div>
  );
}

export function LiquidGlassHero({ shop, theme, accent, secondaryImage, waLink }: HeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const second = secondaryImage || shop.cover;
  const meta = [shop.district, shop.city].filter(Boolean).join(' — ');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hdr-visual', { opacity: 0, scale: 0.94, duration: 1, stagger: 0.1, ease: 'power2.out' });
      gsap.from('.hdr-text', { opacity: 0, y: 18, duration: 0.7, stagger: 0.06, ease: 'power3.out' });
      gsap.from('.hdr-word', { opacity: 0, duration: 1.6, ease: 'power1.out' });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative w-full overflow-hidden flex flex-col gap-4 px-5 pb-8 min-h-[88svh] md:block md:min-h-0 md:h-[100svh] md:max-h-[960px] md:px-0 md:pb-0"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}
    >
      <ShaderBackdrop />

      {/* Mot géant en filigrane — texture typographique que le flou du verre vient distordre */}
      <span
        className="hdr-word hidden md:block absolute top-[6%] left-[6%] font-display font-extrabold uppercase select-none pointer-events-none"
        style={{ fontSize: '11vw', color: 'rgba(255,255,255,0.07)', letterSpacing: '-0.02em', transform: 'rotate(-4deg)' }}
      >
        {shop.name}
      </span>

      <FloatingBlob color={accent} size={420} className="hidden md:block absolute -bottom-24 -left-20 opacity-40" />
      <LoopRing color={accent} size={150} className="absolute top-6 right-6 md:top-10 md:right-10 opacity-70" />

      {/* Puce d'identité — verre indépendant, coin haut gauche */}
      <div className="hdr-visual glass-card flex items-center gap-3 rounded-full pl-2 pr-4 py-2 z-20 w-fit md:absolute md:top-10 md:left-10">
        <ShopLogoRing logo={shop.logo} name={shop.name} ringColor="rgba(255,255,255,0.3)" bg="rgba(255,255,255,0.1)" size={40} />
        <div className="hdr-text flex flex-col">
          <span className="text-[9px] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Boutique en ligne
          </span>
          {shop.isVerified && <VerifiedBadge theme={theme} />}
        </div>
      </div>

      {/* Panneau-titre — verre indépendant, légèrement incliné, flotte au centre gauche */}
      <div className="hdr-visual glass-card glass-card--strong rounded-[28px] p-6 md:p-7 z-20 md:absolute md:top-[24%] md:left-10 md:w-[600px] md:[transform:rotate(-1.2deg)]">
        <HeaderTextPair
          small={meta || 'Maroc'}
          big={shop.name}
          color="#fff"
          mutedColor="rgba(255,255,255,0.6)"
          size="xl"
          className="hdr-text"
        />
      </div>

      {/* Cadre-image — grand panneau de verre, décalé à droite, incliné dans l'autre sens */}
      {second && (
        <div className="hdr-visual glass-card glass-card--strong hidden md:block absolute top-[35%] left-[50%] w-80 h-80 rounded-[28px] overflow-hidden -z-121 md:[transform:rotate(2deg)]">
          <Image src={second} alt="" fill className="object-cover" sizes="360px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        </div>
      )}

      {/* Cartel de notes — verre indépendant, bas gauche, loin du panneau-titre */}
      <div className="hdr-visual glass-card rounded-3xl p-5 md:p-6 z-20 md:absolute md:bottom-14 md:left-10 md:w-[380px]">
        {shop.description && (
          <p className="hdr-text text-sm mb-4" style={{ color: 'rgba(255,255,255,0.78)' }}>
            {shop.description}
          </p>
        )}
        {(shop.reviewsCount ?? 0) > 0 && (
          <div className="hdr-text flex gap-5 flex-wrap">
            <RatingItem label="Service" value={shop.serviceRating ?? 0} muted="rgba(255,255,255,0.55)" />
            <RatingItem label="Communication" value={shop.communicationRating ?? 0} muted="rgba(255,255,255,0.55)" />
            <RatingItem label="Fiabilité" value={shop.reliabilityRating ?? 0} muted="rgba(255,255,255,0.55)" />
          </div>
        )}
      </div>

      {/* CTA — flotte seul, bas droite, opposé au cartel de notes */}
      <WhatsAppCTA
        waLink={waLink}
        accent={accent}
        className="hdr-visual hidden md:inline-flex md:absolute md:bottom-14 md:right-14 z-20"
      />
    </div>
  );
}