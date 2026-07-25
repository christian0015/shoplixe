// components/search/SearchRadarCanvas.tsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MagicRings = dynamic(() => import('@/components/reactbits/MagicRings'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#09080A]" />,
});

// Palettes chromatiques haut de gamme (Awwwards Vibe)
const LUXURY_PALETTES = [
  { color1: '#A855F7', color2: '#6366F1' }, // Indigo / Violet Royal
  { color1: '#E25B38', color2: '#F59E0B' }, // Terracotta / Ambre
  { color1: '#10B981', color2: '#3B82F6' }, // Émeraude / Bleu Profond
  { color1: '#EC4899', color2: '#8B5CF6' }, // Magenta / Pourpre Studio
];

export function SearchRadarCanvas({ isSearching = false }: { isSearching?: boolean }) {
  const [paletteIndex, setPaletteIndex] = useState(0);

  // Transition chromatique douce toutes les 12 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setPaletteIndex((prev) => (prev + 1) % LUXURY_PALETTES.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const currentPalette = LUXURY_PALETTES[paletteIndex];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#08070B]">
      {/* Halo de contraste central */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,13,22,0.5)_0%,rgba(8,7,11,0.98)_100%)] z-1" />

      {/* Dynamic MagicRings Background Canvas */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] opacity-65 transition-all duration-1000">
        <MagicRings
          color={currentPalette.color1}
          colorTwo={currentPalette.color2}
          ringCount={isSearching ? 8 : 6}
          speed={isSearching ? 1.8 : 0.8}
          attenuation={12}
          lineThickness={2}
          baseRadius={0.3}
          radiusStep={0.12}
          scaleRate={0.1}
          opacity={0.85}
          blur={0}
          noiseAmount={0.12}
          rotation={0}
          ringGap={1.4}
          fadeIn={0.8}
          fadeOut={0.6}
          followMouse={true}
          mouseInfluence={0.15}
          hoverScale={1.15}
          parallax={0.04}
          clickBurst={true}
        />
      </div>

      {/* Grille filigrane éditoriale */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-2" />
    </div>
  );
}