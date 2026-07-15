'use server';
// lib/product-actions.ts

import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { uploadImage, deleteImage } from '@/lib/cloudinary';
import Shop from '@/models/Shop';
import Product from '@/models/Product';
import Review from '@/models/Review';
import type { ProductInput } from '@/types';

async function assertShopOwnership(shopId: string, userId: string) {
  const shop = await Shop.findById(shopId);
  if (!shop || String(shop.owner) !== userId) throw new Error('Non autorisé');
  return shop;
}

export async function createProduct(shopId: string, data: ProductInput, imageFiles?: FormData[]) {
  const session = await requireSession();
  await connectDB();
  const shop = await assertShopOwnership(shopId, session.userId);

  const uploadedUrls: string[] = [];
  if (imageFiles?.length) {
    for (const fd of imageFiles) uploadedUrls.push(await uploadImage(fd));
  }

  const slug = data.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const product = await Product.create({
    ...data,
    shop: shopId,
    slug,
    images: [...(data.images ?? []), ...uploadedUrls],
  });

  revalidatePath(`/dashboard/${shopId}`);
  revalidatePath(`/${shop.slug}`);
  return JSON.parse(JSON.stringify(product));
}

export async function updateProduct(productId: string, data: Partial<ProductInput>, imageFiles?: FormData[]) {
  const session = await requireSession();
  await connectDB();

  const product = await Product.findById(productId);
  if (!product) throw new Error('Produit introuvable');
  const shop = await assertShopOwnership(String(product.shop), session.userId);

  const uploadedUrls: string[] = [];
  if (imageFiles?.length) {
    for (const fd of imageFiles) uploadedUrls.push(await uploadImage(fd));
  }

  Object.assign(product, data);
  if (uploadedUrls.length) product.images = [...product.images, ...uploadedUrls];
  await product.save();

  revalidatePath(`/dashboard/${shop._id}`);
  revalidatePath(`/${shop.slug}/${product.slug}`);
  return JSON.parse(JSON.stringify(product));
}

export async function deleteProduct(productId: string) {
  const session = await requireSession();
  await connectDB();

  const product = await Product.findById(productId);
  if (!product) throw new Error('Produit introuvable');
  const shop = await assertShopOwnership(String(product.shop), session.userId);

  for (const img of product.images) await deleteImage(img);
  await Review.deleteMany({ targetType: 'product', target: productId });
  await Product.findByIdAndDelete(productId);

  revalidatePath(`/dashboard/${shop._id}`);
}
