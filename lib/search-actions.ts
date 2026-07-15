'use server';
// lib/search-actions.ts

import { connectDB } from '@/lib/db';
import Shop from '@/models/Shop';
import Product from '@/models/Product';
import type { ShopCategory, ShopSearchResult, ProductSearchResult } from '@/types';

function toShopResult(s: Record<string, unknown>, distanceKm?: number): ShopSearchResult {
  return {
    _id: String(s._id),
    name: s.name as string,
    slug: s.slug as string,
    logo: (s.logo as string) ?? null,
    cover: (s.cover as string) ?? null,
    category: s.category as ShopCategory,
    theme: s.theme as ShopSearchResult['theme'],
    accentColor: (s.accentColor as string) ?? null,
    city: (s.city as string) ?? null,
    district: (s.district as string) ?? null,
    isVerified: Boolean(s.isVerified),
    rating: (s.rating as number) ?? 0,
    reviewsCount: (s.reviewsCount as number) ?? 0,
    ...(typeof distanceKm === 'number' ? { distanceKm: Math.round(distanceKm * 10) / 10 } : {}),
  };
}

function toProductResult(p: Record<string, unknown>): ProductSearchResult {
  const shop = p.shop as Record<string, unknown>;
  return {
    _id: String(p._id),
    name: p.name as string,
    slug: p.slug as string,
    price: p.price as number,
    promoPrice: (p.promoPrice as number) ?? null,
    images: (p.images as string[]) ?? [],
    available: Boolean(p.available),
    rating: (p.rating as number) ?? 0,
    reviewsCount: (p.reviewsCount as number) ?? 0,
    shop: {
      _id: String(shop._id),
      slug: shop.slug as string,
      name: shop.name as string,
      city: (shop.city as string) ?? null,
    },
  };
}

/** Recherche texte sur les produits (name/description/tags), filtrable par catégorie boutique. */
export async function searchProducts(
  query: string,
  filters: { category?: ShopCategory | 'all'; city?: string } = {}
): Promise<ProductSearchResult[]> {
  await connectDB();

  let shopIds: string[] | undefined;
  if ((filters.category && filters.category !== 'all') || filters.city) {
    const shopFilter: Record<string, unknown> = {};
    if (filters.category && filters.category !== 'all') shopFilter.category = filters.category;
    if (filters.city) shopFilter.city = filters.city;
    const shops = await Shop.find(shopFilter).select('_id').lean();
    shopIds = shops.map((s) => String((s as { _id: unknown })._id));
    if (shopIds.length === 0) return [];
  }

  const filter: Record<string, unknown> = { available: true };
  if (query && query.trim()) filter.$text = { $search: query.trim() };
  if (shopIds) filter.shop = { $in: shopIds };

  const productsQuery = Product.find(filter).limit(40).populate('shop', 'slug name city');
  const products =
    query && query.trim()
      ? await productsQuery
          .select({ score: { $meta: 'textScore' } })
          .sort({ score: { $meta: 'textScore' } })
          .lean()
      : await productsQuery.sort({ createdAt: -1 }).lean();

  return products.map((p) => toProductResult(p as unknown as Record<string, unknown>));
}

/** Recherche texte sur les boutiques (name/description), filtrable par catégorie/ville. */
export async function searchShops(
  query: string,
  filters: { category?: ShopCategory | 'all'; city?: string } = {}
): Promise<ShopSearchResult[]> {
  await connectDB();

  const filter: Record<string, unknown> = {};
  if (filters.category && filters.category !== 'all') filter.category = filters.category;
  if (filters.city) filter.city = filters.city;
  if (query && query.trim()) filter.$text = { $search: query.trim() };

  const shopsQuery = Shop.find(filter).limit(40);
  const shops =
    query && query.trim()
      ? await shopsQuery
          .select({ score: { $meta: 'textScore' } })
          .sort({ score: { $meta: 'textScore' } })
          .lean()
      : await shopsQuery.sort({ rating: -1, createdAt: -1 }).lean();

  return shops.map((s) => toShopResult(s as unknown as Record<string, unknown>));
}

/**
 * Recherche géospatiale — appelée UNIQUEMENT si l'utilisateur active explicitement
 * la géolocalisation ("Près de moi"). Ne calcule jamais de distance par défaut.
 */
export async function searchNearby(
  lat: number,
  lng: number,
  radiusKm = 15,
  category?: ShopCategory | 'all'
): Promise<ShopSearchResult[]> {
  await connectDB();

  const query: Record<string, unknown> = {};
  if (category && category !== 'all') query.category = category;

  const pipeline = [
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        distanceField: 'distanceMeters',
        maxDistance: radiusKm * 1000,
        spherical: true,
        query,
      },
    },
    { $limit: 20 },
  ];

  const results = await Shop.aggregate(pipeline as unknown as Parameters<typeof Shop.aggregate>[0]);
  return results.map((s) => toShopResult(s, s.distanceMeters / 1000));
}

/**
 * Variante produits de la recherche géo : boutiques proches d'abord, puis leurs produits.
 * Toujours dépendante d'un `searchNearby` explicite en amont — jamais de calcul par défaut.
 */
export async function searchNearbyProducts(
  lat: number,
  lng: number,
  radiusKm = 15,
  category?: ShopCategory | 'all',
  query?: string
): Promise<ProductSearchResult[]> {
  const nearbyShops = await searchNearby(lat, lng, radiusKm, category);
  if (nearbyShops.length === 0) return [];

  await connectDB();
  const filter: Record<string, unknown> = {
    available: true,
    shop: { $in: nearbyShops.map((s) => s._id) },
  };
  if (query && query.trim()) filter.$text = { $search: query.trim() };

  const products = await Product.find(filter).limit(40).populate('shop', 'slug name city').lean();
  return products.map((p) => toProductResult(p as unknown as Record<string, unknown>));
}
