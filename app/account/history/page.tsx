// app/account/history/page.tsx
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

export default async function HistoryPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const history: HistoryEntry[] = await getHistory();

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Consultés récemment</h1>
        {history.length > 0 && <ClearHistoryButton />}
      </div>

      {history.length === 0 ? (
        <p className="text-stone-400 text-center py-10">Aucun produit consulté pour le moment.</p>
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
    </main>
  );
}
