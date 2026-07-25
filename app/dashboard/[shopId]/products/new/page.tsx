// app/dashboard/[shopId]/products/new/page.tsx
import Link from 'next/link';
import { ProductForm } from '@/components/ProductForm';

export default async function NewProductPage({ params }: { params: Promise<{ shopId: string }> }) {
  const { shopId } = await params;

  return (
    <main className="min-h-screen bg-[#fafaf8] px-4 py-10 md:py-14">
      <div className="max-w-2xl mx-auto">
        <Link href={`/dashboard/${shopId}`} className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
          ← Retour à la boutique
        </Link>
        <h1 className="font-serif-editorial italic text-3xl md:text-4xl text-stone-900 mt-4 mb-8">Ajouter un produit</h1>
        <ProductForm shopId={shopId} />
      </div>
    </main>
  );
}