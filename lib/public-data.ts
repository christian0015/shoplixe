'use server';
// lib/public-data.ts

import { connectDB } from '@/lib/db';
import Shop from '@/models/Shop';
import Product from '@/models/Product';

export async function getShopBySlug(slug: string) {
  await connectDB();
  const shop = await Shop.findOne({ slug }).lean();
  if (!shop) return null;
  return JSON.parse(JSON.stringify(shop));
}

export async function getProductsByShop(shopId: string, opts: { onlyAvailable?: boolean } = {}) {
  await connectDB();
  const filter: Record<string, unknown> = { shop: shopId };
  if (opts.onlyAvailable) filter.available = true;
  const products = await Product.find(filter).sort({ order: 1, createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(products));
}

export async function getProductBySlug(shopSlug: string, productSlug: string) {
  await connectDB();
  const shop = await Shop.findOne({ slug: shopSlug }).lean();
  if (!shop) return null;
  const shopDoc = shop as unknown as { _id: string };
  const product = await Product.findOne({ shop: shopDoc._id, slug: productSlug }).lean();
  if (!product) return null;
  return {
    product: JSON.parse(JSON.stringify(product)),
    shop: JSON.parse(JSON.stringify(shop)),
  };
}

/**
 * "Tendances" pour /explore — tri simple (nombre d'avis + récence), pas de calcul lourd
 * (pas de fenêtre glissante, pas de scoring pondéré).
 */
export async function getTrendingProducts(limit = 8) {
  await connectDB();
  const products = await Product.find({ available: true })
    .sort({ reviewsCount: -1, createdAt: -1 })
    .limit(limit)
    .populate('shop', 'slug name city')
    .lean();
  return JSON.parse(JSON.stringify(products));
}

/** "Nouvelles boutiques" pour /explore — triées createdAt desc, limit 8. */
export async function getNewShops(limit = 8) {
  await connectDB();
  const shops = await Shop.find({}).sort({ createdAt: -1 }).limit(limit).lean();
  return JSON.parse(JSON.stringify(shops));
}
