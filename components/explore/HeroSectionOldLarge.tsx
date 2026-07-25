// components/explore/HeroSection.tsx
'use client';

import dynamic from 'next/dynamic';
import { FeaturedStackCard } from './FeaturedStackCard';
import type { ProductSearchResult } from '@/types';

const Grainient = dynamic(() => import('@/components/reactbits/Grainient'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#0F0E0D]" />,
});

export function HeroSection({ featuredProducts }: { featuredProducts: ProductSearchResult[] }) {
  return (
    <section className="relative rounded-3xl overflow-hidden border border-stone-200/50 shadow-2xl text-[#FAF8F5]">
      {/* Background WebGL Shader */}
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

      <div className="relative z-10 p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Colonne Gauche Textes */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono uppercase tracking-widest text-[#FF9FFC]">
            <span className="w-2 h-2 rounded-full bg-[#E25B38] animate-ping" />
            Curated Showcase
          </div>

          <h1 className="font-serif-editorial italic text-5xl sm:text-6xl md:text-7xl font-normal leading-[1.02] text-white">
            L’élégance du commerce direct.
          </h1>

          <p className="text-stone-300 font-sans text-base sm:text-lg max-w-xl font-light leading-relaxed">
            Parcourez les univers uniques façonnés par nos créateurs indépendants. Une sélection minutieuse en prise directe avec les studios ateliers.
          </p>

          <div className="pt-4 flex flex-wrap gap-6 text-xs font-mono text-stone-400 border-t border-white/10">
            <div><span className="text-white">01.</span> ARTISANAT AUTHENTIQUE</div>
            <div><span className="text-white">02.</span> EXPÉDITION DIRECTE</div>
          </div>
        </div>

        {/* Colonne Droite : Pile Produit Sponsoring 3D */}
        <div className="lg:col-span-5 flex justify-center">
          <FeaturedStackCard products={featuredProducts} />
        </div>
      </div>
    </section>
  );
}