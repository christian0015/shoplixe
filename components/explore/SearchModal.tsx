// components/explore/SearchModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      gsap.fromTo(
        modalRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' }
      );
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      {/* Trigger Fixe Floating Plus (+) */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Rechercher"
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-[#0F0E0D] text-[#FAF8F5] flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform group border border-white/20"
      >
        <svg
          className="w-6 h-6 transform group-hover:rotate-90 transition-transform duration-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Modal Backdrop & Body */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            ref={overlayRef}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-[#0F0E0D]/60 backdrop-blur-md opacity-0"
          />

          <div
            ref={modalRef}
            className="relative w-full max-w-xl bg-[#FAF8F5] rounded-3xl p-8 border border-stone-300 shadow-2xl z-10"
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <span className="font-mono text-xs uppercase tracking-widest text-[#E25B38]">
                Recherche Shoplixe
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-stone-900 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSearch} className="mt-6 space-y-4">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Studio, céramique, artisanat..."
                  className="w-full bg-white rounded-2xl px-5 py-4 border border-stone-200 text-lg text-stone-900 focus:outline-none focus:border-[#E25B38] transition-colors"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-mono uppercase text-stone-500 hover:text-stone-900"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#0F0E0D] text-[#FAF8F5] text-xs font-mono uppercase hover:bg-[#E25B38] transition-colors"
                >
                  Rechercher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}