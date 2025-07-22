import { WHATSAPP_BOT_LINK } from '@/lib/constants/chat';
import { mixpanelServer } from '@/lib/tools/mixpanelServer';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  metadataBase: new URL('https://apolochat.com'),
  title: 'Apolo - Registra tu primer gasto en segundos',
  description:
    'Apolo te permite registrar tus gastos diarios con solo un mensaje por WhatsApp. Lleva el control de tu dinero sin complicarte.',
  keywords:
    'gastos, WhatsApp, bot, registro, dinero, control, Apolo, app, aplicación, registro de gastos, gastos diarios, gastos mensuales, gastos anuales',
  openGraph: {
    title: 'Apolo - Registra tu primer gasto en segundos',
    description:
      'Apolo te permite registrar tus gastos diarios con solo un mensaje por WhatsApp. Lleva el control de tu dinero sin complicarte.',
    url: 'https://apolochat.com',
    siteName: 'Apolo',
    images: '/og-image.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apolo - Registra tu primer gasto en segundos',
    description:
      'Apolo te permite registrar tus gastos diarios con solo un mensaje por WhatsApp. Lleva el control de tu dinero sin complicarte.',
    images: '/og-image.png',
  },
};

export default async function Start() {
  mixpanelServer.track('on_start_page');

  redirect(WHATSAPP_BOT_LINK);
}
