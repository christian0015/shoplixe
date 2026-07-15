// app/dashboard/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { getUserShops } from '@/lib/shop-actions';
import { CreateShopButton } from './CreateShopButton';

interface ShopSummary {
  _id: string;
  name: string;
  slug: string;
  logo: string | null;
  productCount: number;
}

export default async function DashboardPage() {
  const shops: ShopSummary[] = await getUserShops();

  if (shops.length === 0) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <h1 className="font-display font-bold text-2xl">Bienvenue sur VitrineMa</h1>
          <p className="text-stone-500">Créez votre première boutique en quelques minutes.</p>
          <CreateShopButton />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Mes boutiques</h1>
        <CreateShopButton label="+ Nouvelle boutique" variant="secondary" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shops.map((shop) => (
          <div key={shop._id} className="rounded-2xl border border-stone-200 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                {shop.logo && <Image src={shop.logo} alt={shop.name} fill className="object-cover" />}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{shop.name}</p>
                <p className="text-xs text-stone-400">/{shop.slug} · {shop.productCount} produit(s)</p>
              </div>
            </div>
            <Link
              href={`/dashboard/${shop._id}`}
              className="block text-center py-2 rounded-xl bg-stone-900 text-white text-sm font-medium hover:opacity-90"
            >
              Gérer
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
