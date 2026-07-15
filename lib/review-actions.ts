'use server';
// lib/review-actions.ts

import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import { requireSession } from '@/lib/session';
import Review from '@/models/Review';
import Shop from '@/models/Shop';
import Product from '@/models/Product';
import type { ReviewInput, ReviewTargetType } from '@/types';

/**
 * Recalcule les moyennes dénormalisées après chaque création/édition/suppression d'avis.
 * - Boutique : 3 critères moyennés séparément (service/communication/reliability),
 *   `rating` = moyenne des 3. Ne dépend jamais des avis produits.
 * - Produit : uniquement `qualityRating` moyenné → `rating`.
 */
async function recomputeRating(targetType: ReviewTargetType, targetId: string) {
  if (targetType === 'shop') {
    const stats = await Review.aggregate([
      { $match: { targetType: 'shop', targetId } },
      {
        $group: {
          _id: null,
          service: { $avg: '$serviceRating' },
          communication: { $avg: '$communicationRating' },
          reliability: { $avg: '$reliabilityRating' },
          count: { $sum: 1 },
        },
      },
    ]);

    const s = stats[0];
    const service = round1(s?.service ?? 0);
    const communication = round1(s?.communication ?? 0);
    const reliability = round1(s?.reliability ?? 0);
    const overall = round1((service + communication + reliability) / 3);

    await Shop.findByIdAndUpdate(targetId, {
      serviceRating: service,
      communicationRating: communication,
      reliabilityRating: reliability,
      rating: overall,
      reviewsCount: s?.count ?? 0,
    });
  } else {
    const stats = await Review.aggregate([
      { $match: { targetType: 'product', targetId } },
      { $group: { _id: null, quality: { $avg: '$qualityRating' }, count: { $sum: 1 } } },
    ]);

    const s = stats[0];
    await Product.findByIdAndUpdate(targetId, {
      rating: round1(s?.quality ?? 0),
      reviewsCount: s?.count ?? 0,
    });
  }
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export async function createReview(input: ReviewInput) {
  const session = await requireSession();
  await connectDB();

  const existing = await Review.findOne({
    author: session.userId,
    targetType: input.targetType,
    targetId: input.targetId,
  });
  if (existing) throw new Error('Vous avez déjà laissé un avis ici. Modifiez-le plutôt.');

  if (input.targetType === 'shop') {
    await Review.create({
      author: session.userId,
      targetType: 'shop',
      targetId: input.targetId,
      serviceRating: input.serviceRating,
      communicationRating: input.communicationRating,
      reliabilityRating: input.reliabilityRating,
      comment: input.comment ?? '',
    });
  } else {
    await Review.create({
      author: session.userId,
      targetType: 'product',
      targetId: input.targetId,
      qualityRating: input.qualityRating,
      comment: input.comment ?? '',
    });
  }

  await recomputeRating(input.targetType, input.targetId);
  revalidatePath('/');
  return getReviews(input.targetType, input.targetId);
}

export async function updateReview(reviewId: string, data: Partial<ReviewInput>) {
  const session = await requireSession();
  await connectDB();

  const review = await Review.findById(reviewId);
  if (!review || String(review.author) !== session.userId) throw new Error('Non autorisé');

  if (review.targetType === 'shop') {
    const d = data as Partial<Extract<ReviewInput, { targetType: 'shop' }>>;
    if (d.serviceRating !== undefined) review.serviceRating = d.serviceRating;
    if (d.communicationRating !== undefined) review.communicationRating = d.communicationRating;
    if (d.reliabilityRating !== undefined) review.reliabilityRating = d.reliabilityRating;
  } else {
    const d = data as Partial<Extract<ReviewInput, { targetType: 'product' }>>;
    if (d.qualityRating !== undefined) review.qualityRating = d.qualityRating;
  }
  if (data.comment !== undefined) review.comment = data.comment;

  await review.save();
  await recomputeRating(review.targetType, String(review.targetId));

  return getReviews(review.targetType, String(review.targetId));
}

export async function deleteReview(reviewId: string) {
  const session = await requireSession();
  await connectDB();

  const review = await Review.findById(reviewId);
  if (!review || String(review.author) !== session.userId) throw new Error('Non autorisé');

  const { targetType, targetId } = review;
  await Review.findByIdAndDelete(reviewId);
  await recomputeRating(targetType, String(targetId));

  return getReviews(targetType, String(targetId));
}

export async function getReviews(targetType: ReviewTargetType, targetId: string) {
  await connectDB();
  const reviews = await Review.find({ targetType, targetId })
    .sort({ createdAt: -1 })
    .populate('author', 'name avatar')
    .lean();
  return JSON.parse(JSON.stringify(reviews));
}
