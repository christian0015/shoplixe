// app/LandingHero.tsx
'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import Dither from '@/components/reactbits/Dither';
// / --- imports des fonds — garde uniquement celui que tu utilises actif ---
import Grainient from '@/components/reactbits/Grainient';
import LaserFlow from '@/components/reactbits/LaserFlow';
import ColorBends from '@/components/reactbits/ColorBends';

export function LandingHero() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    if (badgeRef.current) tl.from(badgeRef.current, { y: -10, opacity: 0, duration: 0.4, ease: 'power2.out' });
    if (headlineRef.current) {
      const words = headlineRef.current.querySelectorAll('.word');
      tl.from(words, { y: 50, opacity: 0, stagger: 0.08, duration: 0.6, ease: 'power3.out' }, '-=0.1');
    }
    if (cardRef.current) {
      tl.from(cardRef.current, { scale: 0.9, opacity: 0, duration: 0.6, ease: 'back.out(1.4)' }, '-=0.4');
    }
  }, []);

  const words = ['Votre', 'vitrine.', 'Leur', 'WhatsApp.'];

  return (
    <main className="relative min-h-screen flex items-center overflow-hidden bg-[#FAFAF8]">
      {/* Fond subtil : dégradé + grille de points */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: 'radial-gradient(circle, #1C191722 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-orange/10 blur-3xl -translate-y-1/3 translate-x-1/4" />

      <div className="relative max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center w-full">
        <div>
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-xs font-medium text-stone-600 mb-6"
          >
            🇲🇦 Fait pour les vendeurs marocains
          </div>

          <h1
            ref={headlineRef}
            className="font-display font-extrabold text-5xl md:text-7xl leading-[1.05] text-stone-900"
          >
            {words.map((w, i) => (
              <span key={i} className="word inline-block mr-3">
                {w}
              </span>
            ))}
          </h1>

          <p className="mt-6 text-stone-500 text-lg max-w-md">
            Créez votre boutique en ligne en quelques minutes. Vos clients commandent, la conversation reste sur WhatsApp.
          </p>

          <div className="mt-8 flex items-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="inline-block px-6 py-3 rounded-xl bg-orange text-white font-medium hover:opacity-90 transition shadow-lg shadow-orange/20"
            >
              Créer ma boutique gratuitement
            </Link>
            <Link href="/explore" className="text-sm text-stone-500 underline hover:text-stone-700 transition">
              Voir des exemples de boutiques
            </Link>
          </div>

          <p className="mt-4 text-xs text-stone-400">Sans engagement · Gratuit pendant la bêta</p>
        </div>

        <div className="hidden md:flex justify-center">
          <div
            ref={cardRef}
            className="animate-float w-72 rounded-3xl border border-stone-200 bg-white shadow-2xl shadow-stone-900/10 p-5 space-y-4"
          >
            <div className="relative h-28 rounded-2xl bg-gradient-to-br from-orange/25 via-orange/10 to-stone-100 overflow-hidden">
              <div className="absolute bottom-2 left-2 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-sm font-bold text-stone-700">
                YF
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="h-3.5 w-28 rounded bg-stone-200" />
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">✓ Vérifié</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-stone-100 relative overflow-hidden">
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 h-2 rounded bg-stone-300/70" />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-amber-500 font-medium">★★★★★ 4.8</span>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500 text-white text-[11px] font-medium">
                WhatsApp
              </div>
            </div>
          </div>
        </div>
        <div style={{ width: '100%', height: 'auto', position: 'relative' }}>
          <Dither
            waveColor={[0.5,0.5,0.5]}
            disableAnimation={false}
            enableMouseInteraction
            mouseRadius={0.3}
            colorNum={4}
            waveAmplitude={0.38}
            waveFrequency={3}
            waveSpeed={0.1}
          />

        <Grainient
        color1="#FF9FFC"
        color2="#1a0d52"
        color3="#B497CF"
        timeSpeed={4.9}
        colorBalance={0}
        warpStrength={1}
        warpFrequency={5}
        warpSpeed={2}
        warpAmplitude={50}
        blendAngle={0}
        blendSoftness={0.05}
        rotationAmount={500}
        noiseScale={2}
        grainAmount={0.1}
        grainScale={2}
        grainAnimated={false}
        contrast={1.5}
        gamma={1}
        saturation={1}
        centerX={0}
        centerY={0}
        zoom={0.9}
      />

      {/* ============== BG OPTION 2 — LaserFlow (3.5/5, plus adapté thème tech/dark) ============== */}
      <LaserFlow
        color="#FF79C6"
        wispDensity={0.9}
        flowSpeed={0.85}
        verticalSizing={4.5}
        horizontalSizing={1.4}
        fogIntensity={0.5}
        fogScale={0.25}
        wispSpeed={15}
        wispIntensity={12}
        flowStrength={0.1}
        decay={1.5}
        horizontalBeamOffset={0}
        verticalBeamOffset={-0.5}
      />
     

      {/* ============== BG OPTION 3 — ColorBends (4/5, plus graphique/aplat) ============== */}
      <ColorBends
        rotation={90}
        speed={0.2}
        colors={['#3d17d7', '#3a0839', '#624f18']}
        transparent={false}
        autoRotate={0}
        scale={1}
        frequency={1}
        warpStrength={1}
        mouseInfluence={1}
        parallax={0.5}
        noise={0.15}
        iterations={1}
        intensity={1.5}
        bandWidth={6}
      />
      
        </div>
      </div>
    </main>
  );
}
