'use client';

import type React from 'react';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MessageSquare, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { getWhatsappBotLinkWithMessage } from '@/lib/constants/chat';
import { z } from 'zod';
import { toast } from 'sonner';
import { mixpanel } from '@/lib/tools/mixpanel';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useIsMobile } from '@/hooks/use-mobile';

const expenseFormSchema = z.object({
  description: z
    .string()
    .min(3, { message: 'La descripción debe tener al menos 3 caracteres' }),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export function OnboardingExperience() {
  const isMobile = useIsMobile();
  const [showQrCode, setShowQrCode] = useState(false);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: '',
    },
  });

  const handleDirectWhatsApp = () => {
    window.open(
      getWhatsappBotLinkWithMessage('hola!! quiero empezar a usar la app'),
      '_blank'
    );
  };

  const onSubmit = async (data: ExpenseFormValues) => {
    try {
      mixpanel.track('try_live_register_expense', {
        description: data.description,
      });

      window.open(getWhatsappBotLinkWithMessage(data.description), '_blank');
    } catch (error) {
      toast.error('Ocurrió un error al registrar el gasto');
    }
  };

  const toggleView = () => {
    setShowQrCode(!showQrCode);
  };

  return (
    <div className="flex-1 text-white flex flex-col items-center justify-center px-4">
      <AnimatePresence mode="wait">
        {!showQrCode ? (
          <motion.div
            key="chat-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-4 text-center"
            >
              <span className="bg-orange-500/20 text-orange-500 text-sm font-medium px-3 py-1 rounded-full">
                BETA DISPONIBLE AHORA
              </span>
            </motion.div>

            <div className="flex flex-col items-center justify-center">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8 whitespace-nowrap text-4xl md:text-5xl font-normal tracking-tight leading-tight"
              >
                ¿En qué gastaste hoy?
              </motion.h1>
            </div>

            <Form {...form}>
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-4"
              >
                <div className="relative">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <input
                            type="text"
                            placeholder="Ej: Gasté 20 soles en una hamburguesa"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-4 px-5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-lg"
                            required
                            autoFocus
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-white text-black py-4 px-6 rounded-lg font-medium hover:bg-gray-100 transition-colors text-lg"
                >
                  Registrar Gasto
                </motion.button>
              </motion.form>
            </Form>

            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <div className="relative flex items-center py-5">
                  <div className="flex-grow border-t border-zinc-800"></div>
                  <span className="flex-shrink mx-4 text-zinc-500 text-sm">
                    o
                  </span>
                  <div className="flex-grow border-t border-zinc-800"></div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDirectWhatsApp}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 text-lg"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Iniciar chat en WhatsApp</span>
                </motion.button>
              </motion.div>
            )}

            {!isMobile && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={toggleView}
                className="mt-8 text-orange-500 hover:text-orange-400 text-sm flex items-center mx-auto transition-colors"
              >
                <span>Prefiero escanear código QR</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </motion.button>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-12 flex flex-wrap gap-4 justify-center"
            >
              {/*  <button className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <Scan className="w-5 h-5" />
                <span>Ver tutorial</span>
              </button> */}

              <a
                href={getWhatsappBotLinkWithMessage(
                  'hola!! tengo una duda sobre la app'
                )}
                target="_blank"
                className="hidden md:block"
              >
                <button className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                  <span>Contactar soporte</span>
                </button>
              </a>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="qr-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-xl flex flex-col items-center"
          >
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold text-center mb-8"
            >
              Escanea y comienza
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="bg-white p-2 rounded-xl mb-6"
            >
              <Image
                src="/landing/qr-code.png"
                alt="QR Code para WhatsApp"
                width={250}
                height={250}
                className="rounded-lg"
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-center max-w-md"
            >
              Escanea este código QR con tu teléfono para comenzar a registrar
              tus gastos a través de WhatsApp
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-8 w-full"
            >
              <div className="relative flex items-center py-5">
                <div className="flex-grow border-t border-zinc-800"></div>
                <span className="flex-shrink mx-4 text-zinc-500 text-sm">
                  o
                </span>
                <div className="flex-grow border-t border-zinc-800"></div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDirectWhatsApp}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-lg font-medium flex items-center justify-center space-x-2 text-lg"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Iniciar chat en WhatsApp</span>
              </motion.button>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={toggleView}
              className="text-orange-500 hover:text-orange-400 text-sm flex items-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Volver al chat</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
