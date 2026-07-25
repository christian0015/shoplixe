// components/explore/FeaturedHeroCard.tsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { FeaturedStackCard } from './FeaturedStackCard';
import type { ProductSearchResult } from '@/types';

const Grainient = dynamic(() => import('@/components/reactbits/Grainient'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#0F0E0D]" />,
});

export function FeaturedHeroCard({ products }: { products: ProductSearchResult[] }) {
  const [items, setItems] = useState(products);

  // Rotation automatique pour la vue desktop dépliée
  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setItems((prev) => {
        const next = [...prev];
        const first = next.shift();
        if (first) next.push(first);
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [items]);

  if (!products || products.length === 0) return null;

  return (
    <div className="relative w-full rounded-3xl overflow-hidden p-6 sm:p-8 shadow-2xl border border-stone-200/50 text-white min-h-[420px] flex flex-col justify-between">
      {/* Background WebGL Grainient - Arrière-plan complet de la bannière */}
      <div className="absolute inset-0 z-0">
        <Grainient
          color1="#0F0E0D"
          color2="#1A0D52"
          color3="#E25B38"
          timeSpeed={1.8}
          colorBalance={0}
          warpStrength={1.2}
          warpFrequency={4}
          warpSpeed={1.5}
          warpAmplitude={40}
          blendAngle={0}
          blendSoftness={0.08}
          rotationAmount={300}
          noiseScale={2}
          grainAmount={0.15}
          grainScale={2}
          grainAnimated={true}
          contrast={1.4}
          gamma={1}
          saturation={1.2}
          centerX={0}
          centerY={0}
          zoom={0.85}
        />
      </div>

      {/* Header de la Card */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF9FFC] bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            ★ Sélection À La Une
          </span>
          <span className="hidden lg:inline-block text-xs font-mono text-stone-300">
            [ Défilé des Créateurs ]
          </span>
        </div>

        <div className="text-xs font-mono text-stone-400 hidden sm:block">
          {items.length} PRODUITS EXCLUSIFS
        </div>
      </div>

      {/* VERSION MOBILE / TABLETTE (< lg) : Pile 3D Interactive */}
      <div className="relative z-10 block lg:hidden w-full">
        <FeaturedStackCard products={products} />
      </div>

      {/* VERSION DESKTOP (>= lg) : Bannière Large avec 3 produits dépliés côte à côte */}
      <div className="relative z-10 hidden lg:grid grid-cols-3 gap-6 w-full items-stretch">
        {items.slice(0, 3).map((product, idx) => {
          const displayPrice = product.promoPrice ?? product.price;

          return (
            <div
              key={product._id}
              className="group relative rounded-2xl overflow-hidden bg-black/40 border border-white/10 backdrop-blur-md transition-all duration-500 hover:border-[#E25B38]/50 hover:-translate-y-1 flex flex-col justify-between p-4"
            >
              {/* Conteneur Image */}
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-stone-900 mb-4">
                {product.images[0] && (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1200px) 33vw, 300px"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                
                {/* Badge Index */}
                <span className="absolute top-3 left-3 text-[10px] font-mono bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-stone-300">
                  0{idx + 1}
                </span>

                {/* Badge Prix */}
                <span className="absolute top-3 right-3 text-xs font-mono font-bold bg-white/90 backdrop-blur-md text-stone-900 px-2.5 py-0.5 rounded-full">
                  {displayPrice} MAD
                </span>
              </div>

              {/* Infos Produit */}
              <div className="space-y-1">
                <p className="text-[11px] font-mono uppercase tracking-widest text-stone-400 truncate">
                  {product.shop?.name}
                </p>
                <h3 className="font-serif-editorial italic text-xl truncate text-white group-hover:text-[#FF9FFC] transition-colors">
                  {product.name}
                </h3>
              </div>

              {/* Bouton Lien */}
              <div className="pt-3 border-t border-white/10 mt-3 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-stone-400">Découvrir</span>
                <Link
                  href={`/${product.shop?.slug}/${product.slug}`}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#E25B38] border border-white/20 flex items-center justify-center text-white text-xs transition-colors"
                >
                  →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Légende Desktop */}
      <div className="relative z-10 hidden lg:flex items-center justify-between pt-6 border-t border-white/10 text-[11px] font-mono text-stone-400">
        <span>* MIS À JOUR EN TEMPS RÉEL PAR NOS ALGORITHMES</span>
        <span>DÉFILEMENT AUTOMATIQUE DU CATALOGUE</span>
      </div>
    </div>
  );
}