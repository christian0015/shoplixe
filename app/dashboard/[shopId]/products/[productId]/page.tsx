// app/dashboard/[shopId]/products/[productId]/page.tsx
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { connectDB } from '@/lib/db';
import Shop from '@/models/Shop';
import Product from '@/models/Product';
import { ProductForm } from '@/components/ProductForm';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ shopId: string; productId: string }>;
}) {
  const { shopId, productId } = await params;
  const session = await getSession();
  if (!session) redirect('/login');

  await connectDB();
  const shop = await Shop.findById(shopId).lean();
  if (!shop || String((shop as unknown as { owner: string }).owner) !== session.userId) notFound();

  const product = await Product.findById(productId).lean();
  if (!product) notFound();

  const initial = JSON.parse(JSON.stringify(product));

  return (
    <main className="min-h-screen bg-[#fafaf8] px-4 py-10 md:py-14">
      <div className="max-w-2xl mx-auto">
        <Link href={`/dashboard/${shopId}`} className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
          ← Retour à la boutique
        </Link>
        <h1 className="font-serif-editorial italic text-3xl md:text-4xl text-stone-900 mt-4 mb-8">Modifier le produit</h1>
        <ProductForm shopId={shopId} initial={{ ...initial, _id: productId }} />
      </div>
    </main>
  );
}