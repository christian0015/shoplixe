// components/heros/LiquidGlassHero.shaderbg.tsx
//
// VARIANTE 2 — "fond shader animé" (reactbits)
// Même panneau de verre que la variante 1, mais la matière à distordre
// derrière le verre est un fond shader animé plutôt qu'une photo — plus
// "signature", zéro dépendance à la qualité des images de la boutique.
//
// COMMENT CHOISIR : décommente UN SEUL bloc "BG OPTION" ci-dessous (et son
// import correspondant en haut du fichier), laisse les autres commentés.
// Les trois composants viennent de components/reactbits/ (déjà dans le repo
// via Beams). Rendu constaté (cf. brief) : Grainient et ColorBends sont les
// plus lisibles derrière le verre liquide ; LaserFlow est plus anisotrope
// et convient mieux à un thème "tech" à dominante sombre.
'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { HeaderTextPair, RatingItem, ShopLogoRing, WhatsAppCTA, VerifiedBadge } from './HeroChrome';
import { LoopRing } from './HeroSvgAccents';
import type { HeroProps } from './types';

// --- imports des fonds — garde uniquement celui que tu utilises actif ---
import Grainient from '@/components/reactbits/Grainient';
import LaserFlow from '@/components/reactbits/LaserFlow';
import ColorBends from '@/components/reactbits/ColorBends';

function ShaderBackdrop({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0 -z-1" style={{backgroundColor: 'black'}}>
        
        {/* <div style={{backgroundColor: "black", padding: 300, color: 'yellow', width:"500px",  height:"500px"}}>ssdsdsdsdsdsd</div> */}
      {/* ============== BG OPTION 1 — Grainient (4/5, retenu par défaut) ============== */}
      {/* <Grainient
        color1="#FF9FFC"
        color2="#1a0d52"
        color3="#B497CF"
        timeSpeed={1.9}
        colorBalance={0}
        warpStrength={1}
        warpFrequency={5}
        warpSpeed={2}
        warpAmplitude={50}
        blendAngle={0}
        blendSoftness={0.05}
        rotationAmount={500}
        noiseScale={2}
        grainAmount={0.1}
        grainScale={2}
        grainAnimated={false}
        contrast={1.5}
        gamma={1}
        saturation={1}
        centerX={0}
        centerY={0}
        zoom={0.9}
      /> */}

      {/* ============== BG OPTION 2 — LaserFlow (3.5/5, plus adapté thème tech/dark) ============== */}
      {/* <LaserFlow
        color="#FF79C6"
        wispDensity={0.9}
        flowSpeed={0.85}
        verticalSizing={4.5}
        horizontalSizing={1.4}
        fogIntensity={0.5}
        fogScale={0.25}
        wispSpeed={15}
        wispIntensity={12}
        flowStrength={0.1}
        decay={1.5}
        horizontalBeamOffset={0}
        verticalBeamOffset={-0.5}
      /> */}
     

      {/* ============== BG OPTION 3 — ColorBends (4/5, plus graphique/aplat) ============== */}
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
         pas être noyé, donc on garde ce voile beaucoup plus discret que sur un fond photo. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25 pointer-events-none" />
    </div>
  );
}

export function LiquidGlassHero({ shop, theme, accent, secondaryImage, waLink }: HeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const second = secondaryImage || shop.cover;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hdr-visual', { opacity: 0, scale: 1.06, duration: 1.1, ease: 'power2.out' });
      gsap.from('.hdr-text', { opacity: 0, y: 22, duration: 0.7, stagger: 0.08, ease: 'power3.out' });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative w-full min-h-[85svh] h-[100svh] md:h-[100svh] md:max-h-[900px] overflow-hidden flex items-center"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)', flexDirection: "row-reverse" }}
    >
      <ShaderBackdrop accent={accent} />

      <LoopRing color={accent} size={160} className="absolute top-6 right-6 opacity-70" />

      {second && (
        <div className="hdr-visual glass-card glass-card--strong hidden md:block absolute top-10 rigth-18 w-56 h-72 rounded-[28px] overflow-hidden">
          <Image src={second} alt="" fill className="object-cover" sizes="220px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      )}

      {/* Panneau de verre — identité de la boutique */}
      <div className="hdr-visual glass-card glass-card--strong w-full md:w-[560px] m-4 md:m-12 rounded-[32px] p-6 md:p-8">
        <div className="flex items-center gap-3 hdr-text">
          <ShopLogoRing logo={shop.logo} name={shop.name} ringColor="rgba(255,255,255,0.3)" bg="rgba(255,255,255,0.1)" size={56} />
          {shop.isVerified && <VerifiedBadge theme={theme} />}
        </div>

        <HeaderTextPair small="Boutique en ligne" big={shop.name} color="#fff" mutedColor="rgba(255,255,255,0.65)" size="xl" className="hdr-text mt-3" />

        {shop.description && (
          <p className="hdr-text text-sm mt-2 max-w-md" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {shop.description}
          </p>
        )}

        <div className="hdr-text flex items-center gap-4 flex-wrap mt-4">
          {(shop.reviewsCount ?? 0) > 0 && (
            <div className="flex gap-4">
              <RatingItem label="Service" value={shop.serviceRating ?? 0} muted="rgba(255,255,255,0.6)" />
              <RatingItem label="Communication" value={shop.communicationRating ?? 0} muted="rgba(255,255,255,0.6)" />
            </div>
          )}
          <WhatsAppCTA waLink={waLink} accent={accent} className="hidden md:inline-flex ml-auto" />
        </div>
      </div>
    </div>
  );
}