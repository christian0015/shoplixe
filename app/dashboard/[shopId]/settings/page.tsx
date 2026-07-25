// app/dashboard/[shopId]/settings/page.tsx
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { connectDB } from '@/lib/db';
import Shop from '@/models/Shop';
import { ShopForm } from '@/components/ShopForm';
import { DeleteShopButton } from './DeleteShopButton';

export default async function ShopSettingsPage({ params }: { params: Promise<{ shopId: string }> }) {
  const { shopId } = await params;
  const session = await getSession();
  if (!session) redirect('/login');

  await connectDB();
  const shop = await Shop.findById(shopId).lean();
  if (!shop) notFound();
  const shopDoc = shop as unknown as { owner: string };
  if (String(shopDoc.owner) !== session.userId) notFound();

  const initial = JSON.parse(JSON.stringify(shop));

  return (
    <main className="min-h-screen bg-[#fafaf8] px-4 py-10 md:py-14">
      <div className="max-w-2xl mx-auto space-y-10">
        <div>
          <Link href={`/dashboard/${shopId}`} className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
            ← Retour à la boutique
          </Link>
          <h1 className="font-serif-editorial italic text-3xl md:text-4xl text-stone-900 mt-4">Paramètres de la boutique</h1>
        </div>

        <ShopForm initial={{ ...initial, _id: shopId }} />

        <div className="rounded-3xl border border-red-100 bg-red-50/50 p-6">
          <h2 className="font-semibold text-red-600 mb-1">Zone de danger</h2>
          <p className="text-sm text-red-500/80 mb-4">Cette action est définitive et irréversible.</p>
          <DeleteShopButton shopId={shopId} />
        </div>
      </div>
    </main>
  );
}