// app/dashboard/[shopId]/settings/DeleteShopButton.tsx
'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteShop } from '@/lib/shop-actions';

export function DeleteShopButton({ shopId }: { shopId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm('Supprimer définitivement cette boutique et tous ses produits ?')) return;
    startTransition(async () => {
      await deleteShop(shopId);
      router.push('/dashboard');
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="px-5 py-2.5 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
    >
      {isPending ? 'Suppression...' : 'Supprimer la boutique'}
    </button>
  );
}