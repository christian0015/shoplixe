// app/dashboard/[shopId]/products/[productId]/page.tsx
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
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display font-bold text-2xl mb-6">Modifier le produit</h1>
      <ProductForm shopId={shopId} initial={{ ...initial, _id: productId }} />
    </main>
  );
}
