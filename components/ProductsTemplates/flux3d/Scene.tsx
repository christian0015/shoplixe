// components/ProductsTemplates/flux3d/Scene.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
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

const FAR_START = 6.0;
const FAR_END = 3.8;
const NEAR_START = 2.8;
const NEAR_END = 0.8;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function pieceOpacity(absD: number) {
  const farT = clamp((FAR_START - absD) / (FAR_START - FAR_END), 0, 1);
  const nearT = clamp((absD - NEAR_END) / (NEAR_START - NEAR_END), 0, 1);
  return Math.min(farT, nearT);
}

function createFallbackTexture(text: string = 'PRODUIT') {
  if (typeof window === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background moderne
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#111827');
  grad.addColorStop(1, '#1f2937');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Border
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 12;
  ctx.strokeRect(20, 20, 472, 472);

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.slice(0, 15).toUpperCase(), 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createCircleTexture() {
  if (typeof window === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.45)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(32, 32, 32, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function DenseOceanDust({ count = 280, accent, extendedDepth }: { count?: number; accent: string; extendedDepth: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const circleTexture = useMemo(() => createCircleTexture(), []);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8.0;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 7.0;
      pos[i * 3 + 2] = 4 - Math.random() * (extendedDepth + 15);
      spd[i] = Math.random() * 0.005 + 0.0015;
    }
    return [pos, spd];
  }, [count, extendedDepth]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      array[i * 3 + 1] += speeds[i];
      if (array[i * 3 + 1] > 3.5) array[i * 3 + 1] = -3.5;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.11}
        map={circleTexture || undefined}
        color={accent}
        transparent
        opacity={0.42}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function DenseOceanAssets({ positions, accent }: { positions: PlanePosition[]; accent: string }) {
  const groupRef = useRef<THREE.Group>(null);

  const assets = useMemo(() => {
    if (!positions.length) return [];
    const items = [];
    const countPerProduct = 4;

    for (let i = 0; i < positions.length; i++) {
      const zPos = positions[i].z;
      for (let j = 0; j < countPerProduct; j++) {
        items.push({
          id: `dense-ast-${i}-${j}`,
          x: (Math.random() - 0.5) * 3.6,
          y: (Math.random() - 0.5) * 3.0,
          z: zPos + (Math.random() - 0.5) * 2.8,
          scale: Math.random() * 0.11 + 0.045,
          type: (i + j) % 3,
        });
      }
    }
    return items;
  }, [positions]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      child.rotation.x = Math.sin(t * 0.35 + i) * 0.45;
      child.rotation.y = t * 0.22 + i;
    });
  });

  return (
    <group ref={groupRef}>
      {assets.map((ast) => (
        <Float key={ast.id} speed={1.4} rotationIntensity={0.7} floatIntensity={0.9}>
          <mesh position={[ast.x, ast.y, ast.z]} scale={ast.scale}>
            {ast.type === 0 && <icosahedronGeometry args={[1, 0]} />}
            {ast.type === 1 && <torusGeometry args={[0.7, 0.25, 12, 20]} />}
            {ast.type === 2 && <octahedronGeometry args={[1, 0]} />}
            <meshStandardMaterial
              color={accent}
              wireframe
              transparent
              opacity={0.24}
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/**
 * ImagePlane Securisé : Evite les erreurs Runtime de chargement CORS / liens cassés
 */
function ImagePlane({
  url,
  maxW,
  maxH,
  imgMatRef,
}: {
  url: string | null;
  maxW: number;
  maxH: number;
  imgMatRef: React.MutableRefObject<THREE.MeshBasicMaterial | null>;
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [aspect, setAspect] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;

    if (!url) {
      const fallback = createFallbackTexture('Sans Visuel');
      if (isMounted) {
        setTexture(fallback);
        setAspect(1);
      }
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    loader.load(
      url,
      (loadedTex) => {
        if (!isMounted) return;
        const img = loadedTex.image;
        if (img && img.width && img.height) {
          setAspect(img.width / img.height);
        }
        setTexture(loadedTex);
      },
      undefined,
      () => {
        // En cas d'erreur réseau, CORS ou URL cassée
        if (!isMounted) return;
        console.warn(`[3D Scene] Impossible de charger l'image: ${url}. Activation du fallback.`);
        const fallback = createFallbackTexture('Image Indisponible');
        setTexture(fallback);
        setAspect(1);
      }
    );

    return () => {
      isMounted = false;
    };
  }, [url]);

  const { w, h } = useMemo(() => {
    if (aspect >= maxW / maxH) return { w: maxW, h: maxW / aspect };
    return { w: maxH * aspect, h: maxH };
  }, [aspect, maxW, maxH]);

  if (!texture) return null;

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
    const floatY = Math.sin(t * 0.7 + index) * 0.05;
    const floatRotY = Math.sin(t * 0.35 + index * 1.2) * 0.03;

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
      <ImagePlane url={item.image} maxW={maxW} maxH={maxH} imgMatRef={imgMatRef} />
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

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const progress = progressRef.current;
    const first = positions[0];
    const last = positions[positions.length - 1];

    const cruiseOffset = mobile ? 4.8 : 5.8;
    const closeOffset = mobile ? 2.0 : 2.4;
    const introPortion = 0.14;
    const outroPortion = 0.14;
    const midPortion = 1 - introPortion - outroPortion;

    let camZ: number;
    if (progress <= introPortion) {
      const p = progress / introPortion;
      const eased = 1 - Math.pow(1 - p, 3);
      camZ = THREE.MathUtils.lerp(first.z + closeOffset, first.z + cruiseOffset, eased);
    } else if (progress >= 1 - outroPortion) {
      const p = (progress - (1 - outroPortion)) / outroPortion;
      camZ = THREE.MathUtils.lerp(last.z + cruiseOffset, last.z + closeOffset, p);
    } else {
      const p = (progress - introPortion) / midPortion;
      camZ = THREE.MathUtils.lerp(first.z + cruiseOffset, last.z + cruiseOffset, p);
    }

    const waterWaveX = Math.sin(t * 1.1) * 0.03;
    const waterWaveY = Math.cos(t * 0.8) * 0.03;

    camera.position.z = camZ;

    const targetX = mouse.current.x * (mobile ? 0.1 : 0.3) + waterWaveX;
    const targetY = 0.1 + mouse.current.y * (mobile ? 0.05 : 0.15) + waterWaveY;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.18);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.18);
    camera.lookAt(camera.position.x * 0.3, 0, camZ - 5.0);

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
  const maxW = mobile ? 1.4 : 2.5;
  const maxH = mobile ? 1.8 : 1.9;
  const fov = mobile ? 38 : 30;

  const extendedDepth = useMemo(() => {
    if (!positions.length) return 20;
    return Math.abs(positions[positions.length - 1].z);
  }, [positions]);

  return (
    <Canvas
      dpr={[1, mobile ? 1.5 : 1.8]}
      camera={{ fov, position: [0, 0.1, positions[0]?.z + (mobile ? 2.0 : 2.4) || 2] }}
      gl={{ antialias: true, alpha: true }}
    >
      <fog attach="fog" args={[frameColor, 3, 22]} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[0, 8, 2]} intensity={0.85} color={accent} />
      <pointLight position={[0, -2, -12]} intensity={0.4} color={accent} />

      <DenseOceanDust count={mobile ? 120 : 300} accent={accent} extendedDepth={extendedDepth} />
      <DenseOceanAssets positions={positions} accent={accent} />

      {items.map((item, i) => (
        <ProductPiece key={item.id} index={i} item={item} pos={positions[i]} maxW={maxW} maxH={maxH} mobile={mobile} />
      ))}

      <Rig positions={positions} progressRef={progressRef} onProject={onProject} onActiveIndexChange={onActiveIndexChange} mobile={mobile} />
    </Canvas>
  );
}