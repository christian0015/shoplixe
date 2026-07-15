// app/dashboard/[shopId]/products/new/page.tsx
import { ProductForm } from '@/components/ProductForm';

export default async function NewProductPage({ params }: { params: Promise<{ shopId: string }> }) {
  const { shopId } = await params;

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display font-bold text-2xl mb-6">Ajouter un produit</h1>
      <ProductForm shopId={shopId} />
    </main>
  );
}
