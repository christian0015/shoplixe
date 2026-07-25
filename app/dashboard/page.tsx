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

const NAV_TABS = [
  { href: '/dashboard', label: 'Boutiques' },
  { href: '/account', label: 'Profil' },
  { href: '/account/favorites', label: 'Favoris' },
  { href: '/account/history', label: 'Historique' },
];

function AccountNav({ active }: { active: string }) {
  return (
    <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1 mb-10">
      {NAV_TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            tab.href === active
              ? 'bg-stone-900 text-stone-100 shadow-sm'
              : 'text-stone-500 hover:text-stone-900 hover:bg-stone-900/5'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

export default async function DashboardPage() {
  const shops: ShopSummary[] = await getUserShops();

  if (shops.length === 0) {
    return (
      <main className="min-h-screen bg-[#fafaf8] px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <AccountNav active="/dashboard" />
        </div>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center space-y-5 max-w-sm">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel text-xs font-medium text-stone-700">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
              Bienvenue sur Shoplixe
            </span>
            <h1 className="font-serif-editorial italic text-3xl text-stone-900">Créez votre première vitrine</h1>
            <p className="text-stone-500">Lancez votre boutique en quelques minutes et partagez votre lien partout.</p>
            <div className="pt-2">
              <CreateShopButton />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafaf8] px-4 py-10 md:py-14">
      <div className="max-w-5xl mx-auto space-y-6">
        <AccountNav active="/dashboard" />

        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-orange mb-2">Mon espace</p>
            <h1 className="font-serif-editorial italic text-3xl md:text-4xl text-stone-900">Mes boutiques</h1>
          </div>
          <CreateShopButton label="+ Nouvelle boutique" variant="secondary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shops.map((shop) => (
            <div key={shop._id} className="bento-cell rounded-3xl border border-stone-200 bg-white p-5 space-y-4 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                  {shop.logo && <Image src={shop.logo} alt={shop.name} fill className="object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate text-stone-900">{shop.name}</p>
                  <p className="text-xs text-stone-400 font-mono">/{shop.slug} · {shop.productCount} produit(s)</p>
                </div>
              </div>
              <Link
                href={`/dashboard/${shop._id}`}
                className="block text-center py-2.5 rounded-full bg-[#2e5e4d] text-white text-sm font-semibold hover:bg-[#518c76] transition-all shadow-sm"
              >
                Gérer
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}