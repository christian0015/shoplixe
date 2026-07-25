'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import gsap from 'gsap';
import type { Mesh } from 'three';

function HeroMesh() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.15;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
  });

  return (
    <Float speed={1.8} rotationIntensity={0.6} floatIntensity={0.8}>
      <mesh ref={meshRef} scale={1.3}>
        <torusKnotGeometry args={[1, 0.35, 320, 64]} />
        <MeshDistortMaterial
          // color="#FF9FFC"
          color="#1d520d"
          roughness={0.2}
          metalness={0.8}
          distort={0.635}
          speed={2}
          clearcoat={1}
        />
      </mesh>
    </Float>
  );
}

export function LandingHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });

      tl.from('.hero-badge', { y: -20, opacity: 0, delay: 0.2 })
        .from('.hero-title-line', { y: 60, opacity: 0, stagger: 0.12 }, '-=0.8')
        .from('.hero-sub', { y: 20, opacity: 0 }, '-=0.6')
        .from('.hero-cta', { scale: 0.95, opacity: 0, stagger: 0.1 }, '-=0.4')
        .from('.hero-preview', { y: 40, opacity: 0, duration: 1.4 }, '-=0.8');
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={heroRef} className="relative min-h-screen flex flex-col justify-between px-6 lg:px-12 pt-8 pb-12 overflow-hidden">
      
      {/* Canvas 3D d'arrière-plan */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-35">
        {mounted && (
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 5]} intensity={10.5} />
            <pointLight position={[-10, -10, -5]} color="#eb17e4" intensity={500} />
            <pointLight position={[-10, 10, -5]} color="#b3eb17" intensity={500} />
            <pointLight position={[10, 10, -5]} color="#17eb68" intensity={500} />
            <pointLight position={[10, -10, -5]} color="#eb5e17" intensity={500} />
            <HeroMesh />
          </Canvas>
        )}
      </div>

      {/* En-tête / Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-serif-editorial text-3xl font-normal tracking-tight text-stone-900">
            Shoplixe<span className="text-[#E25B38]">.</span>
          </span>
        </div>
        
        <nav className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-stone-600 hover:text-stone-950 transition-colors">
            Se connecter
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-full bg-stone-900 text-stone-100 text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition-all shadow-md"
          >
            Créer ma vitrine
          </Link>
        </nav>
      </header>

      {/* Hero Body */}
      <div className="relative z-10 max-w-7xl mx-auto w-full my-auto py-12 grid lg:grid-cols-12 gap-12 items-center">
        
        <div className="lg:col-span-7 space-y-8">
          <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel text-xs font-medium text-stone-700">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
            L’expérience de vente réinventée
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl leading-[0.98] tracking-tight text-stone-900">
            <span className="hero-title-line block font-serif-editorial italic">Sublimez vos produits.</span>
            <span className="hero-title-line block font-sans font-bold">Vendez en direct.</span>
          </h1>

          <p className="hero-sub text-stone-600 text-lg md:text-xl max-w-xl font-normal leading-relaxed">
            Créez un catalogue immersif en quelques clics. Offrez à vos clients une expérience fluide et recevez vos commandes directement sur votre téléphone.
          </p>

          <div className="hero-cta flex items-center gap-4 flex-wrap pt-2">
            <Link
              href="/signup"
              className="px-8 py-4 rounded-full bg-[#2e5e4d] text-white font-semibold text-sm hover:bg-[#518c76] transition-all shadow-xl shadow-[#5ac9a2]/20 hover:scale-[1.02]"
            >
              Lancer votre boutique
            </Link>
            <Link
              href="/explore"
              className="px-6 py-4 rounded-full glass-panel text-stone-800 font-semibold text-sm hover:bg-white/80 transition-all"
            >
              Découvrir les créateurs
            </Link>
          </div>
        </div>

        {/* Aperçu Vitrine Interactif */}
        <div className="hero-preview lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm rounded-3xl glass-panel-dark p-6 text-stone-100 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-800 border border-white/20 flex items-center justify-center font-serif-editorial text-lg italic text-[#E25B38]">
                  S
                </div>
                <div>
                  <p className="font-semibold text-sm">Studio Maison</p>
                  <p className="text-[11px] text-stone-400 font-mono">shoplixe.com/studio-maison</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#10b981]/10 text-[#10b981] text-[10px] font-mono border border-[#10b981]/20">
                ACTIF
              </span>
            </div>

            <div className="space-y-3">
              <div className="h-48 rounded-2xl bg-stone-800/80 border border-white/10 relative overflow-hidden flex flex-col justify-end p-4">
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur text-xs font-mono text-stone-200">
                  85 €
                </div>
                <p className="text-xs text-[#E25B38] font-mono uppercase tracking-widest">Édition Limitée</p>
                <p className="font-serif-editorial text-2xl italic">Vase Céramique Brute</p>
              </div>

              <div className="w-full py-3.5 rounded-xl bg-[#25D366] text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20">
                <span>Commander via WhatsApp</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer minimaliste */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between text-xs text-stone-500 font-mono pt-6 border-t border-stone-200/60">
        <p>© 2026 SHOPLIXE INC.</p>
        <p className="hidden sm:block">CONÇU POUR L’INDÉPENDANCE</p>
      </footer>
    </main>
  );
}