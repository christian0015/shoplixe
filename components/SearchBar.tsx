// components/SearchBar.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/components/ui';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const tab = (searchParams.get('tab') as 'products' | 'shops') ?? 'products';

  const submit = (nextTab?: 'products' | 'shops') => {
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) params.set('q', q.trim());
    else params.delete('q');
    params.set('tab', nextTab ?? tab);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="sticky top-0 z-30 bg-[#FAFAF8]/90 backdrop-blur-sm py-3 -mx-4 px-4 space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un produit ou une boutique..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange transition"
        />
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-orange text-white text-sm font-medium hover:opacity-90">
          Rechercher
        </button>
      </form>

      <div className="flex gap-2">
        {(['products', 'shops'] as const).map((t) => (
          <button
            key={t}
            onClick={() => submit(t)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              tab === t ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'
            )}
          >
            {t === 'products' ? 'Produits' : 'Boutiques'}
          </button>
        ))}
      </div>
    </div>
  );
}
