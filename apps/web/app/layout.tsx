import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import '../styles/globals.css';
import 'react-multi-carousel/lib/styles.css';

import { Inter } from 'next/font/google';
import { Chivo } from 'next/font/google';
import { Lexend } from 'next/font/google';
import { Courgette } from 'next/font/google';
import { Nunito } from 'next/font/google';

import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { ClientProviders } from './_components/client-providers';

const inter = Inter({ subsets: ['latin'] });
const chivo = Chivo({ subsets: ['latin'], variable: '--font-chivo' });
const courgette = Courgette({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-courgette',
});
const lexend = Lexend({ subsets: ['latin'], variable: '--font-lexend' });
const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' });

export const metadata: Metadata = {
  metadataBase: new URL('https://apolochat.com'),
  title: 'Apolo - Registra tus gastos por WhatsApp en segundos',
  description:
    'Apolo te permite registrar tus gastos diarios con solo un mensaje por WhatsApp. Lleva el control de tu dinero sin complicarte.',
  keywords:
    'gastos, WhatsApp, bot, registro, dinero, control, Apolo, app, aplicación, registro de gastos, gastos diarios, gastos mensuales, gastos anuales',
  openGraph: {
    title: 'Apolo - Registra tus gastos por WhatsApp en segundos',
    description:
      'Apolo te permite registrar tus gastos diarios con solo un mensaje por WhatsApp. Lleva el control de tu dinero sin complicarte.',
    url: 'https://apolochat.com',
    siteName: 'Apolo',
    images: '/og-image.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apolo - Registra tus gastos por WhatsApp en segundos',
    description:
      'Apolo te permite registrar tus gastos diarios con solo un mensaje por WhatsApp. Lleva el control de tu dinero sin complicarte.',
    images: '/og-image.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <script
          async
          src="https://us.umami.is/script.js"
          data-website-id="97fcc51a-e27d-4581-9ace-4321353fc780"
        ></script>
      </head>
      <body
        className={cn(
          inter.className,
          chivo.variable,
          courgette.variable,
          lexend.variable,
          nunito.variable
        )}
      >
        <ClientProviders>
          <NuqsAdapter>
            {children}
            <Toaster />
            <Analytics />
          </NuqsAdapter>
        </ClientProviders>
      </body>
    </html>
  );
}
