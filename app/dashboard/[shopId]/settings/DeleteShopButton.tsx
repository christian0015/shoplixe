// app/dashboard/[shopId]/settings/DeleteShopButton.tsx
'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
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
    <Button variant="danger" onClick={handleDelete} disabled={isPending}>
      {isPending ? 'Suppression...' : 'Supprimer la boutique'}
    </Button>
  );
}
