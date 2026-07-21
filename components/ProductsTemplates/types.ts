// components/ProductsTemplates/types.ts
import type { ProductCardData } from '@/components/ProductCard';
import type { ThemeTokens } from '@/types';

/** Props partagées par tous les templates produits (Grid, Bento, Magazine, ...) */
export interface ProductsTemplateProps {
  products: ProductCardData[];
  theme: ThemeTokens;
  accentColor?: string | null;
  shopSlug: string;
  isAuthenticated?: boolean;
  favoriteIds?: string[];
  backgroundImage?: string | null;
}