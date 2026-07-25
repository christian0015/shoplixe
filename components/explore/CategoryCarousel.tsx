// components/explore/CategoryCarousel.tsx
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { ShopCategory } from '@/types';

interface CategoryItem {
  value: ShopCategory;
  label: string;
  icon: React.ReactNode;
}

const CATEGORY_ITEMS: CategoryItem[] = [
  {
    value: 'fashion',
    label: 'MODE',
    icon: (
      <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
      </svg>
    ),
  },
  {
    value: 'tech',
    label: 'INFORMATIQUE',
    icon: (
      <svg className="w-5 h-5 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    value: 'food',
    label: 'ALIMENTATION',
    icon: (
      <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="3" />
      </svg>
    ),
  },
  {
    value: 'beauty',
    label: 'BEAUTÉ',
    icon: (
      <svg className="w-5 h-5 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a7 7 0 00-7 7c0 2.38 1.19 4.47 3 5.74V17a3 3 0 003 3h2a3 3 0 003-3v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 00-7-7z" />
        <path d="M9 21h6" />
      </svg>
    ),
  },
  {
    value: 'home',
    label: 'MAISON',
    icon: (
      <svg className="w-5 h-5 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 20h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
        <path d="M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        <rect x="9" y="11" width="6" height="4" rx="1" />
      </svg>
    ),
  },
  {
    value: 'crafts',
    label: 'ARTISANAT',
    icon: (
      <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.5-.71 1.5-1.5 0-.41-.15-.79-.42-1.08-.27-.29-.42-.68-.42-1.11 0-.91.81-1.63 1.72-1.54 2.87.29 5.62-1.8 5.62-4.77 0-5.52-4.48-10-10-10z" />
      </svg>
    ),
  },
  {
    value: 'services',
    label: 'RÉPARATION',
    icon: (
      <svg className="w-5 h-5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    value: 'other',
    label: 'AUTRES',
    icon: (
      <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
      </svg>
    ),
  },
];

export function CategoryCarousel() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 snap-x scrollbar-none -mx-6 px-6">
      {CATEGORY_ITEMS.map((cat) => {
        const isActive = activeCategory === cat.value;

        return (
          <Link
            key={cat.value}
            href={`/search?category=${cat.value}`}
            className={`shrink-0 snap-start flex items-center gap-2.5 px-5 py-2.5 rounded-full border transition-all duration-300 shadow-sm ${
              isActive
                ? 'bg-stone-900 border-stone-900 text-white shadow-md'
                : 'bg-white/80 backdrop-blur-md border-stone-200/80 text-stone-700 hover:border-stone-400 hover:bg-white'
            }`}
          >
            <span className="shrink-0 transition-transform duration-300 group-hover:scale-110">
              {cat.icon}
            </span>
            <span className="text-xs font-mono font-medium tracking-wide">
              {cat.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}