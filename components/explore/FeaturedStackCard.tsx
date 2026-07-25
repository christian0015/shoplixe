// components/explore/FeaturedStackCard.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductSearchResult } from '@/types';

export function FeaturedStackCard({ products }: { products: ProductSearchResult[] }) {
  const [items, setItems] = useState(products);
  const touchStartX = useRef<number | null>(null);

  const cycleNext = () => {
    setItems((prev) => {
      const nextArr = [...prev];
      const first = nextArr.shift();
      if (first) nextArr.push(first);
      return nextArr;
    });
  };

  // Rotation automatique
  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(cycleNext, 4500);
    return () => clearInterval(interval);
  }, [items]);

  // Touch / Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diffX) > 40) cycleNext();
    touchStartX.current = null;
  };

  if (!items.length) return null;

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4] select-none cursor-pointer" onClick={cycleNext}>
      <div 
        className="relative w-full h-full"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {items.map((product, idx) => {
          const isTop = idx === 0;
          const displayPrice = product.promoPrice ?? product.price;

          // Calcul des décalages et rotations style 3D Stack Awwwards
          const rotateDeg = idx === 0 ? 0 : idx === 1 ? -6 : idx === 2 ? 8 : -12;
          const translateX = idx === 0 ? 0 : idx === 1 ? -16 : idx === 2 ? 18 : -24;
          const scale = 1 - idx * 0.05;
          const zIndex = items.length - idx;

          return (
            <div
              key={product._id}
              style={{
                transform: `translateX(${translateX}px) rotate(${rotateDeg}deg) scale(${scale})`,
                zIndex,
              }}
              className={`absolute inset-0 rounded-3xl overflow-hidden border border-white/30 shadow-2xl transition-all duration-700 ease-out ${
                isTop ? 'opacity-100' : 'opacity-85 pointer-events-none'
              }`}
            >
              <div className="relative w-full h-full bg-stone-900">
                {product.images[0] && (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority={isTop}
                    sizes="(max-width: 768px) 90vw, 400px"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Badge Sponsoring & Prix */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono uppercase tracking-widest text-[#FF9FFC] border border-white/10">
                    ★ À la une
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-mono font-bold text-stone-900">
                    {displayPrice} MAD
                  </span>
                </div>

                {/* Info Produit Bottom */}
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                  <p className="text-xs font-mono uppercase text-stone-300 tracking-widest">
                    {product.shop.name}
                  </p>
                  <h3 className="font-serif-editorial italic text-2xl truncate">
                    {product.name}
                  </h3>
                  {isTop && (
                    <Link
                      href={`/${product.shop.slug}/${product.slug}`}
                      className="inline-block mt-2 px-4 py-1.5 rounded-full bg-[#E25B38] text-white text-xs font-mono uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Découvrir →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Indication Swipe */}
      <div className="mt-4 text-center">
        <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400">
          [ Tapez ou swipez pour faire défiler ]
        </span>
      </div>
    </div>
  );
}