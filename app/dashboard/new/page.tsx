// app/dashboard/new/page.tsx
import Link from 'next/link';
import { ShopForm } from '@/components/ShopForm';

export default function NewShopPage() {
  return (
    <main className="min-h-screen bg-[#fafaf8] px-4 py-10 md:py-14">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
          ← Mes boutiques
        </Link>
        <header className="mt-4 mb-8">
          <p className="font-mono text-[11px] uppercase tracking-widest text-orange mb-2">Nouvelle boutique</p>
          <h1 className="font-serif-editorial italic text-3xl md:text-4xl text-stone-900">Créer ma boutique</h1>
          <p className="text-stone-500 mt-2">Quelques informations suffisent pour démarrer.</p>
        </header>
        <ShopForm />
      </div>
    </main>
  );
}