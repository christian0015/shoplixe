// components/ShopHeader.tsx
'use client';

import { FavoriteButton } from '@/components/FavoriteButton';
import { MagazineHero, GridHero, BentoHero, LiquidGlassHero, Flux3DHero, type HeroShopData } from '@/components/heros';
import type { ThemeTokens, ShopTemplate } from '@/types';

export function ShopHeader({
  shop,
  theme,
  accentColor,
  template = 'grid',
  secondaryImage,
  isAuthenticated = false,
  isFavorite = false,
}: {
  shop: HeroShopData;
  theme: ThemeTokens;
  accentColor?: string | null;
  /** Choisit le hero — chaque template a son propre composant dans components/heros/ */
  template?: ShopTemplate;
  /** Deuxième image de la composition — typiquement le premier produit de la boutique */
  secondaryImage?: string | null;
  isAuthenticated?: boolean;
  isFavorite?: boolean;
}) {
  const accent = accentColor || theme.accent;
  const waLink = `https://wa.me/${shop.whatsappNumber.replace(/[^0-9]/g, '')}`;
  const heroProps = { shop, theme, accent, secondaryImage, waLink };

  return (
    <header className="relative mb-8">
      <div className="absolute top-4 right-4 md:top-6 md:right-8 z-30">
        <FavoriteButton type="shop" id={shop._id} initialActive={isFavorite} isAuthenticated={isAuthenticated} />
      </div>

      {template === 'bento' && <BentoHero {...heroProps} />}
      {template === 'liquidGlass' && <LiquidGlassHero {...heroProps} />}
      {template === 'flux3d' && <Flux3DHero {...heroProps} />}
      {template === 'grid' && <GridHero {...heroProps} />}
      {template === 'magazine' && <MagazineHero {...heroProps} />}

      {/* Bouton WhatsApp sticky mobile — commun à tous les templates */}
      <a
        href={waLink}
        target="_blank"
        rel="noreferrer"
        className="fixed md:hidden bottom-4 left-4 right-4 z-40 flex items-center justify-center gap-2 py-3 rounded-2xl font-medium text-white shadow-lg"
        style={{ backgroundColor: accent }}
      >
        Commander sur WhatsApp
      </a>
    </header>
  );
}