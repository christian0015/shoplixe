// app/account/history/ClearHistoryButton.tsx
'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { clearHistory } from '@/lib/user-actions';

export function ClearHistoryButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClick = () => {
    if (!confirm('Supprimer tout votre historique de consultation ?')) return;
    startTransition(async () => {
      await clearHistory();
      router.refresh();
    });
  };

  return (
    <Button variant="ghost" onClick={handleClick} disabled={isPending}
      className="px-4 py-2 rounded-full text-sm font-medium text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60">
      {isPending ? 'Suppression...' : 'Tout supprimer'}
    </Button>
  );
}
