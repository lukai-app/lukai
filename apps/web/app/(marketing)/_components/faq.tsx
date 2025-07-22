'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function FAQ() {
  return (
    <section id="faq" className="bg-black text-white py-16 px-4 md:py-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-xl text-gray-400">
            ¿Tienes dudas? Aquí están las respuestas.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-6">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-left text-lg font-medium">
              ¿Cómo funciona Apolo?
            </AccordionTrigger>
            <AccordionContent className="pt-2 whitespace-pre-line text-base/7 text-gray-300">
              Apolo es un rastreador de finanzas impulsado por IA que funciona
              directamente en WhatsApp. Solo envía tus mensajes relacionados con
              gastos y Apolo los categorizará y registrará automáticamente.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-left text-lg font-medium">
              ¿Es realmente gratis probar Apolo?
            </AccordionTrigger>
            <AccordionContent className="pt-2 whitespace-pre-line text-base/7 text-gray-300">
              ¡Sí! Obtienes 14 días de acceso completo gratis, sin necesidad de
              tarjeta de crédito. Después, puedes continuar usando Apolo por
              $1,99/mes (oferta por tiempo limitado).
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border-gray-800">
            <AccordionTrigger className="text-left text-lg font-medium">
              ¿Cómo mantiene Apolo mis datos seguros?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400 pt-2">
              Apolo utiliza cifrado de extremo a extremo (E2EE) para proteger
              tus datos financieros, lo que significa que solo tú puedes acceder
              a tus detalles de gastos.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-left text-lg font-medium">
              ¿Necesito instalar una aplicación?
            </AccordionTrigger>
            <AccordionContent className="pt-2 whitespace-pre-line text-base/7 text-gray-300">
              ¡No! Apolo funciona directamente dentro de WhatsApp, así que no
              necesitas instalar nada nuevo.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border-gray-800">
            <AccordionTrigger className="text-left text-lg font-medium">
              ¿Puedo exportar mis gastos?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400 pt-2">
              ¡Sí! Apolo te permite exportar tus datos de gastos, solo enviale
              un mensaje a Apolo con tu solicitud y nosotros te ayudamos.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger className="text-left text-lg font-medium">
              ¿Qué sucede después de que termine mi prueba gratuita?
            </AccordionTrigger>
            <AccordionContent className="pt-2 whitespace-pre-line text-base/7 text-gray-300">
              Tendrás la opción de suscribirte por solo $1,99/mes. Si no te
              suscribes, el seguimiento de gastos se pausará, pero tus datos
              permanecerán seguros.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger className="text-left text-lg font-medium">
              ¿Cómo cancelo mi suscripción?
            </AccordionTrigger>
            <AccordionContent className="pt-2 whitespace-pre-line text-base/7 text-gray-300">
              Puedes cancelar en cualquier momento con un clic en la
              configuración de tu cuenta, sin cargos ocultos y sin
              complicaciones.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
