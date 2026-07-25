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
import type { Metadata, Viewport } from 'next';
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

// URL de base pour le SEO (Remplace par ton vrai domaine en production)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shoplixe.vercel.app';

export const viewport: Viewport = {
  themeColor: '#0B0A0F',
  colorScheme: 'dark',
};
// export const metadata: Metadata = {
//   title: 'Shoplixe — L’art de la vitrine directe',
//   description: 'Convertissez votre audience en clients fidèles sans intermédiaires. La fluidité d’un studio de création, la puissance du commerce direct.',
// };
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    // Intègre "Créer un site" et "Boutique WhatsApp" en premier pour Google
    default: 'Shoplixe — Créer un site e-commerce & boutique WhatsApp',
    template: '%s | Shoplixe',
  },
  description:
    'Créez votre site e-commerce et boutique en ligne en quelques minutes. Convertissez votre audience directement sur WhatsApp, sans frais ni intermédiaires.',
  keywords: [
    // Mots-clés à TÈS HAUT VOLUME de recherche
    'creer un site e commerce',
    'creer boutique en ligne',
    'creer un site internet',
    'boutique whatsapp',
    'vendre sur whatsapp',
    'site e commerce maroc',
    'catalogue en ligne',
    'vitrine en ligne',
    'Shoplixe',
  ],
  authors: [{ name: 'Shoplixe' }],
  creator: 'Shoplixe',
  publisher: 'Shoplixe',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.ico', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },

  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    siteName: 'Shoplixe',
    title: 'Shoplixe — Créez votre site e-commerce & boutique WhatsApp',
    description:
      'La solution la plus simple pour créer votre boutique en ligne. Mettez en valeur vos produits avec l’élégance d’un studio et vendez en direct sur WhatsApp.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Shoplixe - Création de site et boutique WhatsApp',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Shoplixe — Créez votre site e-commerce en quelques minutes',
    description:
      'Convertissez votre audience en clients fidèles avec votre propre site et boutique WhatsApp.',
    images: ['/og-image.png'],
  },

  alternates: {
    canonical: siteUrl,
  },
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