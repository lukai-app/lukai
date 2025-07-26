'use client';
import Link from 'next/link';
import { LuArrowRight, LuSend } from 'react-icons/lu';
import { motion } from 'framer-motion';
import { useScroll, useTransform } from 'framer-motion';
import { useState } from 'react';
import { BsWhatsapp } from 'react-icons/bs';

import { getWhatsappBotLinkWithMessage } from '@/lib/constants/chat';

import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { TypingAnimation } from '@/components/magicui/typing-animation';
import { ChatMessages } from './_components/chat-messages';
import { TryLive } from './_components/try-live';
import { Pas } from './_components/pas';
import { Features } from './_components/features';
import { FinalCTA } from './_components/final-cta';
import { Pricing } from './_components/pricing';
import { FAQ } from './_components/faq';
import { QRCodeCard } from './_components/qr-card';
import { E2EESection } from './_components/e2ee';

import { PromptInput } from './_components_v3/prompt-input';
import { PrefilledTemplates } from './_components_v3/prefilled-templates';
import { MagicButton } from './_components_v3/magic-button';
import { LoginOrGoButton } from './_components_v2/login-or-go-button';
import { Footer } from './_components_v2/footer';
import { MobileInputContainer } from './_components_mobile/MobileInputContainer';
import { DesktopInputContainer } from './_components/desktop-input/DesktopInputContainer';

