// components/heros/HeroSvgAccents.tsx
'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

/** Anneau dégradé chromatique qui tourne lentement en boucle — discret, coin de composition. */
export function LoopRing({ color, size = 140, className = '' }: { color: string; size?: number; className?: string }) {
  const ref = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const tween = gsap.to(ref.current, { rotate: 360, duration: 22, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
    return () => {
      tween.kill();
    };
  }, []);

  const id = `ring-grad-${color.replace('#', '')}`;

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`pointer-events-none ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <g ref={ref}>
        <circle cx="100" cy="100" r="86" fill="none" stroke={`url(#${id})`} strokeWidth="1.5" strokeDasharray="8 14" />
        <circle cx="100" cy="100" r="70" fill="none" stroke={`url(#${id})`} strokeWidth="0.75" strokeDasharray="2 10" />
      </g>
    </svg>
  );
}

/** Trait qui se dessine sous un titre quand il entre dans le viewport (stroke-dashoffset). */
export function ScrollUnderline({ color, width = 220, className = '' }: { color: string; width?: number; className?: string }) {
  const pathRef = useRef<SVGPathElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    const tween = gsap.to(path, {
      strokeDashoffset: 0,
      duration: 1.1,
      ease: 'power2.inOut',
      scrollTrigger: { trigger: wrapRef.current, start: 'top 85%' },
    });
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div ref={wrapRef} className={className}>
      <svg viewBox={`0 0 ${width} 16`} width={width} height={16} aria-hidden>
        <path
          ref={pathRef}
          d={`M2 8 Q ${width / 4} 2, ${width / 2} 8 T ${width - 2} 8`}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/** Blob organique qui respire lentement en boucle — coin de composition bento. */
export function FloatingBlob({ color, size = 260, className = '' }: { color: string; size?: number; className?: string }) {
  const ref = useRef<SVGPathElement>(null);

  const shapes = [
    'M45.3,-58.5C58.6,-49.6,68.9,-34.6,72.4,-18.1C75.9,-1.6,72.6,16.4,63.6,30.6C54.6,44.8,39.9,55.2,23.6,61.5C7.3,67.8,-10.6,70,-27.1,65.1C-43.6,60.2,-58.7,48.2,-66.8,32.6C-74.9,17,-76,-2.2,-70.1,-18.5C-64.2,-34.8,-51.3,-48.2,-36.7,-57C-22.1,-65.8,-11.1,-70,3.2,-74.1C17.4,-78.2,34.9,-67.4,45.3,-58.5Z',
    'M42.1,-54.8C53.8,-46.9,61.8,-32.6,65.6,-17C69.4,-1.4,69,15.5,61.6,28.8C54.2,42.1,39.8,51.8,24.2,58.2C8.6,64.6,-8.2,67.7,-23.9,63.6C-39.6,59.5,-54.2,48.2,-62.1,33.5C-70,18.8,-71.2,0.7,-66.8,-15.3C-62.4,-31.3,-52.4,-45.2,-39.4,-53.2C-26.4,-61.2,-13.2,-63.3,1.6,-65.5C16.4,-67.7,30.4,-62.7,42.1,-54.8Z',
  ];

  useEffect(() => {
    if (!ref.current) return;
    const tl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 6, ease: 'sine.inOut' } });
    tl.to(ref.current, { attr: { d: shapes[1] } });
    const float = gsap.to(ref.current.parentElement, { y: -16, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    return () => {
      tl.kill();
      float.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <svg viewBox="-100 -100 200 200" width={size} height={size} className={`pointer-events-none ${className}`} aria-hidden>
      <path ref={ref} d={shapes[0]} fill={color} opacity="0.35" />
    </svg>
  );
}

/** Grille de points qui pulsent doucement — texture de fond très discrète pour hero minimal. */
export function DotGridPulse({ color, className = '' }: { color: string; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const dots = ref.current?.querySelectorAll('circle');
    if (!dots?.length) return;
    const tween = gsap.to(dots, {
      opacity: 0.15,
      duration: 2.4,
      stagger: { each: 0.04, from: 'random', repeat: -1, yoyo: true },
      ease: 'sine.inOut',
    });
    return () => {
      tween.kill();
    };
  }, []);

  const cols = 18;
  const rows = 10;
  const cells: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push({ x: c * 40 + 20, y: r * 40 + 20 });

  return (
    <svg ref={ref} viewBox={`0 0 ${cols * 40} ${rows * 40}`} preserveAspectRatio="xMidYMid slice" className={`w-full h-full ${className}`} aria-hidden>
      {cells.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1.6" fill={color} opacity="0.5" />
      ))}
    </svg>
  );
}