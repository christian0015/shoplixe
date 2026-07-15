// components/FavoriteButton.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleFavoriteShop, toggleFavoriteProduct } from '@/lib/user-actions';
import { cn } from '@/components/ui';

export function FavoriteButton({
  type,
  id,
  initialActive = false,
  isAuthenticated,
}: {
  type: 'shop' | 'product';
  id: string;
  initialActive?: boolean;
  isAuthenticated: boolean;
}) {
  const [active, setActive] = useState(initialActive);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setActive((prev) => !prev); // optimistic
    startTransition(async () => {
      try {
        const result =
          type === 'shop' ? await toggleFavoriteShop(id) : await toggleFavoriteProduct(id);
        setActive(result);
      } catch {
        setActive((prev) => !prev); // rollback si échec
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      className={cn(
        'flex items-center justify-center w-9 h-9 rounded-full backdrop-blur-sm transition-colors',
        active ? 'bg-red-500 text-white' : 'bg-white/80 text-stone-700 hover:bg-white'
      )}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M12 21s-6.7-4.3-9.3-8.1C.6 9.7 1.4 6 4.6 4.6c2-.9 4.3-.3 5.7 1.3l1.7 1.9 1.7-1.9c1.4-1.6 3.7-2.2 5.7-1.3 3.2 1.4 4 5.1 1.9 8.3C18.7 16.7 12 21 12 21z" />
      </svg>
    </button>
  );
}
