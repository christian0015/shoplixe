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

/** Produits Sponsorisés / À la une pour la pile 3D Hero (Limit 4) */
export async function getFeaturedProducts(limit = 4) {
  await connectDB();
  const products = await Product.find({ available: true, isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('shop', 'slug name city logo')
    .lean();

  // Fallback aux produits récents si pas de produits explicitement featured
  if (products.length < limit) {
    const fallback = await Product.find({ available: true })
      .sort({ reviewsCount: -1, createdAt: -1 })
      .limit(limit)
      .populate('shop', 'slug name city logo')
      .lean();
    return JSON.parse(JSON.stringify(fallback));
  }

  return JSON.parse(JSON.stringify(products));
}

/** Flux For You Page (FYP) - Pagination infinie SEO-friendly */
export async function getFypProducts(page = 1, limit = 8) {
  await connectDB();
  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find({ available: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('shop', 'slug name city logo')
      .lean(),
    Product.countDocuments({ available: true }),
  ]);

  return {
    products: JSON.parse(JSON.stringify(products)),
    hasMore: skip + products.length < total,
    page,
  };
}

export async function getTrendingProducts(limit = 8) {
  await connectDB();
  const products = await Product.find({ available: true })
    .sort({ reviewsCount: -1, createdAt: -1 })
    .limit(limit)
    .populate('shop', 'slug name city')
    .lean();
  return JSON.parse(JSON.stringify(products));
}

export async function getNewShops(limit = 6) {
  await connectDB();
  const shops = await Shop.find({}).sort({ createdAt: -1 }).limit(limit).lean();
  return JSON.parse(JSON.stringify(shops));
}