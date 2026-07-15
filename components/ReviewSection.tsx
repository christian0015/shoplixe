// components/ReviewSection.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { StarRatingDisplay, StarRatingInput } from '@/components/StarRating';
import { Button } from '@/components/ui';
import { createReview, updateReview, deleteReview } from '@/lib/review-actions';
import type { ReviewTargetType } from '@/types';

interface ReviewAuthor {
  _id: string;
  name: string;
  avatar: string | null;
}

interface ReviewData {
  _id: string;
  author: ReviewAuthor;
  serviceRating?: number | null;
  communicationRating?: number | null;
  reliabilityRating?: number | null;
  qualityRating?: number | null;
  comment: string;
  createdAt: string;
}

const SHOP_CRITERIA = [
  { key: 'serviceRating', label: 'Service' },
  { key: 'communicationRating', label: 'Communication' },
  { key: 'reliabilityRating', label: 'Fiabilité' },
] as const;

export function ReviewSection({
  targetType,
  targetId,
  initialReviews,
  ratingSummary,
  isAuthenticated,
  currentUserId,
}: {
  targetType: ReviewTargetType;
  targetId: string;
  initialReviews: ReviewData[];
  // Boutique : { service, communication, reliability, overall, count }. Produit : { quality, count }.
  ratingSummary:
    | { service: number; communication: number; reliability: number; overall: number; count: number }
    | { quality: number; count: number };
  isAuthenticated: boolean;
  currentUserId?: string;
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [serviceRating, setServiceRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [reliabilityRating, setReliabilityRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const myReview = currentUserId ? reviews.find((r) => r.author?._id === currentUserId) : undefined;
  const isShop = targetType === 'shop';

  const startEdit = () => {
    if (!myReview) return;
    setServiceRating(myReview.serviceRating ?? 0);
    setCommunicationRating(myReview.communicationRating ?? 0);
    setReliabilityRating(myReview.reliabilityRating ?? 0);
    setQualityRating(myReview.qualityRating ?? 0);
    setComment(myReview.comment ?? '');
    setIsEditing(true);
  };

  const resetForm = () => {
    setServiceRating(0);
    setCommunicationRating(0);
    setReliabilityRating(0);
    setQualityRating(0);
    setComment('');
    setIsEditing(false);
  };

  const handleSubmit = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isShop && (serviceRating === 0 || communicationRating === 0 || reliabilityRating === 0)) {
      setError('Notez les 3 critères.');
      return;
    }
    if (!isShop && qualityRating === 0) {
      setError('Choisissez une note.');
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        let updated: ReviewData[];
        if (myReview) {
          updated = isShop
            ? await updateReview(myReview._id, { serviceRating, communicationRating, reliabilityRating, comment })
            : await updateReview(myReview._id, { qualityRating, comment });
        } else {
          updated = isShop
            ? await createReview({ targetType: 'shop', targetId, serviceRating, communicationRating, reliabilityRating, comment })
            : await createReview({ targetType: 'product', targetId, qualityRating, comment });
        }
        setReviews(updated);
        resetForm();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Une erreur est survenue.');
      }
    });
  };

  const handleDelete = (reviewId: string) => {
    startTransition(async () => {
      const updated = await deleteReview(reviewId);
      setReviews(updated);
    });
  };

  const showForm = !myReview || isEditing;

  return (
    <section className="mt-10 space-y-6">
      <div className="space-y-2">
        <h2 className="font-display font-bold text-lg">Avis</h2>

        {isShop ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md">
            {SHOP_CRITERIA.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between sm:flex-col sm:items-start gap-1">
                <span className="text-xs text-stone-500">{label}</span>
                <StarRatingDisplay
                  value={(ratingSummary as { service: number; communication: number; reliability: number })[
                    key === 'serviceRating' ? 'service' : key === 'communicationRating' ? 'communication' : 'reliability'
                  ]}
                  showCount={false}
                  size={14}
                />
              </div>
            ))}
            <p className="col-span-full text-xs text-stone-400">
              {(ratingSummary as { count: number }).count} avis
            </p>
          </div>
        ) : (
          <StarRatingDisplay
            value={(ratingSummary as { quality: number }).quality}
            count={(ratingSummary as { count: number }).count}
          />
        )}
      </div>

      {myReview && !isEditing && (
        <div className="flex items-center justify-between rounded-2xl border border-stone-200 p-4">
          <p className="text-sm text-stone-500">Vous avez déjà laissé un avis ici.</p>
          <button onClick={startEdit} className="text-sm underline text-orange">
            Modifier mon avis
          </button>
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-stone-200 p-4 space-y-4">
          {isShop ? (
            SHOP_CRITERIA.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-stone-600">{label}</span>
                <StarRatingInput
                  value={key === 'serviceRating' ? serviceRating : key === 'communicationRating' ? communicationRating : reliabilityRating}
                  onChange={
                    key === 'serviceRating' ? setServiceRating : key === 'communicationRating' ? setCommunicationRating : setReliabilityRating
                  }
                  size={20}
                />
              </div>
            ))
          ) : (
            <StarRatingInput value={qualityRating} onChange={setQualityRating} />
          )}

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Votre avis (optionnel)"
            maxLength={500}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm outline-none focus:ring-2 focus:ring-orange/40"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Envoi...' : isAuthenticated ? (myReview ? 'Enregistrer' : 'Publier mon avis') : 'Se connecter pour noter'}
            </Button>
            {myReview && isEditing && (
              <Button variant="ghost" onClick={resetForm} disabled={isPending}>
                Annuler
              </Button>
            )}
          </div>
        </div>
      )}

      <ul className="space-y-4">
        {reviews.map((review) => (
          <li key={review._id} className="flex gap-3 border-b border-stone-100 pb-4">
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-stone-200 shrink-0">
              {review.author?.avatar && <Image src={review.author.avatar} alt="" fill className="object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{review.author?.name ?? 'Utilisateur'}</p>
                {review.author?._id === currentUserId && (
                  <button onClick={() => handleDelete(review._id)} className="text-xs text-stone-400 hover:text-red-600">
                    Supprimer
                  </button>
                )}
              </div>

              {isShop ? (
                <div className="flex flex-wrap gap-3 mt-1">
                  <MiniStars label="Service" value={review.serviceRating ?? 0} />
                  <MiniStars label="Communication" value={review.communicationRating ?? 0} />
                  <MiniStars label="Fiabilité" value={review.reliabilityRating ?? 0} />
                </div>
              ) : (
                <StarRatingDisplay value={review.qualityRating ?? 0} showCount={false} size={13} />
              )}

              {review.comment && <p className="text-sm text-stone-600 mt-1">{review.comment}</p>}
            </div>
          </li>
        ))}
        {reviews.length === 0 && <p className="text-sm text-stone-400">Aucun avis pour le moment — soyez le premier.</p>}
      </ul>
    </section>
  );
}

function MiniStars({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1 text-xs text-stone-500">
      <span>{label}:</span>
      <StarRatingDisplay value={value} showCount={false} size={11} />
    </div>
  );
}
