// types/index.ts

export type ShopTheme = 'minimal' | 'luxury' | 'beauty' | 'tech' | 'food' | 'fashion';
export type ShopTemplate = 'bento' | 'grid' | 'magazine' | 'liquidGlass' | 'flux3d';
export type ShopCategory =
  | 'fashion'
  | 'tech'
  | 'food'
  | 'beauty'
  | 'home'
  | 'crafts'
  | 'services'
  | 'other';

export interface ThemeTokens {
  bg: string;
  surface: string;
  border: string;
  accent: string;
  text: string;
  textMuted: string;
  /** Palette de couleurs fortes pour les cartes bento (optionnel, fallback = accent) */
  bentoPalette?: string[];
  /** Dégradé signature du thème, utilisé en fond de header / sections immersives */
  gradient?: string;
  /** Couleur de halo/glow (boxShadow, blur) assortie au thème */
  glow?: string;
}

export const TEMPLATE_LABELS: Record<ShopTemplate, string> = {
  grid: 'Grid — classique et lisible',
  magazine: 'Magazine — éditorial, rythmé',
  bento: 'Bento — blocs étirés, contrastés',
  liquidGlass: 'Liquid Glass — verre liquide, distortion',
  flux3d: 'Flux 3D — reveal produit en 3D',
};

export interface SessionUser {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export interface ProductInput {
  name: string;
  price: number;
  promoPrice?: number | null;
  description?: string;
  images?: string[];
  category?: string;
  subcategory?: string;
  tags?: string[];
  available?: boolean;
  order?: number;
}

export interface ShopInput {
  name: string;
  slug: string;
  description?: string;
  logo?: string | null;
  cover?: string | null;
  category: ShopCategory;
  theme: ShopTheme;
  template: ShopTemplate;
  accentColor?: string | null;
  whatsappNumber: string;
  instagram?: string | null;
  facebook?: string | null;
  city?: string | null;
  district?: string | null;
  location?: { lat: number; lng: number } | null;
}

// --- Avis (double note, multi-critères) ---

export type ReviewTargetType = 'shop' | 'product';

export interface ShopReviewInput {
  targetType: 'shop';
  targetId: string;
  serviceRating: number;
  communicationRating: number;
  reliabilityRating: number;
  comment?: string;
}

export interface ProductReviewInput {
  targetType: 'product';
  targetId: string;
  qualityRating: number;
  comment?: string;
}

export type ReviewInput = ShopReviewInput | ProductReviewInput;

// --- Recherche & découverte ---

export interface SearchParams {
  q?: string;
  tab?: 'products' | 'shops';
  category?: ShopCategory | 'all';
  city?: string;
  near?: boolean;
  lat?: number;
  lng?: number;
}

export interface ShopSearchResult {
  _id: string;
  name: string;
  slug: string;
  logo: string | null;
  cover: string | null;
  category: ShopCategory;
  theme: ShopTheme;
  accentColor: string | null;
  city: string | null;
  district: string | null;
  isVerified: boolean;
  rating: number;
  reviewsCount: number;
  distanceKm?: number;
}

export interface ProductSearchResult {
  _id: string;
  name: string;
  slug: string;
  price: number;
  promoPrice: number | null;
  images: string[];
  available: boolean;
  rating: number;
  reviewsCount: number;
  shop: { _id: string; slug: string; name: string; city: string | null };
  distanceKm?: number;
}

export interface CategoryDef {
  value: ShopCategory;
  label: string;
  emoji: string;
}

export const CATEGORIES: CategoryDef[] = [
  { value: 'fashion', label: 'Mode', emoji: '👗' },
  { value: 'tech', label: 'Informatique', emoji: '💻' },
  { value: 'food', label: 'Alimentation', emoji: '🍰' },
  { value: 'beauty', label: 'Beauté', emoji: '💄' },
  { value: 'home', label: 'Maison', emoji: '🧰' },
  { value: 'crafts', label: 'Artisanat', emoji: '🎨' },
  { value: 'services', label: 'Réparation', emoji: '🔧' },
  { value: 'other', label: 'Autre', emoji: '🛒' },
];

export const CATEGORY_LABELS: Record<ShopCategory, string> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.value]: c.label }),
  {} as Record<ShopCategory, string>
);