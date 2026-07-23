'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function NearMeToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isActive = searchParams.get('near') === 'true';
  const [status, setStatus] = useState<'idle' | 'locating' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const activate = () => {
    if (!navigator.geolocation) {
      setErrorMessage('La géolocalisation n’est pas supportée par votre navigateur.');
      setStatus('error');
      return;
    }

    setStatus('locating');
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('near', 'true');
        params.set('lat', String(pos.coords.latitude));
        params.set('lng', String(pos.coords.longitude));
        setStatus('idle');
        router.push(`/search?${params.toString()}`);
      },
      (error) => {
        setStatus('error');
        // Diagnostic précis des erreurs Safari
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage('Permission refusée. Autorisez la localisation dans les réglages de votre navigateur.');
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage('Signal GPS indisponible. Réessayez.');
            break;
          case error.TIMEOUT:
            setErrorMessage('Délai d’attente dépassé. Réessayez.');
            break;
          default:
            setErrorMessage('Erreur de localisation.');
        }
      },
      {
        enableHighAccuracy: true, // Requis sur mobile/iOS pour forcer le composant GPS[cite: 2]
        timeout: 10000,           // 10 secondes pour laisser le temps au mobile[cite: 2]
        maximumAge: 60000,        // Accepte une position en cache datant de moins d'1 minute[cite: 2]
      }
    );
  };

  const deactivate = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('near');
    params.delete('lat');
    params.delete('lng');
    setStatus('idle');
    setErrorMessage('');
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-1">
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
          {status === 'locating' ? 'Recherche GPS...' : isActive ? '📍 Près de moi (activé)' : '📍 Près de moi'}
        </button>
      </div>

      {status === 'error' && errorMessage && (
        <span className="text-xs text-red-500 font-medium max-w-xs leading-tight">
          {errorMessage}
        </span>
      )}
    </div>
  );
}