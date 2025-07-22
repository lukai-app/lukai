'use client';
import { ArrowRight } from 'lucide-react';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { getWhatsappBotLinkWithMessage } from '@/lib/constants/chat';

export function FinalCTA() {
  return (
    <div
      className="min-h-[600px] w-full flex flex-col items-center justify-center text-center px-4 py-20"
      style={{
        background:
          'radial-gradient(50% 50% at 50% 100%, #34D399 0%, #000000 100%)',
      }}
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl md:text-6xl font-medium text-white">
          Tu Agente Personal de Finanzas{' '}
        </h1>
        <p className="text-2xl md:text-4xl italic text-white/90">
          impulsado por IA{' '}
        </p>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
          Apolo organiza tus gastos automáticamente, ayudándote a tener más
          visibilidad sobre tus finanzas.
        </p>
        <ShimmerButton
          shimmerSize="2px"
          className="shadow-2xl mt-8 mx-auto"
          onClick={() => {
            window.open(
              getWhatsappBotLinkWithMessage('hola!! cómo funciona la app?'),
              '_blank'
            );
          }}
        >
          <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
            Empieza gratis y organiza tus finanzas sin esfuerzo{' '}
          </span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </ShimmerButton>
      </div>
    </div>
  );
}
