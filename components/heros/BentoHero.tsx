// components/heros/BentoHero.tsx
'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import Dither from '@/components/reactbits/Dither';
import { HeaderTextPair, RatingItem, ShopLogoRing, WhatsAppCTA, VerifiedBadge } from './HeroChrome';
import { FloatingBlob } from './HeroSvgAccents';
import { hexToRgbArray, isColorDark, shade } from './utils';
import type { HeroProps } from './types';

export function BentoHero({ shop, theme, accent, waLink }: HeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelColor = theme.bentoPalette?.[1] ?? accent;
  const panelDark = isColorDark(panelColor);
  const panelText = panelDark ? '#FAFAF8' : '#141414';
  const panelMuted = panelDark ? 'rgba(250,250,248,0.7)' : 'rgba(20,20,20,0.6)';

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hdr-visual', { opacity: 0, y: 24, duration: 0.8, stagger: 0.1 });
      tl.from('.hdr-text', { opacity: 0, y: 16, duration: 0.6, stagger: 0.06 }, '-=0.4');
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative w-full md:h-[100svh] md:max-h-[900px] overflow-hidden"
      style={{ background: theme.bg, paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}
    >
      <div className="absolute inset-0">
        <Dither
          waveColor={hexToRgbArray(accent)}
          disableAnimation={false}
          enableMouseInteraction
          mouseRadius={0.12}
          colorNum={3}
          pixelSize={2}
          waveAmplitude={0.3}
          waveFrequency={2.6}
          waveSpeed={0.1}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/30 pointer-events-none" />

      <FloatingBlob color={shade(accent, 0.25)} size={280} className="absolute -top-16 -right-16 opacity-40 pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col md:flex-row gap-3 p-3 md:p-6 min-h-[80svh] md:min-h-0">
        {/* Panneau identité — bloc couleur forte, étiré (esprit bento) */}
        <div
          className="hdr-visual flex-1 md:flex-[1.3] flex flex-col justify-end gap-4 rounded-[28px] p-6 md:p-9"
          style={{ backgroundColor: panelColor }}
        >
          <div className="flex items-center gap-3 hdr-text">
            <ShopLogoRing logo={shop.logo} name={shop.name} ringColor={panelColor} bg="rgba(255,255,255,0.15)" size={52} />
            {shop.isVerified && (
              <span
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: panelText }}
              >
                ✓ Vérifié
              </span>
            )}
          </div>

          <HeaderTextPair
            small="Boutique en ligne"
            big={shop.name}
            color={panelText}
            mutedColor={panelMuted}
            size="xl"
            className="hdr-text"
          />

          {shop.description && (
            <p className="hdr-text text-sm max-w-md" style={{ color: panelMuted }}>
              {shop.description}
            </p>
          )}

          <div className="hdr-text flex items-center gap-4 flex-wrap pt-2">
            {(shop.reviewsCount ?? 0) > 0 && (
              <div className="flex gap-4">
                <RatingItem label="Service" value={shop.serviceRating ?? 0} muted={panelMuted} />
                <RatingItem label="Fiabilité" value={shop.reliabilityRating ?? 0} muted={panelMuted} />
              </div>
            )}
            <WhatsAppCTA waLink={waLink} accent={accent} className="hidden md:inline-flex" />
          </div>
        </div>

        {/* Tuile visuelle — cover produit / boutique */}
        <div className="hdr-visual md:w-[34%] h-48 md:h-100% rounded-[28px] overflow-hidden relative">
          {shop.cover && <Image src={shop.cover} alt={shop.name} fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 34vw" />}
          <div
            className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: theme.bentoPalette?.[1] ?? accent, color: '#fff' }}
          >
            {shop.city ?? 'Maroc'}
          </div>
        </div>
      </div>
    </div>
  );
}