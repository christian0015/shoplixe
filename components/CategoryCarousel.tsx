// components/CategoryCarousel.tsx
import Link from 'next/link';
import { categories } from '@/lib/themes';

export function CategoryCarousel() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none -mx-4 px-4">
      {categories.map((cat) => (
        <Link
          key={cat.value}
          href={`/search?category=${cat.value}&tab=shops`}
          className="shrink-0 snap-start flex flex-col items-center gap-2 group"
        >
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-2xl group-hover:bg-stone-200 transition-colors">
            {cat.emoji}
          </div>
          <span className="text-xs text-stone-600 whitespace-nowrap">{cat.label}</span>
        </Link>
      ))}
    </div>
  );
}
