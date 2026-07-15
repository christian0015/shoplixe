// components/heros/FluxImagePlane.tsx
'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Vertex : la géométrie ondule autour du point pointé par le curseur (uMouse),
// comme une membrane liquide — c'est la vraie "déformation" du Flux 3D,
// pas un simple hover binaire.
const vertexShader = `
  uniform vec2 uMouse;
  uniform float uMouseStrength;
  uniform float uTime;
  uniform float uReveal;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    vUv = uv;
    vec3 pos = position;

    float distToMouse = distance(uv, uMouse);
    float ripple = sin(distToMouse * 22.0 - uTime * 3.2) * exp(-distToMouse * 3.5);
    float wave = ripple * uMouseStrength * 0.18;

    float ambient = sin(uv.x * 6.0 + uTime * 0.6) * cos(uv.y * 5.0 - uTime * 0.4) * 0.012;

    pos.z += wave + ambient;
    vWave = wave;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment : un voile de scan-lines balaie l'image au chargement (uReveal),
// puis une légère aberration chromatique suit l'amplitude de la vague.
const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uReveal;
  uniform float uTime;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    vec2 uv = vUv;
    float shift = vWave * 0.6;

    float r = texture2D(uTexture, uv + vec2(shift, 0.0)).r;
    float g = texture2D(uTexture, uv).g;
    float b = texture2D(uTexture, uv - vec2(shift, 0.0)).b;
    vec3 color = vec3(r, g, b);

    float wipe = smoothstep(uv.y - 0.06, uv.y + 0.06, uReveal * 1.15 - 0.08);
    float scan = step(0.5, fract((uv.y + uTime * 0.05) * 140.0)) * 0.06;

    float alpha = mix(0.0, 1.0, wipe);
    color += scan * (1.0 - wipe);

    gl_FragColor = vec4(color, alpha);
  }
`;

function Plane({ image }: { image: string }) {
  const texture = useTexture(image) as THREE.Texture;
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, pointer } = useThree();
  const mouseTarget = useRef(new THREE.Vector2(0.5, 0.5));
  const mouseStrength = useRef(0);
  const reveal = useRef(0);

  useFrame((state, delta) => {
    // pointer three.js va de -1..1 -> on le ramène en espace UV 0..1
    const targetU = pointer.x * 0.5 + 0.5;
    const targetV = pointer.y * 0.5 + 0.5;
    mouseTarget.current.x = THREE.MathUtils.lerp(mouseTarget.current.x, targetU, delta * 3.5);
    mouseTarget.current.y = THREE.MathUtils.lerp(mouseTarget.current.y, targetV, delta * 3.5);
    mouseStrength.current = THREE.MathUtils.lerp(mouseStrength.current, 1, delta * 2.2);
    reveal.current = THREE.MathUtils.lerp(reveal.current, 1, delta * 1.6);

    if (materialRef.current) {
      const u = materialRef.current.uniforms;
      (u.uMouse.value as THREE.Vector2).copy(mouseTarget.current);
      u.uMouseStrength.value = mouseStrength.current;
      u.uTime.value = state.clock.elapsedTime;
      u.uReveal.value = reveal.current;
    }
  });

  const img = texture.image as { width?: number; height?: number } | undefined;
  const aspect = img?.width && img?.height ? img.width / img.height : 1;
  const targetH = Math.min(viewport.height * 0.72, 5.2);
  const [w, h] = aspect > 1 ? [targetH * aspect, targetH] : [targetH * aspect, targetH];

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMouseStrength: { value: 0 },
      uTime: { value: 0 },
      uReveal: { value: 0 },
    }),
    [texture]
  );

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[w, h, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

/**
 * Plan-image en verre liquide, réactif au curseur — pièce centrale du hero Flux 3D.
 * À monter seulement côté client (dynamic import, ssr: false).
 */
export function FluxImagePlane({ image }: { image: string }) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 4.4], fov: 32 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Suspense fallback={null}>
        <Plane image={"https://klin-official.vercel.app/_next/image?url=%2Fproducts%2Fhaut-veste001-noir.jpeg&w=1080&q=75"} />
      </Suspense>
    </Canvas>
  );
}