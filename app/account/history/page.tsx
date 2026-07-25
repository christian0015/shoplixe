// app/account/history/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getHistory } from '@/lib/user-actions';
import { ProductCard } from '@/components/ProductCard';
import { themes } from '@/lib/themes';
import { ClearHistoryButton } from './ClearHistoryButton';

interface HistoryEntry {
  viewedAt: string;
  product: {
    _id: string;
    name: string;
    price: number;
    promoPrice: number | null;
    images: string[];
    available: boolean;
    slug: string;
    rating?: number;
    reviewsCount?: number;
    shop: { slug: string; name: string };
  };
}

const NAV_TABS = [
  { href: '/dashboard', label: 'Boutiques' },
  { href: '/account', label: 'Profil' },
  { href: '/account/favorites', label: 'Favoris' },
  { href: '/account/history', label: 'Historique' },
];

function SiteBar() {
  return (
    <div className="flex items-center justify-between mb-6">
      <Link href="/" className="font-serif-editorial text-lg italic text-stone-900">
        Shoplixe<span className="text-[#E25B38]">.</span>
      </Link>
      <div className="flex items-center gap-5 text-sm font-medium text-stone-500">
        <Link href="/" className="hover:text-stone-900 transition-colors">Accueil</Link>
        <Link href="/explore" className="hover:text-stone-900 transition-colors">Explorer</Link>
        <Link href="/search" className="hover:text-stone-900 transition-colors">Rechercher</Link>
      </div>
    </div>
  );
}

function AccountNav({ active }: { active: string }) {
  return (
    <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1 mb-10">
      {NAV_TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            tab.href === active
              ? 'bg-stone-900 text-stone-100 shadow-sm'
              : 'text-stone-500 hover:text-stone-900 hover:bg-stone-900/5'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

export default async function HistoryPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const history: HistoryEntry[] = await getHistory();

  return (
    <main className="min-h-screen bg-[#fafaf8] px-4 py-10 md:py-14">
      <div className="max-w-5xl mx-auto space-y-6">
        <SiteBar />
        <AccountNav active="/account/history" />

        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-orange mb-2">Mon espace</p>
            <h1 className="font-serif-editorial italic text-3xl md:text-4xl text-stone-900">Consultés récemment</h1>
          </div>
          {history.length > 0 && <ClearHistoryButton />}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-dashed border-stone-300">
            <p className="text-stone-400">Aucun produit consulté pour le moment.</p>
            <Link href="/explore" className="text-orange underline text-sm mt-3 inline-block font-medium">
              Explorer les boutiques
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {history.map(({ product, viewedAt }) => (
              <ProductCard
                key={`${product._id}-${viewedAt}`}
                product={product}
                shopSlug={product.shop.slug}
                theme={themes.minimal}
                isAuthenticated
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}