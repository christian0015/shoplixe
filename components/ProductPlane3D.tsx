// components/ProductPlane3D.tsx
'use client';

import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Vertex : légère ondulation du plan (ripple) qui ne s'exprime qu'au survol (uHover).
const vertexShader = `
  uniform float uHover;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 pos = position;
    float dist = distance(uv, vec2(0.5));
    float ripple = sin(dist * 18.0 - uTime * 2.5) * 0.025 * uHover;
    pos.z += ripple;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment : au repos l'image est en niveaux de gris assourdis, au survol elle reprend
// ses couleurs — c'est ce contraste qui "révèle" le produit.
const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uHover;
  varying vec2 vUv;
  void main() {
    vec4 tex = texture2D(uTexture, vUv);
    float gray = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    vec3 grayColor = vec3(gray) * 0.82;
    vec3 color = mix(grayColor, tex.rgb, uHover);
    gl_FragColor = vec4(color, tex.a);
  }
`;

function Plane({ image }: { image: string }) {
  const texture = useTexture(image) as THREE.Texture;
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const hoverAmount = useRef(0);
  const scaleAmount = useRef(0.86);

  useFrame((state, delta) => {
    hoverAmount.current = THREE.MathUtils.lerp(hoverAmount.current, hovered ? 1 : 0, delta * 4.5);
    scaleAmount.current = THREE.MathUtils.lerp(scaleAmount.current, hovered ? 1.04 : 0.86, delta * 4.5);
    if (materialRef.current) {
      (materialRef.current.uniforms.uHover.value as number) = hoverAmount.current;
      (materialRef.current.uniforms.uTime.value as number) = state.clock.elapsedTime;
    }
    if (meshRef.current) {
      meshRef.current.scale.setScalar(scaleAmount.current);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, hovered ? 0.07 : 0, delta * 4.5);
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, hovered ? -0.05 : 0, delta * 4.5);
    }
  });

  const img = texture.image as { width?: number; height?: number } | undefined;
  const aspect = img?.width && img?.height ? img.width / img.height : 1;
  const [w, h] = aspect > 1 ? [1.7, 1.7 / aspect] : [1.7 * aspect, 1.7];

  return (
    <mesh ref={meshRef} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <planeGeometry args={[w, h, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        uniforms={{
          uTexture: { value: texture },
          uHover: { value: 0 },
          uTime: { value: 0 },
        }}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

/** Canvas léger — à monter uniquement quand la carte est visible (voir ProductCard). */
export function ProductPlane3D({ image }: { image: string }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 2.15], fov: 30 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Suspense fallback={null}>
        <Plane image={"/image.png"} />
      </Suspense>
    </Canvas>
  );
}