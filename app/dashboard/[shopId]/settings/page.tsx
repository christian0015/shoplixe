// app/dashboard/[shopId]/settings/page.tsx
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
    <main className="max-w-2xl mx-auto px-4 py-10 space-y-10">
      <h1 className="font-display font-bold text-2xl">Paramètres de la boutique</h1>
      <ShopForm initial={{ ...initial, _id: shopId }} />

      <div className="border-t border-stone-200 pt-6">
        <h2 className="font-medium text-red-600 mb-2">Zone de danger</h2>
        <DeleteShopButton shopId={shopId} />
      </div>
    </main>
  );
}
