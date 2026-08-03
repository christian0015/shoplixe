'use server';
// lib/auth-actions.ts

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { hashPassword, verifyPassword, signJWT } from '@/lib/auth';
import { requireSession } from '@/lib/session';
import { deleteImage } from '@/lib/cloudinary';
import User from '@/models/User';
import Shop from '@/models/Shop';
import Product from '@/models/Product';
import Review from '@/models/Review';

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  newsletter: boolean;
}): Promise<{ error: string } | undefined> {
  await connectDB();

  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) return { error: 'Un compte existe déjà avec cet email.' };

  const passwordHash = await hashPassword(data.password);
  const user = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash,
    newsletter: data.newsletter,
  });

  const token = signJWT({ userId: String(user._id), email: user.email, role: user.role });
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: THIRTY_DAYS,
    path: '/',
  });

  redirect('/dashboard');
}

export async function authenticateUser(data: { email: string; password: string }): Promise<{ error: string } | undefined> {
  await connectDB();

  const user = await User.findOne({ email: data.email.toLowerCase() });
  if (!user) return { error: 'Email ou mot de passe incorrect.' };

  const valid = await verifyPassword(data.password, user.passwordHash);
  if (!valid) return { error: 'Email ou mot de passe incorrect.' };

  const token = signJWT({ userId: String(user._id), email: user.email, role: user.role });
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: THIRTY_DAYS,
    path: '/',
  });

  redirect('/dashboard');
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}

export async function deleteAccount() {
  const session = await requireSession();
  await connectDB();

  const shops = await Shop.find({ owner: session.userId });

  for (const shop of shops) {
    const products = await Product.find({ shop: shop._id });

    for (const product of products) {
      for (const img of product.images) await deleteImage(img);
    }
    if (shop.logo) await deleteImage(shop.logo);
    if (shop.cover) await deleteImage(shop.cover);

    await Product.deleteMany({ shop: shop._id });
    await Review.deleteMany({ targetType: 'shop', target: shop._id });
    await Review.deleteMany({ targetType: 'product', target: { $in: products.map((p) => p._id) } });
  }

  await Shop.deleteMany({ owner: session.userId });

  // Avis laissés par cet utilisateur sur d'autres boutiques/produits
  await Review.deleteMany({ author: session.userId });

  const user = await User.findById(session.userId);
  if (user?.avatar) await deleteImage(user.avatar);

  await User.findByIdAndDelete(session.userId);

  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/');
}