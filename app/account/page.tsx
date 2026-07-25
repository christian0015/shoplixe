// app/account/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { ProfileForm } from './ProfileForm';

const NAV_TABS = [
  { href: '/dashboard', label: 'Boutiques' },
  { href: '/account', label: 'Profil' },
  { href: '/account/favorites', label: 'Favoris' },
  { href: '/account/history', label: 'Historique' },
];

function SiteBar() {
  return (
    <div className="flex items-center justify-between mb-6">
      <Link href="/" className="font-serif-editorial text-lg italic text-stone-900">
        Shoplixe<span className="text-[#E25B38]">.</span>
      </Link>
      <div className="flex items-center gap-5 text-sm font-medium text-stone-500">
        <Link href="/" className="hover:text-stone-900 transition-colors">Accueil</Link>
        <Link href="/explore" className="hover:text-stone-900 transition-colors">Explorer</Link>
        <Link href="/search" className="hover:text-stone-900 transition-colors">Rechercher</Link>
      </div>
    </div>
  );
}

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

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  await connectDB();
  const user = await User.findById(session.userId).lean();
  if (!user) redirect('/login');

  const plainUser = JSON.parse(JSON.stringify(user));

  return (
    <main className="min-h-screen bg-[#fafaf8] px-4 py-10 md:py-14">
      <div className="max-w-2xl mx-auto">
        <SiteBar />
        <AccountNav active="/account" />

        <header className="mb-8">
          <p className="font-mono text-[11px] uppercase tracking-widest text-orange mb-2">Mon espace</p>
          <h1 className="font-serif-editorial italic text-3xl md:text-4xl text-stone-900">Mon profil</h1>
          <p className="text-stone-500 mt-2">Gérez vos informations et vos préférences.</p>
        </header>

        <ProfileForm user={plainUser} />
      </div>
    </main>
  );
}