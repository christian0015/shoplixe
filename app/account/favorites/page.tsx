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

export default async function FavoritesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const favorites = await getFavorites();
  const shops: FavShop[] = favorites.shops ?? [];
  const products: FavProduct[] = favorites.products ?? [];

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <h1 className="font-display font-bold text-2xl">Mes favoris</h1>

      <section>
        <h2 className="font-medium text-lg mb-4">Boutiques likées</h2>
        {shops.length === 0 ? (
          <EmptyState message="Aucune boutique likée pour l'instant. Explorez et likez vos favorites !" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {shops.map((shop) => (
              <Link key={shop._id} href={`/${shop.slug}`} className="rounded-2xl border border-stone-200 p-4 text-center hover:border-stone-300">
                <div className="relative w-14 h-14 mx-auto rounded-full overflow-hidden bg-stone-100 mb-2">
                  {shop.logo && <Image src={shop.logo} alt={shop.name} fill className="object-cover" />}
                </div>
                <p className="text-sm font-medium truncate">{shop.name}</p>
                <Badge className="mt-1">{shop.category}</Badge>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-medium text-lg mb-4">Produits likés</h2>
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
    </main>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-10 rounded-2xl border border-dashed border-stone-300 text-stone-400">
      <p>{message}</p>
      <Link href="/search" className="text-orange underline text-sm mt-2 inline-block">
        Explorer les boutiques
      </Link>
    </div>
  );
}
