// // app/layout.tsx
// import type { Metadata } from 'next';
// import { Syne, Geist, Geist_Mono } from 'next/font/google';
// import { LiquidGlassDefs } from '@/components/LiquidGlassDefs';
// import './globals.css';

// const syne = Syne({ subsets: ['latin'], variable: '--font-syne', weight: ['700', '800'] });
// const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
// const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

// export const metadata: Metadata = {
//   title: 'VitrineMa — Votre boutique WhatsApp, en ligne',
//   description:
//     "Créez votre vitrine web en quelques minutes et partagez votre lien partout. La conversion reste sur WhatsApp.",
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="fr">
//       <body className={`${syne.variable} ${geistSans.variable} ${geistMono.variable} font-body antialiased`}>
//         <LiquidGlassDefs />
//         {children}
//       </body>
//     </html>
//   );
// }
import type { Metadata } from 'next';
import { Instrument_Serif, Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700'],
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Shoplixe — L’art de la vitrine directe',
  description: 'Convertissez votre audience en clients fidèles sans intermédiaires. La fluidité d’un studio de création, la puissance du commerce direct.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${instrumentSerif.variable} ${jakarta.variable} ${geistMono.variable}`}>
      <body className="bg-grain relative min-h-screen">
        {children}
      </body>
    </html>
  );
}