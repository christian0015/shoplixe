// components/NearMeToggle.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function NearMeToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isActive = searchParams.get('near') === 'true';
  const [status, setStatus] = useState<'idle' | 'locating' | 'error'>('idle');

  const activate = () => {
    if (!navigator.geolocation) {
      setStatus('error');
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('near', 'true');
        params.set('lat', String(pos.coords.latitude));
        params.set('lng', String(pos.coords.longitude));
        setStatus('idle');
        router.push(`/search?${params.toString()}`);
      },
      () => setStatus('error'),
      { timeout: 8000 }
    );
  };

  const deactivate = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('near');
    params.delete('lat');
    params.delete('lng');
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isActive ? deactivate : activate}
        disabled={status === 'locating'}
        className={
          isActive
            ? 'px-4 py-1.5 rounded-full text-sm font-medium bg-orange text-white'
            : 'px-4 py-1.5 rounded-full text-sm font-medium bg-stone-100 text-stone-600 hover:bg-stone-200'
        }
      >
        {status === 'locating' ? 'Localisation...' : isActive ? '📍 Près de moi (activé)' : '📍 Près de moi'}
      </button>
      {status === 'error' && (
        <span className="text-xs text-red-500">Localisation indisponible — vérifiez les permissions.</span>
      )}
    </div>
  );
}
