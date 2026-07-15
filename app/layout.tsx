// app/layout.tsx
import type { Metadata } from 'next';
import { Syne, Geist, Geist_Mono } from 'next/font/google';
import { LiquidGlassDefs } from '@/components/LiquidGlassDefs';
import './globals.css';

const syne = Syne({ subsets: ['latin'], variable: '--font-syne', weight: ['700', '800'] });
const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: 'VitrineMa — Votre boutique WhatsApp, en ligne',
  description:
    "Créez votre vitrine web en quelques minutes et partagez votre lien partout. La conversion reste sur WhatsApp.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${syne.variable} ${geistSans.variable} ${geistMono.variable} font-body antialiased`}>
        <LiquidGlassDefs />
        {children}
      </body>
    </html>
  );
}