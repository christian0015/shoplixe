// app/dashboard/new/page.tsx
import { ShopForm } from '@/components/ShopForm';

export default function NewShopPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display font-bold text-2xl mb-6">Créer ma boutique</h1>
      <ShopForm />
    </main>
  );
}
