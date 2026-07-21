// components/ProductsTemps.tsx
'use client';

import type { ProductsTemplateProps } from './ProductsTemplates/types';
import {
  GridProducts,
  MagazineProducts,
  BentoProducts,
  LiquidGlassProducts,
  Flux3DProducts,
} from '@/components/ProductsTemplates';
import type { ProductCardData } from '@/components/ProductCard';
import type { ThemeTokens, ShopTemplate } from '@/types';

// interface ProductsTempsProps extends ProductsTemplateProps { template: ShopTemplate }
export interface ProductsTempsProps {
  products: ProductCardData[];
  template: ShopTemplate;
  theme: ThemeTokens;
  accentColor?: string | null;
  shopSlug: string;
  isAuthenticated?: boolean;
  favoriteIds?: string[];
  /** Image utilisée comme "matière" à déformer derrière la grille en template liquidGlass */
  backgroundImage?: string | null;
}

export function ProductsTemps(props: ProductsTempsProps) {
  const { template, products, theme } = props;

  if (products.length === 0) {
    return (
      <p className="text-center py-16" style={{ color: theme.textMuted }}>
        Aucun produit pour le moment.
      </p>
    );
  }

  return (
    <>
      {template === 'bento' && <BentoProducts {...props} />}
      {template === 'liquidGlass' && <LiquidGlassProducts {...props} />}
      {template === 'flux3d' && <Flux3DProducts {...props} />}
      {template === 'magazine' && <MagazineProducts {...props} />}
      {template === 'grid' && <GridProducts {...props} />}
    </>
  );
}