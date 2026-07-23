// components/NearbyShopsSection.tsx
'use client';

import { useEffect, useState } from 'react';
import { searchNearby } from '@/lib/search-actions';
import { ShopCard } from '@/components/ShopCard';
import type { ShopSearchResult } from '@/types';

export function NearbyShopsSection() {
  const [shops, setShops] = useState<ShopSearchResult[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkAndLoad() {
      if (!navigator.geolocation || !navigator.permissions) return;

      try {
        // On ne demande JAMAIS la permission ici — on vérifie seulement si elle a
        // déjà été accordée ailleurs (ex: via "Près de moi" sur /search).
        const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        if (status.state !== 'granted') return;

        navigator.geolocation.getCurrentPosition(async (pos) => {
          if (cancelled) return;
          const results = await searchNearby(pos.coords.latitude, pos.coords.longitude, 15);
          if (!cancelled) setShops(results);
        });
      } catch {
        // API Permissions non supportée (Safari ancien, etc.) — on masque simplement la section.
      }
    }

    checkAndLoad();
    return () => {
      cancelled = true;
    };
  }, []);

  // Pas de géoloc accordée, ou aucun résultat : section entièrement masquée, pas de placeholder vide.
  if (!shops || shops.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-display font-bold text-lg">Boutiques près de vous</h2>
      <div className="grid gap-3">
        {shops.slice(0, 6).map((shop) => (
          <ShopCard key={shop._id} shop={shop} />
        ))}
      </div>
    </section>
  );
}
