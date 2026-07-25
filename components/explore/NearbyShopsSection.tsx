// components/explore/NearbySection.tsx
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { NearbyShopsWrapper } from '@/components/NearbyShopsWrapper';

const Grainient = dynamic(() => import('@/components/reactbits/Grainient'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#1a0d52]" />,
});

export function NearbySection() {
  return (
    <section className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[300px] flex items-center p-8 md:p-12 text-[#FAF8F5]">
      {/* Background WebGL localisé */}
      <div className="absolute inset-0 z-0">
        <Grainient
          color1="#1a0d52"
          color2="#FF9FFC"
          color3="#B497CF"
          timeSpeed={2.5}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.12}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
      </div>

      <div className="relative z-10 w-full space-y-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-[#FF9FFC]">À Proximité</p>
          <h3 className="font-serif-editorial italic text-3xl md:text-4xl">Autour de votre position</h3>
        </div>
        <Suspense fallback={<div className="h-20 rounded-2xl bg-white/10 animate-pulse" />}>
          <NearbyShopsWrapper />
        </Suspense>
      </div>
    </section>
  );
}