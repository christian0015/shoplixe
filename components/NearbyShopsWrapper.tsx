// components/NearbyShopsWrapper.tsx
'use client';

import nextDynamic from 'next/dynamic';

// On utilise { ssr: false } ICI, dans un fichier 'use client' !
const NearbyShopsSection = nextDynamic(
  () => import('@/components/NearbyShopsSection').then((mod) => mod.NearbyShopsSection),
  { ssr: false }
);

export function NearbyShopsWrapper() {
  return <NearbyShopsSection />;
}