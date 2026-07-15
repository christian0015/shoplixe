// components/heros/MagazineHero.tsx
'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { HeaderTextPair, RatingItem, ShopLogoRing, WhatsAppCTA, VerifiedBadge } from './HeroChrome';
import { ScrollUnderline, LoopRing } from './HeroSvgAccents';
import type { HeroProps } from './types';

export function MagazineHero({ shop, theme, accent, secondaryImage, waLink }: HeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const second = secondaryImage || shop.cover;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hdr-text', { y: 24, opacity: 0, duration: 0.7, stagger: 0.08 });
      tl.from('.hdr-visual', { opacity: 0, scale: 0.96, duration: 0.8, stagger: 0.12 }, '-=0.5');
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="flex flex-col w-full md:h-[100svh] md:max-h-[900px] overflow-hidden relative"
      style={{ background: theme.gradient ?? theme.bg, paddingTop: 'max(env(safe-area-inset-top), 1.5rem)' }}
    >
      <LoopRing color={accent} size={120} className="absolute top-2 right-2 md:top-6 md:right-8 opacity-70 z-0" />

      <div className="flex-1 flex flex-wrap md:flex-nowrap items-start md:items-stretch justify-start md:justify-between gap-20 md:gap-8 px-4 md:px-16 pt-2 md:pt-6 relative z-10">
        {/* Colonne 1 — visuel aligné en haut */}
        <div className="flex flex-col justify-start gap-3 md:gap-5 w-full md:w-[52%]">
          <HeaderTextPair small="Boutique en ligne" big={shop.name} color={theme.text} mutedColor={theme.textMuted} className="hdr-text" />
          <ScrollUnderline color={accent} width={180} className="hdr-text -mt-2" />
          <div className="hdr-visual relative w-full h-56 md:h-auto md:grow rounded-[28px] md:rounded-2xl overflow-hidden" style={{ borderColor: theme.border }}>
            {shop.cover && (
              <Image src={shop.cover} alt={shop.name} fill priority className="object-cover" sizes="(max-width: 768px) 90vw, 52vw" />
            )}
          </div>
        </div>

        {/* Colonne 2 — visuel aligné en bas, toujours à droite */}
        <div className="flex flex-col justify-end items-end gap-3 md:gap-5 w-[60%] md:w-[30%] ml-auto md:ml-0 text-right">
          <HeaderTextPair
            small={[shop.district, shop.city].filter(Boolean).join(', ') || 'Livraison locale'}
            big="Découvrir"
            color={theme.text}
            mutedColor={theme.textMuted}
            align="right"
            className="hdr-text"
          />
          <div className="hdr-visual relative w-full h-40 md:h-[54%] rounded-[28px] md:rounded-2xl overflow-hidden">
            {second && <Image src={second} alt="" fill className="object-cover" sizes="(max-width: 768px) 60vw, 40vw" />}
          </div>
        </div>
      </div>

      {/* Barre d'identité */}
      <div
        className="hdr-text px-4 md:px-16 pt-6 pb-6 md:py-6 mt-2 md:mt-0 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 border-t relative z-10"
        style={{ borderColor: theme.border }}
      >
        <div className="flex items-end gap-4 min-w-0">
          <ShopLogoRing logo={shop.logo} name={shop.name} ringColor={theme.bg} bg={theme.surface} size={56} />
          <div className="min-w-0 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display font-bold text-lg md:hidden truncate" style={{ color: theme.text }}>
                {shop.name}
              </span>
              {shop.isVerified && <VerifiedBadge theme={theme} />}
            </div>
            {shop.description && (
              <p className="text-sm mt-1 max-w-md line-clamp-2 md:truncate" style={{ color: theme.textMuted }}>
                {shop.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6 shrink-0 flex-wrap">
          {(shop.reviewsCount ?? 0) > 0 && (
            <div className="flex gap-4">
              <RatingItem label="Service" value={shop.serviceRating ?? 0} muted={theme.textMuted} />
              <RatingItem label="Communication" value={shop.communicationRating ?? 0} muted={theme.textMuted} />
              <RatingItem label="Fiabilité" value={shop.reliabilityRating ?? 0} muted={theme.textMuted} />
            </div>
          )}
          <WhatsAppCTA waLink={waLink} accent={accent} className="hidden md:inline-flex" />
        </div>
      </div>
    </div>
  );
}