// components/heros/HeroChrome.tsx
'use client';

import Image from 'next/image';
import { StarRatingDisplay } from '@/components/StarRating';
import type { ThemeTokens } from '@/types';

export function HeaderTextPair({
  small,
  big,
  color,
  mutedColor,
  align = 'left',
  className = '',
  size = 'lg',
}: {
  small: string;
  big: string;
  color: string;
  mutedColor: string;
  align?: 'left' | 'right' | 'center';
  className?: string;
  size?: 'lg' | 'xl';
}) {
  const alignCls = align === 'right' ? 'items-end text-right' : align === 'center' ? 'items-center text-center' : 'items-start text-left';
  const bigSize = size === 'xl' ? 'text-3xl md:text-6xl lg:text-7xl' : 'text-xl md:text-3xl lg:text-4xl';
  return (
    <div className={`flex flex-col ${alignCls} ${className}`}>
      <span className="text-[10px] md:text-xs tracking-[0.2em] uppercase font-medium" style={{ color: mutedColor }}>
        {small}
      </span>
      <span className={`font-display font-extrabold leading-[1.02] mt-1 ${bigSize}`} style={{ color }}>
        {big}
      </span>
    </div>
  );
}

export function RatingItem({ label, value, color, muted }: { label: string; value: number; color?: string; muted: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px]" style={{ color: muted }}>{label}</span>
      <StarRatingDisplay value={value} showCount={false} size={13} />
    </div>
  );
}

export function ShopLogoRing({
  logo,
  name,
  ringColor,
  bg,
  size = 64,
}: {
  logo: string | null;
  name: string;
  ringColor: string;
  bg: string;
  size?: number;
}) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden border-4 shrink-0"
      style={{ width: size, height: size, borderColor: ringColor, backgroundColor: bg }}
    >
      {logo && <Image src={logo} alt={name} fill className="object-cover" />}
    </div>
  );
}

export function WhatsAppCTA({ waLink, accent, className = '' }: { waLink: string; accent: string; className?: string }) {
  return (
    <a
      href={waLink}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-medium text-white shadow-lg shrink-0 transition-transform hover:scale-[1.03] ${className}`}
      style={{ backgroundColor: accent }}
    >
      Commander sur WhatsApp
    </a>
  );
}

export function VerifiedBadge({ theme }: { theme: ThemeTokens }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: `${theme.accent}22`, color: theme.accent }}
    >
      ✓ Vendeur vérifié
    </span>
  );
}