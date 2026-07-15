// components/heros/Flux3DHero.tsx
'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import Beams from '@/components/reactbits/Beams';
import { RatingItem, ShopLogoRing, WhatsAppCTA, VerifiedBadge } from './HeroChrome';
import { ScrollUnderline } from './HeroSvgAccents';
import type { HeroProps } from './types';

// Le canvas WebGL de la déformation ne doit jamais être rendu côté serveur.
const FluxImagePlane = dynamic(() => import('./FluxImagePlane').then((m) => m.FluxImagePlane), {
  ssr: false,
});

// ============================================================
// Flux3DHero — direction "reveal de galerie" : la pièce (image
// déformable) est présentée en vitrine, décalée, jamais centrée.
// Le nom de la boutique devient un titre-affiche géant qui
// chevauche la pièce, et l'information (description, notes, CTA)
// est dispersée aux quatre coins comme des cartels de musée —
// l'espace négatif fait partie de la composition, rien n'est
// confiné dans un bloc central.
// ============================================================

export function Flux3DHero({ shop, theme, accent, secondaryImage, waLink }: HeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const heroImage = secondaryImage || shop.cover;
  const meta = [shop.district, shop.city].filter(Boolean).join(' — ');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hdr-text', { opacity: 0, y: 26, duration: 0.9, stagger: 0.08, ease: 'power3.out' });
      gsap.from('.hdr-plane', { opacity: 0, scale: 0.92, duration: 1.15, delay: 0.15, ease: 'power2.out' });
      gsap.from('.hdr-watermark', { opacity: 0, x: -36, duration: 1.3, ease: 'power3.out' });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // Parallax en plusieurs plans — le titre, la pièce et les cartels
  // d'info réagissent chacun à une intensité différente pour donner
  // une vraie sensation de profondeur (desktop uniquement).
  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(max-width: 767px)').matches) return;
    const moveTitle = gsap.quickTo(titleRef.current, 'x', { duration: 0.8, ease: 'power3.out' });
    const movePlane = gsap.quickTo(planeRef.current, 'y', { duration: 0.7, ease: 'power3.out' });
    const moveInfo = gsap.quickTo(infoRef.current, 'y', { duration: 0.9, ease: 'power3.out' });
    const onMove = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      moveTitle(relX * 18);
      movePlane(relY * 14);
      moveInfo(relY * -10);
    };
    root.addEventListener('mousemove', onMove);
    return () => root.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative w-full min-h-[94svh] md:h-[100svh] md:max-h-[980px] overflow-hidden flex flex-col"
      style={{ background: '#050608', paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}
    >
      <div className="absolute inset-0">
        <Beams beamWidth={0.6} beamHeight={20} beamNumber={26} lightColor={accent} speed={4.5} noiseIntensity={1.4} scale={0.22} rotation={8} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none" />

      {/* Bandeau d'identité — pleine largeur, jamais confiné dans le bloc de contenu */}
      <div className="hdr-text relative z-20 flex items-center justify-between px-5 md:px-14 pt-16 md:pt-10">
        <div></div>
        
        <span
          className="hidden md:inline-block text-[10px] tracking-[0.28em] uppercase font-mono"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          Reveal 3D — Pièce en vitrine
        </span>
      </div>

      <div className="absolute flex items-center gap-3 left-[85%] md:left-[45%] pt-[35%] md:pt-[20%]">
          <ShopLogoRing logo={shop.logo} name={shop.name} ringColor="rgba(255,255,255,0.25)" bg="rgba(255,255,255,0.08)" size={52} />
          {shop.isVerified && <VerifiedBadge theme={theme} />}
        </div>

      {/* Zone de composition libre */}
      <div className="relative z-10 flex-1 px-5 md:px-14 pb-6">
        {/* Titre-affiche géant, ancré en haut à gauche, chevauché par la pièce */}
        <div ref={titleRef} className="hdr-watermark relative md:absolute md:top-2 md:left-10 md:right-[40%] pointer-events-none">
          <h1
            className="font-display font-extrabold leading-[0.85] text-[15vw] md:text-[7.6vw] lg:text-[7rem] tracking-tight"
            style={{ color: '#fff' }}
          >
            {shop.name}
          </h1>
          <ScrollUnderline color={accent} width={220} className="mt-3 hidden md:block" />
        </div>

        {/* La pièce — image déformable, décalée à droite, jamais centrée */}
        <div
          ref={planeRef}
          className="hdr-plane relative md:absolute md:top-[10%] md:right-[2%] w-full md:w-[46%] h-[46svh] md:h-[72%] mt-8 md:mt-0 overflow-hidden"
          style={{ boxShadow: `0 40px 90px -30px ${accent}55` }}
        >
          {heroImage && <FluxImagePlane image={heroImage} />}
          {!heroImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/5">
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Aucune image de couverture
              </span>
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(65% 60% at 50% 45%, transparent 45%, #050608 100%)' }}
          />
          {/* Cartel de galerie — infos de la pièce, collé au bas de l'image */}
          <span
            className="absolute bottom-3 left-3 text-[9px] md:text-[10px] font-mono tracking-[0.16em] uppercase px-2 py-1 rounded-sm"
            style={{ backgroundColor: 'rgba(5,6,8,0.55)', color: 'rgba(255,255,255,0.75)' }}
          >
            {meta || 'Maroc'}
          </span>
        </div>

        {/* Cartel d'info — description + notes, loin de la pièce, en bas à gauche */}
        <div
          ref={infoRef}
          className="hdr-text relative md:absolute md:bottom-2 md:left-10 md:max-w-sm flex flex-col gap-5 mt-10 md:mt-0"
        >
          {shop.description && (
            <p className="text-sm md:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {shop.description}
            </p>
          )}

          {(shop.reviewsCount ?? 0) > 0 && (
            <div className="flex gap-6">
              <RatingItem label="Service" value={shop.serviceRating ?? 0} muted="rgba(255,255,255,0.55)" />
              <RatingItem label="Communication" value={shop.communicationRating ?? 0} muted="rgba(255,255,255,0.55)" />
              <RatingItem label="Fiabilité" value={shop.reliabilityRating ?? 0} muted="rgba(255,255,255,0.55)" />
            </div>
          )}

          <WhatsAppCTA waLink={waLink} accent={accent} className="mt-1 w-fit hidden md:inline-flex" />
        </div>
      </div>

      {/* Ligne de meta basse — pleine largeur, discrète, ferme la composition */}
      <div
        className="hdr-text relative z-10 hidden md:flex items-center justify-between px-14 py-4 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <span className="text-[9px] tracking-[0.24em] uppercase font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Commande sur WhatsApp
        </span>
        <span className="text-[9px] tracking-[0.24em] uppercase font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Scroll ↓
        </span>
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