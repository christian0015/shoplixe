'use server';
// lib/shop-actions.ts

import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { deleteImage } from '@/lib/cloudinary';
import Shop from '@/models/Shop';
import Product from '@/models/Product';
import Review from '@/models/Review';
import User from '@/models/User';
import type { ShopInput } from '@/types';

export async function createShop(data: ShopInput) {
  const session = await requireSession();
  await connectDB();

  const existing = await Shop.findOne({ slug: data.slug });
  if (existing) throw new Error('Ce lien de boutique est déjà pris.');

  const shop = await Shop.create({
    ...data,
    owner: session.userId,
    location: data.location
      ? { type: 'Point', coordinates: [data.location.lng, data.location.lat] }
      : undefined,
  });

  await User.findByIdAndUpdate(session.userId, { hasShop: true });

  revalidatePath('/dashboard');
  return JSON.parse(JSON.stringify(shop));
}

export async function updateShop(shopId: string, data: Partial<ShopInput>) {
  const session = await requireSession();
  await connectDB();

  const shop = await Shop.findById(shopId);
  if (!shop || String(shop.owner) !== session.userId) throw new Error('Non autorisé');

  if (data.slug && data.slug !== shop.slug) {
    const slugTaken = await Shop.findOne({ slug: data.slug, _id: { $ne: shopId } });
    if (slugTaken) throw new Error('Ce lien de boutique est déjà pris.');
  }

  const update: Record<string, unknown> = { ...data };
  if (data.location) {
    update.location = { type: 'Point', coordinates: [data.location.lng, data.location.lat] };
  }

  Object.assign(shop, update);
  await shop.save();

  revalidatePath(`/dashboard/${shopId}`);
  revalidatePath(`/${shop.slug}`);
  return JSON.parse(JSON.stringify(shop));
}

export async function deleteShop(shopId: string) {
  const session = await requireSession();
  await connectDB();

  const shop = await Shop.findById(shopId);
  if (!shop || String(shop.owner) !== session.userId) throw new Error('Non autorisé');

  const products = await Product.find({ shop: shopId });
  for (const product of products) {
    for (const img of product.images) await deleteImage(img);
  }
  if (shop.logo) await deleteImage(shop.logo);
  if (shop.cover) await deleteImage(shop.cover);

  await Product.deleteMany({ shop: shopId });
  await Review.deleteMany({ targetType: 'shop', target: shopId });
  await Review.deleteMany({ targetType: 'product', target: { $in: products.map((p) => p._id) } });
  await Shop.findByIdAndDelete(shopId);

  const remaining = await Shop.countDocuments({ owner: session.userId });
  if (remaining === 0) await User.findByIdAndUpdate(session.userId, { hasShop: false });

  revalidatePath('/dashboard');
}

export async function getUserShops() {
  const session = await requireSession();
  await connectDB();
  const shops = await Shop.find({ owner: session.userId }).sort({ createdAt: -1 }).lean();

  const withCounts = await Promise.all(
    shops.map(async (shop) => {
      const productCount = await Product.countDocuments({ shop: shop._id });
      return { ...shop, productCount };
    })
  );

  return JSON.parse(JSON.stringify(withCounts));
}
