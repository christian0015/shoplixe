// app/dashboard/[shopId]/page.tsx
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { connectDB } from '@/lib/db';
import Shop from '@/models/Shop';
import { getProductsByShop } from '@/lib/public-data';
import { ProductRow } from './ProductRow';

export default async function ShopAdminPage({ params }: { params: Promise<{ shopId: string }> }) {
  const { shopId } = await params;
  const session = await getSession();
  if (!session) redirect('/login');

  await connectDB();
  const shop = await Shop.findById(shopId).lean();
  if (!shop) notFound();
  const shopDoc = shop as unknown as {
    owner: string; name: string; slug: string;
    rating: number; reviewsCount: number;
    serviceRating: number; communicationRating: number; reliabilityRating: number;
  };
  if (String(shopDoc.owner) !== session.userId) notFound();

  const products = await getProductsByShop(shopId);

  return (
    <main className="min-h-screen bg-[#111] text-white px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-xl">{shopDoc.name}</h1>
            <a href={`/${shopDoc.slug}`} target="_blank" rel="noreferrer" className="text-xs text-stone-400 underline">
              Voir la vitrine publique
            </a>
            {shopDoc.reviewsCount > 0 && (
              <p className="text-xs text-stone-500 mt-1">
                ⭐ {shopDoc.rating.toFixed(1)} ({shopDoc.reviewsCount} avis) — Service {shopDoc.serviceRating.toFixed(1)} · Communication{' '}
                {shopDoc.communicationRating.toFixed(1)} · Fiabilité {shopDoc.reliabilityRating.toFixed(1)}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/${shopId}/settings`} className="px-4 py-2 rounded-xl border border-stone-700 text-sm">
              Paramètres
            </Link>
            <Link href={`/dashboard/${shopId}/products/new`} className="px-4 py-2 rounded-xl bg-orange text-sm font-medium">
              Ajouter un produit
            </Link>
          </div>
        </div>

        <div className="space-y-2">
          {products.length === 0 && <p className="text-stone-500 text-sm">Aucun produit — ajoutez-en un pour commencer.</p>}
          {products.map((product: {
            _id: string; name: string; price: number; promoPrice: number | null;
            images: string[]; available: boolean; slug: string;
          }) => (
            <ProductRow key={product._id} product={product} shopId={shopId} />
          ))}
        </div>
      </div>
    </main>
  );
}
