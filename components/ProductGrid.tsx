// components/ProductGrid.tsx
'use client';

import { useEffect, useMemo, useRef, type RefObject } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { ProductCard, ProductCardData } from '@/components/ProductCard';
import type { ThemeTokens, ShopTemplate } from '@/types';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

interface GridProps {
  products: ProductCardData[];
  template: ShopTemplate;
  theme: ThemeTokens;
  accentColor?: string | null;
  shopSlug: string;
  isAuthenticated?: boolean;
  favoriteIds?: string[];
  /** Image utilisée comme "matière" à déformer derrière la grille en template liquidGlass */
  backgroundImage?: string | null;
}

export function ProductGrid({
  products,
  template,
  theme,
  accentColor,
  shopSlug,
  isAuthenticated = false,
  favoriteIds = [],
  backgroundImage,
}: GridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = containerRef.current?.querySelectorAll('.product-card');
    if (!cards?.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 34 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.05,
          ease: 'power2.out',
          scrollTrigger: { trigger: containerRef.current, start: 'top 85%' },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [products, template]);

  if (products.length === 0) {
    return (
      <p className="text-center py-16" style={{ color: theme.textMuted }}>
        Aucun produit pour le moment.
      </p>
    );
  }

  const palette = theme.bentoPalette && theme.bentoPalette.length > 0 ? theme.bentoPalette : [theme.accent];
  const cardProps = { theme, accentColor, shopSlug, isAuthenticated };

  // --- Template Bento : blocs étirés en flex-row/flex-col imbriqués, pas de CSS grid rigide ---
  if (template === 'bento') {
    return (
      <BentoLayout
        containerRef={containerRef}
        products={products}
        palette={palette}
        favoriteIds={favoriteIds}
        {...cardProps}
      />
    );
  }

  // --- Template Liquid Glass : cartes en verre au-dessus d'une image fixe (matière à déformer) ---
  if (template === 'liquidGlass') {
    return (
      <div className="relative rounded-[32px] overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {backgroundImage ? (
            <Image src={backgroundImage} alt="" fill className="object-cover" style={{ objectPosition: 'center' }} />
          ) : (
            <div className="absolute inset-0" style={{ background: theme.gradient ?? theme.bg }} />
          )}
          <div className="absolute inset-0 bg-black/30" />
          {/* grain SVG discret pour donner encore plus de "matière" à distordre */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.08] animate-grain-drift" aria-hidden>
            <filter id="lg-bg-grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#lg-bg-grain)" />
          </svg>
        </div>

        <div ref={containerRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 md:p-6">
          {products.map((product) => (
            <div key={product._id} className="aspect-[3/4]">
              <ProductCard product={product} template="liquidGlass" isFavorite={favoriteIds.includes(product._id)} {...cardProps} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Template Flux 3D : reveal produit en three.js au survol ---
  if (template === 'flux3d') {
    return (
      <div ref={containerRef} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            template="flux3d"
            isFavorite={favoriteIds.includes(product._id)}
            {...cardProps}
          />
        ))}
      </div>
    );
  }

  // --- Magazine : rythme éditorial, une carte large toutes les 3 ---
  if (template === 'magazine') {
    return (
      <div ref={containerRef} className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((product, idx) => (
          <div key={product._id} className={idx % 5 === 0 ? 'md:col-span-2' : ''}>
            <ProductCard
              product={product}
              template="magazine"
              isFavorite={favoriteIds.includes(product._id)}
              {...cardProps}
            />
          </div>
        ))}
      </div>
    );
  }

  // --- Grid : classique et lisible ---
  return (
    <div ref={containerRef} className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          template="grid"
          isFavorite={favoriteIds.includes(product._id)}
          {...cardProps}
        />
      ))}
    </div>
  );
}

// ============================================================
// Bento layout — groupe les produits par 6 et compose un bloc
// asymétrique (1 hero + 2 empilés + 3 en rangée) à chaque groupe.
// ============================================================
function BentoLayout({
  containerRef,
  products,
  palette,
  theme,
  accentColor,
  shopSlug,
  isAuthenticated,
  favoriteIds,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  products: ProductCardData[];
  palette: string[];
  theme: ThemeTokens;
  accentColor?: string | null;
  shopSlug: string;
  isAuthenticated: boolean;
  favoriteIds: string[];
}) {
  const groups = useMemo(() => {
    const out: ProductCardData[][] = [];
    for (let i = 0; i < products.length; i += 6) out.push(products.slice(i, i + 6));
    return out;
  }, [products]);

  const common = { theme, accentColor, shopSlug, isAuthenticated };

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      {groups.map((group, gi) => {
        const [a, b, c, d, e, f] = group;
        const colorAt = (i: number) => palette[(gi * 6 + i) % palette.length];

        return (
          <div key={gi} className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-3">
              {a && (
                <div className="md:flex-[2] h-[280px] md:h-[420px]">
                  <ProductCard
                    product={a}
                    template="bento"
                    paletteColor={colorAt(0)}
                    isFavorite={favoriteIds.includes(a._id)}
                    {...common}
                  />
                </div>
              )}
              {(b || c) && (
                <div className="flex flex-row md:flex-col gap-3 md:flex-1">
                  {b && (
                    <div className="flex-1 h-[200px] md:h-auto">
                      <ProductCard
                        product={b}
                        template="bento"
                        paletteColor={colorAt(1)}
                        isFavorite={favoriteIds.includes(b._id)}
                        {...common}
                      />
                    </div>
                  )}
                  {c && (
                    <div className="flex-1 h-[200px] md:h-auto">
                      <ProductCard
                        product={c}
                        template="bento"
                        paletteColor={colorAt(2)}
                        isFavorite={favoriteIds.includes(c._id)}
                        {...common}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {(d || e || f) && (
              <div className="flex flex-col md:flex-row gap-3">
                {[d, e, f].map((p, i) =>
                  p ? (
                    <div key={p._id} className="flex-1 h-[220px]">
                      <ProductCard
                        product={p}
                        template="bento"
                        paletteColor={colorAt(3 + i)}
                        isFavorite={favoriteIds.includes(p._id)}
                        {...common}
                      />
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}