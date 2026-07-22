'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, Float } from '@react-three/drei';
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

// ============================================================
// ENVIRONNEMENT OCÉANIQUE & ASSETS CONCENTRÉS (AWWWARDS)
// ============================================================

/** Micro-bulles & particules marines concentrées dans l'axe de vision */
function OceanBubbles({ count = 180, accent }: { count?: number; accent: string }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, scales, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sca = new Float32Array(count);
    const spd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Resserré sur l'axe X/Y pour rester directement sous les yeux de l'utilisateur
      pos[i * 3] = (Math.random() - 0.5) * 5.5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5.0;
      pos[i * 3 + 2] = -Math.random() * 38; 

      sca[i] = Math.random() * 0.05 + 0.015;
      spd[i] = Math.random() * 0.008 + 0.003; // Vitesse de remontée de la bulle
    }
    return [pos, sca, spd];
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;
    const array = posAttr.array as Float32Array;

    // Fait monter doucement les bulles vers le haut (effet sous-marin)
    for (let i = 0; i < count; i++) {
      array[i * 3 + 1] += speeds[i];
      if (array[i * 3 + 1] > 3) {
        array[i * 3 + 1] = -3;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-scale" args={[scales, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color={accent}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/** Formes 3D style "cristaux / plancton géométrique" bien cadrés dans le champ visuel */
function OceanAssets({ positions, accent }: { positions: PlanePosition[]; accent: string }) {
  const groupRef = useRef<THREE.Group>(null);

  const assets = useMemo(() => {
    if (!positions.length) return [];
    const items = [];
    const countPerProduct = 3; // Plus nombreux

    for (let i = 0; i < positions.length; i++) {
      const zPos = positions[i].z;
      for (let j = 0; j < countPerProduct; j++) {
        items.push({
          id: `ocean-ast-${i}-${j}`,
          // Concentrés très près de l'axe de vision (-1.8 à +1.8)
          x: (Math.random() - 0.5) * 3.2,
          y: (Math.random() - 0.5) * 2.8,
          z: zPos + (Math.random() - 0.5) * 1.8,
          scale: Math.random() * 0.14 + 0.05,
          type: Math.floor(Math.random() * 3),
        });
      }
    }
    return items;
  }, [positions]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      // Rotation lente façon objet en apesanteur dans l'eau
      child.rotation.x = Math.sin(t * 0.4 + i) * 0.5;
      child.rotation.y = t * 0.25 + i;
    });
  });

  return (
    <group ref={groupRef}>
      {assets.map((ast) => (
        <Float key={ast.id} speed={1.5} rotationIntensity={0.8} floatIntensity={1.2}>
          <mesh position={[ast.x, ast.y, ast.z]} scale={ast.scale}>
            {ast.type === 0 && <icosahedronGeometry args={[1, 0]} />}
            {ast.type === 1 && <torusGeometry args={[0.7, 0.25, 12, 20]} />}
            {ast.type === 2 && <octahedronGeometry args={[1, 0]} />}
            <meshStandardMaterial
              color={accent}
              wireframe
              transparent
              opacity={0.22}
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// ============================================================
// COMPOSANTS SCÈNE & PRODUITS
// ============================================================

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
    // Houle aqueuse fluide sur les cartes
    const floatY = Math.sin(t * 0.8 + index) * 0.06;
    const floatRotY = Math.sin(t * 0.4 + index * 1.2) * 0.035;

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

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const progress = progressRef.current;
    const first = positions[0];
    const last = positions[positions.length - 1];

    const cruiseOffset = mobile ? 3.8 : 4.8;
    const closeOffset = mobile ? 1.6 : 1.8;
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

    // Effet d'ondulation marine subtile sur la caméra
    const waterWaveX = Math.sin(t * 1.2) * 0.04;
    const waterWaveY = Math.cos(t * 0.9) * 0.04;

    camera.position.z = camZ;

    // LERP encore plus élevé (0.18) pour une réactivité et une fluidité maximale
    const targetX = mouse.current.x * (mobile ? 0.1 : 0.35) + waterWaveX;
    const targetY = 0.1 + mouse.current.y * (mobile ? 0.06 : 0.18) + waterWaveY;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.18);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.18);
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
  const fov = mobile ? 46 : 36;

  return (
    <Canvas
      dpr={[1, mobile ? 1.5 : 1.8]}
      camera={{ fov, position: [0, 0.1, positions[0]?.z + (mobile ? 1.6 : 1.8) || 2] }}
      gl={{ antialias: true, alpha: true }}
    >
      {/* Brouillard aquatique teinté */}
      <fog attach="fog" args={[frameColor, 2, 16]} />
      
      <ambientLight intensity={0.7} />
      {/* Lumière supérieure simulant les rayons du soleil perçant la surface */}
      <directionalLight position={[0, 8, 2]} intensity={0.9} color={accent} />
      {/* Lueur sous-marine d'ambiance */}
      <pointLight position={[0, -2, -12]} intensity={0.5} color={accent} />

      {/* Ambiance sous-marine */}
      <OceanBubbles count={mobile ? 80 : 180} accent={accent} />
      <OceanAssets positions={positions} accent={accent} />

      {/* Produits */}
      {items.map((item, i) => (
        <ProductPiece key={item.id} index={i} item={item} pos={positions[i]} maxW={maxW} maxH={maxH} mobile={mobile} />
      ))}

      <Rig positions={positions} progressRef={progressRef} onProject={onProject} onActiveIndexChange={onActiveIndexChange} mobile={mobile} />
    </Canvas>
  );
}