export default function Page() {
  const [isInputFocused, setIsInputFocused] = useState(false);

  return (
    <>
      <div
        className="flex min-h-screen bg-[#141414] flex-1 flex-col font-nunito bg-no-repeat"
        /*       style={{
        background: 'radial-gradient(#E9DFDA 33%,#F3F2F1 67%)',
        backgroundPosition: '0 -150px',
        backgroundSize: '1600px 150px',
      }} */
      >
        <motion.nav
          className="top-0 z-50 flex w-full flex-col items-center justify-between border-b border-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.2,
            duration: 2,
            ease: [0, 0, 0.2, 1],
          }}
        >
          <div className="mx-auto px-5 md:px-2 max-w-[1536px] flex py-4 w-full items-center justify-between">
            <div className="flex items-center gap-0 md:pl-12">
              <a href="/" className="flex items-center gap-1">
                <p className="text-[28px] font-bold">apolo</p>
              </a>
            </div>
            <div className="flex items-center gap-4 md:pr-12">
              <a
                href={getWhatsappBotLinkWithMessage(
                  'hola!! soy nuevo en la app'
                )}
                target="_blank"
                className="hidden md:block"
              >
                <Button className="bg-white text-sm text-black hover:bg-white/90">
                  Comenzar prueba gratis
                </Button>
              </a>
              <LoginOrGoButton />
            </div>
          </div>
        </motion.nav>
        <main className="px-4 mx-auto w-full max-w-[1536px]">
          <section className="mb-[20px] flex min-h-[520px] relative w-full flex-col items-center justify-center md:mb-[0px] md:min-h-[600px]">
            <div className="mt-5 flex flex-col items-center px-4 md:mt-10">
              <motion.img
                src="/logos/logo-white.svg"
                className="object-contain mb-8"
                style={{ width: 33 }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0,
                  duration: 2.5,
                  ease: [0, 0, 0.2, 1],
                }}
              />
            </div>

            <motion.div
              className="flex flex-col items-center justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 2,
                delay: 0.8,
                ease: [0, 0, 0.2, 1],
              }}
            >
              <MagicButton className="mx-auto mb-4" />
              <div className="max-w-[850px] mb-6 md:mb-12">
                <h1 className="mb-3 flex items-center text-center gap-1 text-4xl font-bold sm:text-3xl md:mb-3 md:gap-0 md:text-5xl">
                  Registra tus gastos en 2 segundos desde WhatsApp
                </h1>
                <p className=" opacity-60 text-center text-base md:max-w-full md:text-base">
                  Envía un mensaje, audio o recibo — y tus reportes financieros
                  se actualizan al instante.{' '}
                </p>
              </div>
              <div className="flex items-center gap-6 justify-center">
                <motion.div
                  animate={{
                    scale: isInputFocused ? 0.9 : 1,
                  }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                >
                  <a
                    href={getWhatsappBotLinkWithMessage(
                      'hola!! soy nuevo en la app'
                    )}
                    target="_blank"
                  >
                    <Button
                      size={isInputFocused ? 'icon' : 'xl'}
                      className={`${
                        isInputFocused
                          ? 'bg-[#25D366] hover:bg-[#25D366]/90 w-11 h-11'
                          : 'bg-lemon hover:bg-lemon/90'
                      } text-sm lg:text-base text-black rounded-full transition-all duration-300 hover:scale-110 origin-bottom`}
                    >
                      {isInputFocused ? (
                        <BsWhatsapp className="w-5 h-5 text-white" />
                      ) : (
                        'Pruébalo ahora en WhatsApp'
                      )}
                    </Button>
                  </a>
                </motion.div>

                {/* Desktop Input Container */}
                <div className="hidden lg:block">
                  <DesktopInputContainer onFocusChange={setIsInputFocused} />
                </div>
              </div>

              <div className="mt-8 h-[700px] md:mt-16 lg:mt-32">
                <video
                  width="315px"
                  playsInline={true}
                  autoPlay={true}
                  muted={true}
                  loop={true}
                  poster="/static/video-poster-5d52795e8fdd8db4391411308bc0cce8.webp"
                  className="lg:hidden"
                >
                  <source
                    src="https://pub-ec8befc8b1f943689bc95c09db6dac80.r2.dev/apolo/mobile.mp4"
                    type="video/mp4"
                  />
                </video>

                {/* Desktop version */}
                <div className="hidden lg:block relative w-full">
                  <div className="relative w-full max-w-6xl rounded-2xl overflow-hidden border border-[#696969]">
                    {/* Frame/Layout container */}
                    <img
                      src="/landing/dash-layout.png"
                      alt="Dashboard Interface"
                      className="w-full object-cover relative z-10 pointer-events-none"
                    />

                    {/* Scrollable content */}
                    <motion.div
                      className="absolute inset-0 z-10 max-w-[698px] top-[30px] left-[315px]"
                      initial={{ y: 0 }}
                      style={{
                        y: useTransform(
                          useScroll({
                            offset: ['start 200px', 'end end'],
                          }).scrollYProgress,
                          [0, 1],
                          [0, -100] // Adjust this value based on how much you want to scroll
                        ),
                      }}
                    >
                      <img
                        src="/landing/dash-content.png"
                        alt="Dashboard Content"
                        className="w-full object-cover"
                      />
                    </motion.div>
                  </div>

                  <div className="absolute z-20 -right-[130px] top-[80px] w-[285px] rounded-3xl overflow-hidden border border-gray-800/30 shadow-2xl">
                    <img
                      src="/landing/mobile.png"
                      alt="Mobile Interface"
                      className="w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="w-full max-w-3xl">
              <div className="relative w-full">
                <div className="flex w-full flex-col items-center px-4">
                  {/* Mobile version */}
                  <div className="block md:hidden w-full">
                    <MobileInputContainer />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer className="mt-8 pb-28" />
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-[#141414] font-nunito">
      <nav className="sticky top-0 z-50 flex w-full flex-col items-center justify-between border-b border-transparent transition-all duration-200 ease-out">
        <div className="mx-auto px-2 max-w-[1536px] flex py-4 w-full items-center justify-between">
          <div className="flex items-center gap-8 md:pl-12">
            <a href="/" className="flex items-center gap-1">
              <img
                src="/logos/white-transparent.png"
                className="object-contain"
                style={{ width: 40 }}
              />
              <span className="text-white text-2xl font-bold">apolo</span>
            </a>
          </div>
          <div className="flex items-center gap-4 md:pr-12">
            <a
              href={getWhatsappBotLinkWithMessage('hola!! soy nuevo en la app')}
              target="_blank"
              className="hidden md:block"
            >
              <Button className="bg-white text-sm text-black hover:bg-white/90">
                Comenzar prueba gratis
              </Button>
            </a>
            <LoginOrGoButton />
          </div>
        </div>
      </nav>
      <main className="px-4 mx-auto w-full max-w-[1536px]">
        <section className="mb-[20px] flex min-h-[520px] relative w-full flex-col items-center justify-center md:mb-[0px] md:min-h-[600px]">
          <MagicButton />

          <div className="mb-2 mt-5 flex flex-col items-center px-4 text-center md:mb-4 md:mt-10">
            <h1 className="mb-2 flex items-center gap-1 text-2xl font-bold sm:text-3xl md:mb-3 md:gap-0 md:text-5xl">
              Simplifica tus finanzas
            </h1>
            <p className="mb-6 max-w-[25ch] text-center text-base md:max-w-full md:text-base">
              Registra tus gastos en segundos, con tu asistente personal de
              finanzas en WhatsApp
            </p>
          </div>
          <div className="w-full max-w-3xl">
            <div className="relative w-full">
              <div className="flex w-full flex-col items-center px-4">
                <PromptInput />
                <div className="relative flex max-w-full gap-1 mx-2 mt-5 md:mt-8">
                  <div className="w-full overflow-x-auto whitespace-nowrap scrollbar-hide md:overflow-visible">
                    <PrefilledTemplates />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden relative bg-gradient-to-b from-black to-[#14161B]">
      {/* <img
        src="/landing/array.png"
        alt="array"
        className="absolute top-0 w-full h-[400px]"
      /> */}
      <img
        id="left-deco"
        src="/landing/left-deco.png"
        alt="left-deco"
        className="absolute -top-[140px] w-[40%] -left-[140px]"
      />
      <img
        id="right-deco"
        src="/landing/right-deco.png"
        alt="left-deco"
        className="absolute -top-[140px] w-[40%] -right-[140px]"
      />

      {/* Navigation */}
      <header id="header" className="z-50 sticky top-0">
        <nav className="container relative mx-auto px-4 h-[90px] flex items-center justify-between">
          <a href="#left-deco" className="flex items-center gap-2">
            <img
              src="/logos/white-transparent.png"
              className="object-contain"
              style={{ width: 50 }}
            />
            <span className="text-white text-2xl font-medium">Apolo</span>
          </a>

          <NavigationMenu className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <NavigationMenuList className="hidden lg:flex gap-10">
              <NavigationMenuItem>
                <a
                  href="#features"
                  className="text-white text-sm font-semibold"
                >
                  Features
                </a>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <a href="#pricing" className="text-white text-sm font-semibold">
                  Pricing
                </a>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <a href="#faq" className="text-white text-sm font-semibold">
                  FAQ
                </a>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-2">
            <a
              href={getWhatsappBotLinkWithMessage('hola!! soy nuevo en la app')}
              target="_blank"
              className="hidden md:block"
            >
              <Button className="bg-white text-black hover:bg-white/90 rounded-full">
                Comenzar prueba gratis
              </Button>
            </a>
            <Link href="/login" prefetch>
              <Button
                variant="ghost"
                className="text-white gap-2 font-semibold hover:bg-white/10"
              >
                Iniciar sesión
                <LuArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main
        id="hero"
        className="container mx-auto px-4 pt-14 pb-20 text-center"
      >
        <div className="max-w-4xl mx-auto mb-6">
          {/*  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-800 bg-gray-900/50 mb-8">
            <span className="text-gray-400">Backed by</span>
            <div className="bg-orange-500/20 px-2 py-1 rounded">
              <span className="text-orange-500">Y Combinator</span>
            </div>
          </div> */}
          <ChatMessages />

          <div className="mb-6 mt-[20px] text-4xl md:text-6xl ">
            <h1 className="font-bold text-white">Registra tus gastos desde</h1>
            <TypingAnimation
              startOnView={true}
              className="text-4xl md:text-6xl"
            >
              WhatsApp
            </TypingAnimation>
          </div>
          <p className="text-gray-400 text-lg mb-8">
            Registra cada gasto en segundos, analiza tus hábitos de consumo y
            obtén claridad financiera—todo desde tu celular.
          </p>

          <a
            href={getWhatsappBotLinkWithMessage('hola!! soy nuevo en la app')}
            target="_blank"
            className="inline-block mb-6"
          >
            <Button
              size="lg"
              className="bg-white text-black hover:bg-white/90 rounded-full"
            >
              Comenzar prueba gratis
            </Button>
          </a>

          <div
            className={`rounded-2xl hidden md:flex mx-auto border shadow-lg p-8 flex-col md:flex-row items-center gap-6 max-w-xl w-full bg-black border-emerald-800/30`}
          >
            <div className="flex-shrink-0">
              <div className="w-48 h-48 bg-white p-2 rounded-lg">
                <img
                  src="/landing/qr-code.png"
                  alt="QR code to download Venmo app"
                  width={180}
                  height={180}
                  className="w-full h-full"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <h2 className={`text-2xl md:text-2xl font-semibold text-white`}>
                Escanea para empezar a registrar tus gastos
              </h2>

              <p className={`text-xl ${'text-gray-400'}`}>o</p>

              <a
                href={getWhatsappBotLinkWithMessage(
                  'hola!! soy nuevo en la app'
                )}
                target="_blank"
                className={`text-xl font-semibold ${'text-emerald-400 hover:underline'}`}
              >
                Inicia chat ahora
              </a>
            </div>
          </div>
        </div>

        {/* Interface Preview */}
        <div className="relative mt-20 rounded-xl overflow-hidden border border-gray-800">
          <img
            src="/landing/dashboard.png"
            alt="Tempo Labs Interface"
            width={1200}
            height={800}
            className="w-full"
          />
        </div>
      </main>

      <TryLive />

      <Pas />

      <Features />

      <FinalCTA />

      <E2EESection />

      <Pricing />

      <FAQ />

      <Footer />

      <QRCodeCard />
    </div>
  );
}
