'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
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
  frameColor: string;
  accent: string;
  mobile: boolean;
  progressRef: React.MutableRefObject<number>;
  onProject: (index: number, sx: number, sy: number, visible: boolean, focus: number) => void;
  onActiveIndexChange: (index: number) => void;
}

// Plages de visibilité réajustées :
// FAR élargi pour offrir cet aperçu subtil du produit suivant en arrière-plan.
// NEAR augmenté pour faire disparaître l'image actuelle un peu plus tôt lors de la traversée.
const FAR_START = 5.2;
const FAR_END = 3.2;
const NEAR_START = 2.6;
const NEAR_END = 0.8;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function pieceOpacity(absD: number) {
  const farT = clamp((FAR_START - absD) / (FAR_START - FAR_END), 0, 1);
  const nearT = clamp((absD - NEAR_END) / (NEAR_START - NEAR_END), 0, 1);
  return Math.min(farT, nearT);
}

function ImagePlane({
  url,
  maxW,
  maxH,
  imgMatRef,
}: {
  url: string;
  maxW: number;
  maxH: number;
  imgMatRef: React.MutableRefObject<THREE.MeshBasicMaterial | null>;
}) {
  const texture = useTexture(url);
  const { w, h } = useMemo(() => {
    const ratio = texture.image ? texture.image.width / texture.image.height : 1;
    if (ratio >= maxW / maxH) return { w: maxW, h: maxW / ratio };
    return { w: maxH * ratio, h: maxH };
  }, [texture, maxW, maxH]);

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial ref={imgMatRef} map={texture} toneMapped={false} transparent opacity={1} />
    </mesh>
  );
}

function ProductPiece({
  index,
  item,
  pos,
  maxW,
  maxH,
  mobile,
}: {
  index: number;
  item: SceneProduct;
  pos: PlanePosition;
  maxW: number;
  maxH: number;
  mobile: boolean;
}) {
  const router = useRouter();
  const groupRef = useRef<THREE.Group>(null);
  const imgMatRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock, camera }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const floatY = Math.sin(t * 0.6 + index) * 0.05;
    const floatRotY = Math.sin(t * 0.35 + index * 1.3) * 0.03;

    const absD = Math.abs(camera.position.z - pos.z);
    const opacity = pieceOpacity(absD);

    if (imgMatRef.current) imgMatRef.current.opacity = opacity;

    if (mobile) {
      const xFactor = clamp((absD - NEAR_END) / (FAR_END - NEAR_END), 0, 1);
      groupRef.current.position.x = pos.x * xFactor;
      groupRef.current.position.y = pos.y + floatY;
      groupRef.current.rotation.y = pos.rotY * xFactor + floatRotY;
    } else {
      groupRef.current.position.x = pos.x;
      groupRef.current.position.y = pos.y + floatY;
      groupRef.current.rotation.y = pos.rotY + floatRotY;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[mobile ? 0 : pos.x, pos.y, pos.z]}
      rotation={[0, mobile ? 0 : pos.rotY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        router.push(item.href);
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {item.image && (
        <Suspense fallback={null}>
          <ImagePlane url={item.image} maxW={maxW} maxH={maxH} imgMatRef={imgMatRef} />
        </Suspense>
      )}
    </group>
  );
}

function Rig({
  positions,
  progressRef,
  onProject,
  onActiveIndexChange,
  mobile,
}: Pick<SceneProps, 'positions' | 'progressRef' | 'onProject' | 'onActiveIndexChange' | 'mobile'>) {
  const { camera, size } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const vec = useMemo(() => new THREE.Vector3(), []);
  const lastActiveRef = useRef(0);

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

    // Offsets légèrement réhaussés pour prendre du recul sur la scène
    const cruiseOffset = mobile ? 3.8 : 4.8;
    const closeOffset = mobile ? 1.6 : 1.8;
    const introPortion = 0.14;
    const outroPortion = 0.14;
    const midPortion = 1 - introPortion - outroPortion;

    let camZ: number;
    if (progress <= introPortion) {
      const t = progress / introPortion;
      const eased = 1 - Math.pow(1 - t, 3);
      camZ = THREE.MathUtils.lerp(first.z + closeOffset, first.z + cruiseOffset, eased);
    } else if (progress >= 1 - outroPortion) {
      const t = (progress - (1 - outroPortion)) / outroPortion;
      const eased = Math.pow(t, 3);
      camZ = THREE.MathUtils.lerp(last.z + cruiseOffset, last.z + closeOffset, t);
    } else {
      const t = (progress - introPortion) / midPortion;
      camZ = THREE.MathUtils.lerp(first.z + cruiseOffset, last.z + cruiseOffset, t);
    }

    camera.position.z = camZ;
    // Lerp augmenté pour plus de réactivité dans le suivi
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.current.x * (mobile ? 0.1 : 0.35), 0.1);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.1 + mouse.current.y * (mobile ? 0.06 : 0.18), 0.1);
    camera.lookAt(camera.position.x * 0.4, 0, camZ - 4.4);

    let nearestIdx = 0;
    let minScore = Infinity;

    positions.forEach((p, i) => {
      vec.set(mobile ? 0 : p.x, p.y, p.z).project(camera);
      const sx = (vec.x * 0.5 + 0.5) * size.width;
      const sy = (-vec.y * 0.5 + 0.5) * size.height;
      const visible = vec.z < 0.98;
      const absD = Math.abs(camZ - p.z);
      const focus = pieceOpacity(absD);
      onProject(i, sx, sy, visible, focus);

      const directionBias = camZ > p.z ? -1.6 : 0;
      const score = absD + directionBias;

      if (score < minScore) {
        minScore = score;
        nearestIdx = i;
      }
    });

    if (nearestIdx !== lastActiveRef.current) {
      lastActiveRef.current = nearestIdx;
      onActiveIndexChange(nearestIdx);
    }
  });

  return null;
}

export default function Scene({ items, positions, frameColor, accent, mobile, progressRef, onProject, onActiveIndexChange }: SceneProps) {
  const maxW = mobile ? 1.5 : 2.8;
  const maxH = mobile ? 1.9 : 2.0;
  // FOV réduit pour éloigner le plan de caméra et éviter le zoom trop agressif
  const fov = mobile ? 46 : 36;

  return (
    <Canvas
      dpr={[1, mobile ? 1.5 : 1.8]}
      camera={{ fov, position: [0, 0.1, positions[0]?.z + (mobile ? 1.6 : 1.8) || 2] }}
      gl={{ antialias: true, alpha: true }}
    >
      <fog attach="fog" args={[frameColor, 4, 16]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[2, 3, 4]} intensity={0.5} color={accent} />

      {items.map((item, i) => (
        <ProductPiece key={item.id} index={i} item={item} pos={positions[i]} maxW={maxW} maxH={maxH} mobile={mobile} />
      ))}

      <Rig positions={positions} progressRef={progressRef} onProject={onProject} onActiveIndexChange={onActiveIndexChange} mobile={mobile} />
    </Canvas>
  );
}