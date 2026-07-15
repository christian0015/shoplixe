'use server';
// lib/user-actions.ts

import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import { requireSession } from '@/lib/session';
import { uploadImage } from '@/lib/cloudinary';
import User from '@/models/User';

const HISTORY_LIMIT = 50;

export async function updateProfile(data: { name?: string; phone?: string; newsletter?: boolean }, avatarForm?: FormData) {
  const session = await requireSession();
  await connectDB();

  const update: Record<string, unknown> = { ...data };
  if (avatarForm) update.avatar = await uploadImage(avatarForm);

  await User.findByIdAndUpdate(session.userId, update);
  revalidatePath('/account');
}

export async function toggleFavoriteShop(shopId: string) {
  const session = await requireSession();
  await connectDB();

  const user = await User.findById(session.userId);
  if (!user) throw new Error('Utilisateur introuvable');

  const idx = user.favorites.shops.findIndex((id: unknown) => String(id) === shopId);
  if (idx >= 0) user.favorites.shops.splice(idx, 1);
  else user.favorites.shops.push(shopId);

  await user.save();
  revalidatePath('/account/favorites');
  return idx < 0;
}

export async function toggleFavoriteProduct(productId: string) {
  const session = await requireSession();
  await connectDB();

  const user = await User.findById(session.userId);
  if (!user) throw new Error('Utilisateur introuvable');

  const idx = user.favorites.products.findIndex((id: unknown) => String(id) === productId);
  if (idx >= 0) user.favorites.products.splice(idx, 1);
  else user.favorites.products.push(productId);

  await user.save();
  revalidatePath('/account/favorites');
  return idx < 0;
}

export async function getFavorites() {
  const session = await requireSession();
  await connectDB();

  const user = await User.findById(session.userId)
    .populate('favorites.shops')
    .populate({ path: 'favorites.products', populate: { path: 'shop', select: 'slug name' } })
    .lean() as unknown as { favorites: unknown } | null;

  if (!user) return { shops: [], products: [] };
  return JSON.parse(JSON.stringify(user.favorites));
}

export async function addToHistory(productId: string) {
  const session = await getSessionSafe();
  if (!session) return; // visiteur non connecté — pas d'historique
  await connectDB();

  const userDoc = await User.findById(session.userId);
  if (!userDoc) return;
  const user = userDoc as unknown as {
    history: { product: unknown; viewedAt: Date }[];
    save: () => Promise<unknown>;
  };

  user.history = user.history.filter((h: { product: unknown }) => String(h.product) !== productId);
  user.history.unshift({ product: productId, viewedAt: new Date() });
  if (user.history.length > HISTORY_LIMIT) user.history = user.history.slice(0, HISTORY_LIMIT);

  await user.save();
}

export async function getHistory() {
  const session = await requireSession();
  await connectDB();

  const user = await User.findById(session.userId)
    .populate({ path: 'history.product', populate: { path: 'shop', select: 'slug name' } })
    .lean() as unknown as { history: unknown[] } | null;

  if (!user) return [];
  const history = (user.history as unknown[]).filter(
    (h) => (h as { product: unknown }).product != null
  );
  history.sort(
    (a, b) =>
      new Date((b as { viewedAt: string }).viewedAt).getTime() -
      new Date((a as { viewedAt: string }).viewedAt).getTime()
  );
  return JSON.parse(JSON.stringify(history));
}

export async function clearHistory() {
  const session = await requireSession();
  await connectDB();
  await User.findByIdAndUpdate(session.userId, { history: [] });
  revalidatePath('/account/history');
}

// Petit helper local pour ne pas jeter dans addToHistory (appelée depuis une page publique)
async function getSessionSafe() {
  try {
    return await requireSession();
  } catch {
    return null;
  }
}
