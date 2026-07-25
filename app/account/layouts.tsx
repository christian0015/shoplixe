// app/account/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  {
    label: 'Mon Profil',
    href: '/account',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: 'Mes Favoris',
    href: '/account/favorites',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    label: 'Historique',
    href: '/account/history',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0B0A0F] text-stone-100 py-10 px-4 md:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Espace Client */}
        <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#518C76]">Espace Membre</span>
            <h1 className="text-3xl font-bold tracking-tight text-white mt-1">Tableau de bord</h1>
          </div>
          <Link
            href="/search"
            className="self-start md:self-auto text-xs font-mono uppercase tracking-wider px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-stone-300 hover:text-white hover:border-white/30 transition-all flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Explorer les créations
          </Link>
        </div>

        {/* Layout : Navigation + Contenu */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Navigation Sidebar */}
          <nav className="lg:col-span-1 bg-[#13111A]/80 border border-white/10 rounded-2xl p-2 backdrop-blur-xl space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-[#A855F7] text-white shadow-lg shadow-[#A855F7]/25 font-semibold'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-stone-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Zone de Contenu Principal */}
          <main className="lg:col-span-3 bg-[#13111A]/60 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
            {children}
          </main>
        </div>

      </div>
    </div>
  );
}