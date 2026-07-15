// components/CityFilter.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function CityFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [city, setCity] = useState(searchParams.get('city') ?? '');

  const apply = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (city.trim()) params.set('city', city.trim());
    else params.delete('city');
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && apply()}
        placeholder="Ville (ex: Casablanca)"
        className="px-3 py-1.5 rounded-full border border-stone-300 text-sm outline-none focus:ring-2 focus:ring-orange/40 w-40"
      />
      {city && (
        <button onClick={apply} className="text-xs text-orange underline">
          Filtrer
        </button>
      )}
    </div>
  );
}
