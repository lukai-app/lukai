'use client';
import { Check, Zap } from 'lucide-react';

import { ShineBorder } from '@/components/magicui/shine-border';
import { getWhatsappBotLinkWithMessage } from '@/lib/constants/chat';
import { RainbowButton } from '@/components/magicui/rainbow-button';

export function Pricing() {
  return (
    <div id="pricing" className="min-h-screen bg-black text-white">
      <div className="container px-4 py-16 md:py-32 mx-auto max-w-7xl">
        <h2 className="text-gray-400 text-center mb-2">Pricing</h2>

        <div className="text-center space-y-4 mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold tracking-tight">
            Gestión Financiera Sin Fricciones
            <br />
            Un solo plan, todo incluido
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-3xl mx-auto">
            Accede a análisis inteligentes, reportes automatizados y monitoreo
            en tiempo real. Sin costos ocultos, sin complicaciones.
          </p>
        </div>

        <div className="max-w-lg mx-auto relative rounded-2xl overflow-hidden">
          {/* Growth Plan */}
          <ShineBorder shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']} />
          <div className="rounded-2xl bg-zinc-900 p-8 gap-6 flex flex-col h-full">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <h3 className="text-xl font-semibold">
                  Gestión de gastos personales
                </h3>
              </div>
              <p className="text-sm text-gray-400">
                Totalmente gratis mientras estamos en Beta
              </p>
              {/* <p className="text-sm text-gray-400">
                14 días gratis para probarlo (no requiere tarjeta de crédito).
              </p> */}
              <div className="flex flex-col">
                <div className="text-sm text-purple-400"></div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-400">/mes</span>
                  <span className="text-lg text-gray-500 line-through">
                    $2,99
                  </span>
                </div>
              </div>
            </div>

            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  Seguimiento de Gastos 100% Automatizado
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  Funciona Directamente en WhatsApp
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  Seguridad y privacidad con cifrado E2EE
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                {/* <span className="text-sm">14 Días de Prueba Gratis</span> */}
                <span className="text-sm">
                  Totalmente FREE mientras estamos en Beta
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  Diseñado para Profesionales Ocupados
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  IA Inteligente con Análisis de Gastos
                </span>
              </li>
            </ul>

            <RainbowButton
              className="w-full mt-14 bg-white text-black"
              onClick={() => {
                window.open(
                  getWhatsappBotLinkWithMessage(
                    'hola!! quiero iniciar la prueba gratuita'
                  ),
                  '_blank'
                );
              }}
            >
              Iniciar prueba gratis
            </RainbowButton>
          </div>
        </div>
      </div>
    </div>
  );
}
