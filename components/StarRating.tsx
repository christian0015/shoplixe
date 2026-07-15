// components/StarRating.tsx
'use client';

import { useState } from 'react';

function Star({ filled, half, size }: { filled: boolean; half?: boolean; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <defs>
        {half && (
          <linearGradient id="half-star">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        )}
      </defs>
      <path
        d="M12 2.5l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17.6l-6.1 3.4 1.5-6.8L2.2 9.5l6.9-.7L12 2.5z"
        fill={half ? 'url(#half-star)' : filled ? 'currentColor' : 'transparent'}
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// Affichage lecture seule (ProductCard, ShopHeader, en-tête d'une liste d'avis)
export function StarRatingDisplay({
  value,
  count,
  size = 16,
  showCount = true,
}: {
  value: number;
  count?: number;
  size?: number;
  showCount?: boolean;
}) {
  const rounded = Math.round(value * 2) / 2;

  return (
    <div className="flex items-center gap-1.5 text-amber-500">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} filled={i <= rounded} half={i - 0.5 === rounded} size={size} />
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-stone-500">
          {value > 0 ? value.toFixed(1) : 'Pas encore noté'}
          {typeof count === 'number' && count > 0 ? ` (${count})` : ''}
        </span>
      )}
    </div>
  );
}

// Sélecteur interactif (ReviewSection — formulaire d'ajout d'avis)
export function StarRatingInput({
  value,
  onChange,
  size = 24,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const active = hover ?? value;

  return (
    <div className="flex items-center gap-1 text-amber-500">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-110"
          aria-label={`${i} étoile${i > 1 ? 's' : ''}`}
        >
          <Star filled={i <= active} size={size} />
        </button>
      ))}
    </div>
  );
}
