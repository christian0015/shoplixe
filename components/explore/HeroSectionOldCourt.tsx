// components/explore/HeroSection.tsx
'use client';

import dynamic from 'next/dynamic';
import { FeaturedStackCard } from './FeaturedStackCard';
import type { ProductSearchResult } from '@/types';

const Grainient = dynamic(() => import('@/components/reactbits/Grainient'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#0F0E0D]" />,
});

export function HeroSection({ products }: { products: ProductSearchResult[] }) {
  return (
    <div className="relative w-full max-w-md rounded-3xl overflow-hidden p-6 shadow-2xl border border-stone-200/50 min-h-[460px] flex flex-col justify-between">
      {/* Background WebGL Grainient localisé */}
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

      <div className="relative z-10 mb-4 flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF9FFC] bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
          ★ Sélection À La Une
        </span>
      </div>

      <div className="relative z-10 w-full">
        <FeaturedStackCard products={products} />
      </div>
    </div>
  );
}