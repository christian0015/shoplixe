// components/heros/types.ts
import type { ThemeTokens } from '@/types';

export interface HeroShopData {
  _id: string;
  name: string;
  description: string;
  logo: string | null;
  cover: string | null;
  whatsappNumber: string;
  instagram: string | null;
  facebook: string | null;
  city: string | null;
  district: string | null;
  isVerified: boolean;
  reviewsCount?: number;
  serviceRating?: number;
  communicationRating?: number;
  reliabilityRating?: number;
}

export interface HeroProps {
  shop: HeroShopData;
  theme: ThemeTokens;
  accent: string;
  /** Deuxième image de la composition — premier produit de la boutique en général. */
  secondaryImage?: string | null;
  waLink: string;
}