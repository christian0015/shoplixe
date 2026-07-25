// components/search/SearchControlHeader.tsx
'use client';

import { useState, useEffect, useTransition, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORY_LABELS, type ShopCategory } from '@/types';

export function SearchControlHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Extraction URL
  const queryCategory = searchParams.get('category') as ShopCategory | null;
  const queryCity = searchParams.get('city') ?? '';
  const queryQ = searchParams.get('q') ?? '';
  const tab = (searchParams.get('tab') as 'products' | 'shops') ?? 'products';
  const isNear = searchParams.get('near') === 'true';

  // États locaux
  const [q, setQ] = useState(queryQ);
  const [cityInput, setCityInput] = useState(queryCity);
  const [status, setStatus] = useState<'idle' | 'locating' | 'error'>('idle');

  // Réf pour savoir si l'utilisateur est en train de taper dans l'input principal
  const isInputFocusedRef = useRef(false);

  // Synchronisation Ville : Uniquement si l'URL change depuis un badge ou l'externe
  useEffect(() => {
    setCityInput(queryCity);
  }, [queryCity]);

  // Synchronisation Recherche Textuelle : N'écrase PAS ce que l'utilisateur tape s'il a le focus !
  useEffect(() => {
    if (!isInputFocusedRef.current) {
      setQ(queryQ);
    }
  }, [queryQ]);

  // Fonction centrale de mise à jour des paramètres dans l'URL
  const updateSearch = useCallback(
    (newParams: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, val]) => {
        if (val === null || val === '') params.delete(key);
        else params.set(key, val);
      });

      startTransition(() => {
        router.push(`/search?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams]
  );

  // --- DEBOUNCE RECHERCHE PRINCIPALE (500ms) ---
  // Un délai plus confortable pour éviter de couper la frappe sur des mots longs
  useEffect(() => {
    if (q.trim() === queryQ) return;

    const timer = setTimeout(() => {
      updateSearch({ q: q.trim() || null });
    }, 500);

    return () => clearTimeout(timer);
  }, [q, queryQ, updateSearch]);

  // --- DEBOUNCE VILLE (300ms) ---
  useEffect(() => {
    if (cityInput.trim() === queryCity) return;

    const timer = setTimeout(() => {
      updateSearch({ city: cityInput.trim() || null });
    }, 300);

    return () => clearTimeout(timer);
  }, [cityInput, queryCity, updateSearch]);

  // Changement d'onglet = Réinitialisation des filtres
  const handleTabChange = (nextTab: 'products' | 'shops') => {
    if (nextTab === tab) return;
    startTransition(() => {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      params.set('tab', nextTab);
      router.push(`/search?${params.toString()}`);
    });
  };

  // Géolocalisation GPS
  const handleGPS = () => {
    if (isNear) {
      updateSearch({ near: null, lat: null, lng: null });
      return;
    }

    if (!navigator.geolocation) return;
    setStatus('locating');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus('idle');
        updateSearch({
          near: 'true',
          lat: String(pos.coords.latitude),
          lng: String(pos.coords.longitude),
        });
      },
      () => setStatus('error'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="space-y-6">
      {/* Barre Principale de Recherche */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateSearch({ q: q.trim() || null, city: cityInput.trim() || null });
        }}
        className="relative group"
      >
        <div className="relative flex items-center bg-[#13111A]/80 border border-white/10 backdrop-blur-2xl rounded-full p-2 pl-6 shadow-2xl transition-all duration-500 focus-within:border-[#A855F7]/80 focus-within:ring-2 focus-within:ring-[#A855F7]/20">
          <svg className="w-5 h-5 text-stone-400 shrink-0 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            value={q}
            onFocus={() => {
              isInputFocusedRef.current = true;
            }}
            onBlur={() => {
              isInputFocusedRef.current = false;
            }}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher une création rare, un atelier, un produit..."
            className="w-full bg-transparent text-stone-100 placeholder-stone-500 text-sm md:text-base outline-none font-sans font-light tracking-wide"
          />

          <button
            type="submit"
            disabled={isPending}
            className="shrink-0 px-6 py-3 rounded-full bg-[#FAF8F5] text-stone-900 font-mono text-xs uppercase tracking-widest hover:bg-[#A855F7] hover:text-white transition-all duration-300 font-semibold"
          >
            {isPending ? 'Scrutage...' : 'Explorer'}
          </button>
        </div>
      </form>

      {/* Badges des filtres actifs */}
      {(queryCategory || queryCity || isNear) && (
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          <span className="text-stone-500 uppercase tracking-widest">Filtres actifs :</span>
          
          {/* Badge Catégorie */}
          {queryCategory && queryCategory !== 'all' && (
            <button
              onClick={() => updateSearch({ category: null })}
              className="px-3 py-1 rounded-full bg-[#A855F7]/20 border border-[#A855F7]/40 text-[#FF9FFC] flex items-center gap-1.5 hover:bg-[#A855F7]/30 transition-all"
            >
              <span>{CATEGORY_LABELS[queryCategory] ?? queryCategory}</span>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}

          {/* Badge Ville */}
          {queryCity && (
            <button
              onClick={() => {
                setCityInput('');
                updateSearch({ city: null });
              }}
              className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-stone-200 flex items-center gap-1.5 hover:bg-white/20 transition-all"
            >
              <svg className="w-3 h-3 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{queryCity}</span>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}

          {/* Badge GPS */}
          {isNear && (
            <button
              onClick={handleGPS}
              className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5 hover:bg-emerald-500/30 transition-all"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
              <span>Près de vous</span>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}

          {/* Tout effacer */}
          <button
            onClick={() => {
              setCityInput('');
              setQ('');
              updateSearch({ category: null, city: null, near: null, lat: null, lng: null, q: null });
            }}
            className="text-stone-500 hover:text-white underline ml-2"
          >
            Tout effacer
          </button>
        </div>
      )}

      {/* Toolbar d'Affinage */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10">
        
        {/* Switch Produits / Boutiques */}
        <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
          <button
            onClick={() => handleTabChange('products')}
            className={`px-5 py-2 rounded-full text-xs font-mono tracking-wider transition-all duration-300 ${
              tab === 'products'
                ? 'bg-[#FAF8F5] text-stone-900 font-semibold shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            CRÉATIONS
          </button>
          <button
            onClick={() => handleTabChange('shops')}
            className={`px-5 py-2 rounded-full text-xs font-mono tracking-wider transition-all duration-300 ${
              tab === 'shops'
                ? 'bg-[#FAF8F5] text-stone-900 font-semibold shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            STUDIOS & ATELIERS
          </button>
        </div>

        {/* Localisation & Ville */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleGPS}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono transition-all duration-300 ${
              isNear
                ? 'bg-[#A855F7] border-[#A855F7] text-white'
                : 'bg-white/5 border-white/10 text-stone-300 hover:border-white/30'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            {status === 'locating' ? 'Géolocalisation...' : isNear ? 'GPS Actif' : 'Autour de moi'}
          </button>

          {/* Input Ville avec Debounce 300ms */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-3 py-1.5 focus-within:border-white/40">
            <input
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Ville (ex: Marrakech)"
              className="bg-transparent text-stone-200 text-xs font-mono outline-none w-28 md:w-36 placeholder-stone-500"
            />
            {cityInput && (
              <button
                type="button"
                onClick={() => {
                  setCityInput('');
                  updateSearch({ city: null });
                }}
                className="text-stone-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}