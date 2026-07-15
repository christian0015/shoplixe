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
    <Button variant="ghost" onClick={handleClick} disabled={isPending}>
      {isPending ? 'Suppression...' : 'Tout supprimer'}
    </Button>
  );
}
