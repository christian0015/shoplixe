// components/ProductsTemplates/flux3d/Scene.tsx
'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';

export interface PlanePosition {
  x: number;
  y: number;
  z: number;
  rotY: number;
}

export interface SceneProduct {
  id: string;
  image: string | null;
  href: string;
}

interface SceneProps {
  items: SceneProduct[];
  positions: PlanePosition[];
  bg: string;
  accent: string;
  progressRef: React.MutableRefObject<number>;
  onProject: (index: number, sx: number, sy: number, visible: boolean, scale: number) => void;
}

const MAX_W = 3.1;
const MAX_H = 2.15;

/** Plan image — géométrie dimensionnée pour respecter l'aspect réel de la texture (équivalent object-contain en 3D, jamais d'étirement). */
function ImagePlane({ url, accent }: { url: string; accent: string }) {
  const texture = useTexture(url);
  const { w, h } = useMemo(() => {
    const ratio = texture.image ? texture.image.width / texture.image.height : 1;
    if (ratio >= MAX_W / MAX_H) return { w: MAX_W, h: MAX_W / ratio };
    return { w: MAX_H * ratio, h: MAX_H };
  }, [texture]);

  return (
    <mesh position={[0, 0, 0.03]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={texture} toneMapped={false} transparent />
      {/* Liseré fin façon passe-partout, dans la couleur accent du thème */}
      <mesh position={[0, 0, -0.001]}>
        <planeGeometry args={[w + 0.04, h + 0.04]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
    </mesh>
  );
}

function ProductPiece({
  index,
  item,
  pos,
  bg,
  accent,
}: {
  index: number;
  item: SceneProduct;
  pos: PlanePosition;
  bg: string;
  accent: string;
}) {
  const router = useRouter();
  const groupRef = useRef<THREE.Group>(null);

  // Léger mouvement "vivant" — respiration indépendante du scroll, jamais figé.
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = pos.y + Math.sin(t * 0.6 + index) * 0.05;
    groupRef.current.rotation.y = pos.rotY + Math.sin(t * 0.35 + index * 1.3) * 0.03;
  });

  return (
    <group
      ref={groupRef}
      position={[pos.x, pos.y, pos.z]}
      rotation={[0, pos.rotY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        router.push(item.href);
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* Cadre — passe-partout mat, toujours visible même pendant le chargement de la texture */}
      <RoundedBox args={[MAX_W + 0.4, MAX_H + 0.4, 0.06]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color={bg} roughness={0.9} metalness={0.05} />
      </RoundedBox>

      {item.image && (
        <Suspense fallback={null}>
          <ImagePlane url={item.image} accent={accent} />
        </Suspense>
      )}
    </group>
  );
}

function Rig({ positions, progressRef, onProject }: Pick<SceneProps, 'positions' | 'progressRef' | 'onProject'>) {
  const { camera, size } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const vec = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame(() => {
    const progress = progressRef.current;
    const first = positions[0];
    const last = positions[positions.length - 1];

    // Phase 1 (0 → 16%) : reveal — très gros plan sur la 1ère pièce, puis dolly-out.
    // Phase 2 (16% → 100%) : traversée du corridor jusqu'à la dernière pièce.
    const introPortion = 0.16;
    const closeZ = first.z + 1.55;
    const pulledZ = first.z + 4.6;
    const endZ = last.z + 4.6;

    let camZ: number;
    if (progress <= introPortion) {
      const t = progress / introPortion;
      const eased = 1 - Math.pow(1 - t, 3);
      camZ = THREE.MathUtils.lerp(closeZ, pulledZ, eased);
    } else {
      const t = (progress - introPortion) / (1 - introPortion);
      camZ = THREE.MathUtils.lerp(pulledZ, endZ, t);
    }

    camera.position.z = camZ;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.current.x * 0.35, 0.06);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.1 + mouse.current.y * 0.18, 0.06);
    camera.lookAt(camera.position.x * 0.4, 0, camZ - 4.4);

    // Projection écran de chaque pièce — pilote les cartels DOM superposés au Canvas.
    positions.forEach((p, i) => {
      vec.set(p.x, p.y, p.z).project(camera);
      const sx = (vec.x * 0.5 + 0.5) * size.width;
      const sy = (-vec.y * 0.5 + 0.5) * size.height;
      const visible = vec.z < 0.98;
      onProject(i, sx, sy, visible, 1 - Math.min(Math.max((p.z - camZ + 3) / -6, 0), 1));
    });
  });

  return null;
}

export default function Scene({ items, positions, bg, accent, progressRef, onProject }: SceneProps) {
  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ fov: 42, position: [0, 0.1, positions[0]?.z + 1.55 || 2] }}
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 4, 15]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[2, 3, 4]} intensity={0.5} color={accent} />

      {items.map((item, i) => (
        <ProductPiece key={item.id} index={i} item={item} pos={positions[i]} bg={bg} accent={accent} />
      ))}

      <Rig positions={positions} progressRef={progressRef} onProject={onProject} />
    </Canvas>
  );
}