'use server';
// lib/auth-actions.ts

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { hashPassword, verifyPassword, signJWT } from '@/lib/auth';
import User from '@/models/User';

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  newsletter: boolean;
}) {
  await connectDB();

  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) throw new Error('Un compte existe déjà avec cet email.');

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

export async function authenticateUser(data: { email: string; password: string }) {
  await connectDB();

  const user = await User.findOne({ email: data.email.toLowerCase() });
  if (!user) throw new Error('Email ou mot de passe incorrect.');

  const valid = await verifyPassword(data.password, user.passwordHash);
  if (!valid) throw new Error('Email ou mot de passe incorrect.');

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
