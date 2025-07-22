import type React from 'react';
import {
  Play,
  Search,
  RefreshCcw,
  BarChart3,
  MessageSquare,
  LineChart,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MagicCard } from '@/components/magicui/magic-card';

export function Pas() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-gray-400">Registro</h2>
              <Badge
                variant="secondary"
                className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
              >
                NUEVO
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              ¿Y si Pudieras Ver tu Dinero en Acción?
            </h1>
            <p className="text-gray-400 text-lg">
              Nunca más te preguntes a dónde se fue tu dinero. Apolo te permite
              registrar cada gasto en segundos, analizar patrones de consumo y
              optimizar tu presupuesto sin esfuerzo.
            </p>
          </div>

          <div className="space-y-6">
            <Feature
              icon={<MessageSquare className="w-6 h-6" />}
              title="Registra Cada Gasto en WhatsApp"
              description="Convierte cada compra en un registro automático. ¿Pagaste un café? Simplemente envía un mensaje y Apolo lo categoriza en segundos. Olvídate de las hojas de cálculo y el desorden financiero."
            />
            <Feature
              icon={<BarChart3 className="w-6 h-6" />}
              title="Revisa y Analiza con Datos Reales"
              description="No más estimaciones vagas ni suposiciones. Apolo te muestra exactamente cuánto has gastado por categoría, tu mayor gasto del mes y un resumen anual con insights personalizados."
            />
            <Feature
              icon={<LineChart className="w-6 h-6" />}
              title="Toma Decisiones Basadas en Datos"
              description="Ve cómo cada gasto afecta tu presupuesto en tiempo real. Ajusta tus hábitos y mejora tu salud financiera con información precisa, sin esfuerzo y en un solo lugar."
            />
          </div>
        </div>

        {/* Right Column */}
        <MagicCard className="bg-zinc-900 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-zinc-800 rounded">
                <BarChart3 className="w-4 h-4 m-0.5 text-emerald-400" />
              </div>
              <span>Seguimiento de Gastos</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span>24 Transacciones</span>
              <span className="text-emerald-400">98% Éxito</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <h3 className="text-sm text-gray-400 mb-2">Gastos Totales</h3>
              <p className="text-2xl font-bold text-emerald-400">$1,247.32</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <h3 className="text-sm text-gray-400 mb-2">Mayor Categoría</h3>
              <p className="text-2xl font-bold text-emerald-400">Comida</p>
            </div>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Play className="w-4 h-4 text-emerald-400" />
              <span>Últimas Transacciones</span>
              <span className="ml-auto text-emerald-400">95% Precisión</span>
            </div>

            <TestCase
              id="1234"
              status="success"
              resolution="categorized"
              conversation={[
                {
                  role: 'Cliente',
                  text: "Gasté 10 dólares en una hamburguesa en McDonald's",
                },
                {
                  role: 'Agente',
                  text: "He registrado tu gasto de $10.00 en la categoría 'Comida'. Ubicación: McDonald's",
                },
              ]}
            />

            <TestCase
              id="1235"
              status="success"
              resolution="categorized"
              conversation={[
                { role: 'Cliente', text: 'Pagué 45 dólares en gasolina hoy' },
                {
                  role: 'Agente',
                  text: "Registrado: gasto de $45.00 en categoría 'Transporte'",
                },
              ]}
            />

            <div className="text-center text-sm text-gray-500 mt-4">
              Ver historial completo de transacciones...
            </div>
          </div>

          {/*  <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">📊</span>
              <span>Métricas clave en tu dashboard:</span>
            </div>
            <ul className="list-disc pl-8 space-y-1">
              <li>Resumen de Gastos Totales – Visualiza tu flujo de dinero.</li>
              <li>Categoría con Más Gasto – Descubre dónde puedes ahorrar.</li>
              <li>
                Historial Completo de Transacciones – Encuentra cualquier gasto
                en segundos.
              </li>
              <li>Análisis de Presupuesto – Ajusta tus hábitos con IA.</li>
            </ul>
          </div> */}
        </MagicCard>
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 bg-zinc-900 p-2 rounded-lg h-fit">{icon}</div>
      <div className="space-y-1">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  );
}

function TestCase({
  id,
  status,
  resolution,
  conversation,
}: {
  id: string;
  status: 'success' | 'failed';
  resolution: 'categorized' | 'pending';
  conversation: Array<{ role: string; text: string }>;
}) {
  return (
    <div className="border border-zinc-700/50 rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              status === 'success' ? 'bg-emerald-400' : 'bg-yellow-400'
            }`}
          />
          <span className="text-sm text-gray-400">Transacción #{id}</span>
        </div>
        <span
          className={`text-sm ${
            resolution === 'categorized'
              ? 'text-emerald-400'
              : 'text-yellow-400'
          }`}
        >
          {resolution === 'categorized' ? 'Categorizado' : 'Pendiente'}
        </span>
      </div>
      {conversation.length > 0 && (
        <div className="space-y-2">
          {conversation.map((msg, i) => (
            <div key={i} className="text-sm">
              <span
                className={
                  msg.role === 'Agente' ? 'text-emerald-400' : 'text-white'
                }
              >
                {msg.role}: {msg.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
