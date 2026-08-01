// components/AutosaveIndicator.tsx
'use client';

import type { AutosaveStatus } from '@/hooks/useAutosave';

export function AutosaveIndicator({ status, onRetry }: { status: AutosaveStatus; onRetry?: () => void }) {
  if (status === 'idle') return null;

  if (status === 'saving') {
    return <p className="text-xs text-stone-400">Enregistrement...</p>;
  }
  if (status === 'saved') {
    return <p className="text-xs text-[#2e5e4d] font-medium">Enregistré ✓</p>;
  }
  return (
    <p className="text-xs text-red-600 font-medium">
      Échec de l&apos;enregistrement.{' '}
      {onRetry && (
        <button type="button" onClick={onRetry} className="underline">
          Réessayer
        </button>
      )}
    </p>
  );
}