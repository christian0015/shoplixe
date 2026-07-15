// components/LiquidGlassDefs.tsx
// Filtres SVG globaux — montés une fois dans le layout racine.
// Le vrai coeur du liquid glass : une feTurbulence + feDisplacementMap chaînées,
// utilisées via backdrop-filter: blur(...) url(#lg-distort-*) sur les éléments .glass-card.
// Safari ignore l'url() dans backdrop-filter et retombe sur le blur seul (fallback géré en CSS).
export function LiquidGlassDefs() {
  return (
    <svg aria-hidden focusable="false" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
      <defs>
        {/* Variante douce — cartes produit, petites surfaces */}
        <filter id="lg-distort-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="7" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="28" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* Variante forte — headers, grandes surfaces, ondulation plus marquée */}
        <filter id="lg-distort-strong" x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence type="fractalNoise" baseFrequency="0.009 0.012" numOctaves="2" seed="8" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="2.5" result="blurredNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="45" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* Bordure "néo-chromatique" : liseré qui sépare RGB comme une aberration chromatique de verre */}
        <filter id="lg-edge-chromatic" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.03" numOctaves="1" seed="3" result="edgeNoise" />
          <feDisplacementMap in="SourceGraphic" in2="edgeNoise" scale="6" xChannelSelector="R" yChannelSelector="B" />
        </filter>
      </defs>
    </svg>
  );
}