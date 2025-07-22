'use client';
import { useState, useEffect } from 'react';
import { useQueryState } from 'nuqs';
import { motion } from 'framer-motion';

import { PhoneNumber } from './phone-number';
import { OTPVerification } from './otp-verification';
//import { getWhatsappBotLinkWithMessage } from '@/lib/constants/chat';

export default function Page() {
  const [phoneNumber, setPhoneNumber] = useQueryState('phone');
  const [screen, setScreen] = useState<'phone' | 'code'>('phone');

  return (
    <div
      className="flex min-h-screen overflow-auto dark:bg-[#09090B] relative"
      style={{
        background:
          'radial-gradient(50% 50% at 50% 100%, #34D399 0%, #000000 100%)',
      }}
    >
      <div className="flex w-full flex-col relative items-center justify-center rounded-l-[40px] p-6">
        <img
          src="/logo-white.png"
          alt="Apolo"
          className="h-12 object-contain absolute top-4 left-4"
        />
        <div className="flex flex-col w-full py-8 items-center justify-center">
          <div className="w-full max-w-lg">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-left mb-10">
              Registra tus gastos desde WhatsApp.
            </h1>

            {screen === 'phone' ? (
              <PhoneNumber
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                setScreen={setScreen}
              />
            ) : screen === 'code' && phoneNumber ? (
              <OTPVerification phoneNumber={phoneNumber} />
            ) : null}

            <div className="mt-12 text-left text-gray-400">
              <p className="text-sm">
                Al continuar, aceptas nuestros <br />
                <a href="/terms.html" className="text-[#34D399]">
                  Términos de uso
                </a>{' '}
                y{' '}
                <a href="/privacy.html" className="text-[#34D399]">
                  Política de privacidad
                </a>
              </p>
            </div>

            {/*             <p className="my-6 text-sm text-left text-gray-400">
              ¿Quieres probar el chatbot de Apolo?
              <br />
              <a
                href={getWhatsappBotLinkWithMessage(
                  'hola!! cómo funciona la app?'
                )}
                target="_blank"
                className="text-[#34D399]"
              >
                Registra tu primer gasto aquí.
              </a>
            </p> */}
          </div>
        </div>
      </div>

      <div className="relative hidden  h-screen w-[50%] p-8 md:block">
        <div className="h-full w-full rounded-[40px]">
          <div className="flex h-full flex-col justify-center items-start text-center">
            <ChatSteps />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatSteps() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 600);
    const timer2 = setTimeout(() => setStep(2), 1200);
    const timer3 = setTimeout(() => setStep(3), 1800);
    const timer4 = setTimeout(() => setStep(4), 2400);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.8,
      },
    },
  };

  const rightMessageVariants = {
    hidden: {
      opacity: 0,
      x: 50,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
      },
    },
  };

  const leftMessageVariants = {
    hidden: {
      opacity: 0,
      x: -50,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
      },
    },
  };

  const checkmarkVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.3,
        type: 'spring',
        stiffness: 500,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      className="w-full max-w-[350px] space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mb-4 mx-auto">
        <img
          src="/logos/white-transparent.png"
          alt="Apolo"
          className="h-16 object-contain mx-auto"
        />{' '}
      </div>
      <div className="relative">
        <img
          src="/landing/wa-layout.png"
          alt="chat steps"
          className="flex-1 object-cover rounded-lg"
        />
        {step >= 1 && (
          <motion.img
            src={'/landing/message-es-1.png'}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, originY: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 40 }}
            alt="message"
            className="ml-auto md:h-5 lg:h-7 absolute md:top-20 lg:top-28 right-0"
          />
        )}
        {step >= 2 && (
          <motion.img
            src={'/landing/response-es-1.png'}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, originY: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 40 }}
            alt="message"
            className="mr-auto md:h-12 lg:h-16 absolute md:top-28 lg:top-40 left-0"
          />
        )}
        {step >= 3 && (
          <motion.img
            src={'/landing/message-es-2.png'}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, originY: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 40 }}
            alt="message"
            className="ml-auto md:h-5 lg:h-7 absolute md:top-44 lg:top-60 right-0"
          />
        )}
        {step >= 4 && (
          <motion.img
            src={'/landing/response-es-2.png'}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, originY: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 40 }}
            alt="message"
            className="mr-auto md:h-12 lg:h-16 absolute md:top-52 lg:top-[288px] left-0"
          />
        )}
      </div>
    </motion.div>
  );
}
