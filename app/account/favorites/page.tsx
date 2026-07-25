// app/account/favorites/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getFavorites } from '@/lib/user-actions';
import { ProductCard } from '@/components/ProductCard';
import { themes } from '@/lib/themes';
import { Badge } from '@/components/ui';

interface FavShop {
  _id: string;
  name: string;
  slug: string;
  logo: string | null;
  category: string;
}

interface FavProduct {
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

export default async function FavoritesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const favorites = await getFavorites();
  const shops: FavShop[] = favorites.shops ?? [];
  const products: FavProduct[] = favorites.products ?? [];

  return (
    <main className="min-h-screen bg-[#fafaf8] px-4 py-10 md:py-14">
      <div className="max-w-5xl mx-auto space-y-10">
        <SiteBar />
        <AccountNav active="/account/favorites" />

        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-orange mb-2">Mon espace</p>
          <h1 className="font-serif-editorial italic text-3xl md:text-4xl text-stone-900">Mes favoris</h1>
        </div>

        <section>
          <h2 className="font-semibold text-stone-900 mb-4">Boutiques likées</h2>
          {shops.length === 0 ? (
            <EmptyState message="Aucune boutique likée pour l'instant. Explorez et likez vos favorites !" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {shops.map((shop) => (
                <Link
                  key={shop._id}
                  href={`/${shop.slug}`}
                  className="bento-cell rounded-2xl border border-stone-200 bg-white p-4 text-center hover:border-stone-300 hover:shadow-sm transition-all"
                >
                  <div className="relative w-14 h-14 mx-auto rounded-full overflow-hidden bg-stone-100 mb-2">
                    {shop.logo && <Image src={shop.logo} alt={shop.name} fill className="object-cover" />}
                  </div>
                  <p className="text-sm font-medium truncate text-stone-900">{shop.name}</p>
                  <Badge className="mt-1">{shop.category}</Badge>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-semibold text-stone-900 mb-4">Produits likés</h2>
          {products.length === 0 ? (
            <EmptyState message="Aucun produit liké pour l'instant. Parcourez les vitrines pour en trouver !" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  shopSlug={product.shop.slug}
                  theme={themes.minimal}
                  isAuthenticated
                  isFavorite
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-10 rounded-2xl border border-dashed border-stone-300 text-stone-400">
      <p>{message}</p>
      <Link href="/search" className="text-orange underline text-sm mt-2 inline-block font-medium">
        Explorer les boutiques
      </Link>
    </div>
  );
}