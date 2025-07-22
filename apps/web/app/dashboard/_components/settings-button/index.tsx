'use client';

import {
  FolderTree,
  SettingsIcon,
  Star,
  XIcon,
  CreditCard,
  HelpCircle,
  Activity,
  History,
} from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { APP_VERSION } from '@/lib/constants/app';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import { useSession } from '@/app/_components/session-provider';
import { SubscriptionStatusSimple } from '@/app/dashboard/_components/settings-button/subscription-status-simple';
import { getWhatsappBotLinkWithMessage } from '@/lib/constants/chat';
import { LegalButton } from '@/app/dashboard/_components/settings-button/legal-button';
import { CountrySelector } from '@/app/dashboard/_components/settings-button/country-selector';
import { LanguageSelector } from '@/app/dashboard/_components/settings-button/language-selector';
import { TimezoneSelector } from '@/app/dashboard/_components/settings-button/timezone-selector';
import { CurrencySelector } from '@/app/dashboard/_components/settings-button/currency-selector';
import { LocaleSelector } from '@/app/dashboard/_components/settings-button/locale-selector';

interface SettingsButtonProps {
  className?: string;
  locale: string;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({
  className,
  locale,
}) => {
  const { session } = useSession();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sectionsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 60; // Offset for header

      // Check which section is currently in view
      Object.entries(sectionsRef.current).forEach(([section, ref]) => {
        if (!ref) return;

        const { offsetTop, offsetHeight } = ref;

        if (
          scrollPosition >= offsetTop &&
          scrollPosition < offsetTop + offsetHeight
        ) {
          setActiveSection(section);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get the currency symbol
  const getCurrencySymbol = (currency: string) => {
    const formatter = new Intl.NumberFormat(locale ?? 'es-PE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    });
    return formatter.format(0).replace(/[0-9]/g, '').trim();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        className="bg-[#05060A] p-0 no-scrollbar min-h-screen overflow-y-auto w-full max-w-full border-none"
        closeButton={false}
      >
        {/* Header with close button */}
        <div className="p-4 flex gap-3 z-10 items-center bg-[#05060A] sticky top-0">
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="font-bold shrink-0">
              <XIcon className="h-5 w-5" />
            </Button>
          </SheetClose>
          <div className="flex flex-col">
            <SheetTitle className="text-left text-2xl font-bold">
              ajustes
            </SheetTitle>
          </div>
        </div>

        <div className="flex-1 space-y-8 px-4">
          {/* Features Section */}
          <div className="space-y-0">
            <h2
              className={`text-base font-medium px-1 sticky top-[60px] bg-[#05060A] py-2 z-[5] transition-colors ${
                activeSection === 'features' ? 'text-white' : 'text-gray-500'
              }`}
            >
              funciones
            </h2>
            <div
              ref={(el) => (sectionsRef.current['features'] = el)}
              className="rounded-xl bg-secondary/30 overflow-hidden"
            >
              <div className="space-y-1">
                {/* Income */}
                <div className="flex items-center justify-between p-4 transition-colors opacity-50">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mr-4">
                      <CreditCard className="h-5 w-5 text-green-500" />
                    </div>
                    <span className="text-lg">habilitar ingresos (pronto)</span>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex items-center justify-between p-4 transition-colors opacity-50">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mr-4">
                      <FolderTree className="h-5 w-5 text-blue-500" />
                    </div>
                    <span className="text-lg">categorías (pronto)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Region Section */}
          <div className="space-y-2">
            <h2
              className={`text-base font-medium px-1 sticky top-[60px] bg-[#05060A] py-2 z-[5] transition-colors ${
                activeSection === 'region' ? 'text-white' : 'text-gray-500'
              }`}
            >
              región
            </h2>
            <div
              ref={(el) => (sectionsRef.current['region'] = el)}
              className="rounded-xl bg-secondary/30 overflow-hidden"
            >
              <div className="space-y-1">
                {/* Country */}
                <CountrySelector />

                {/* Language */}
                <LanguageSelector />

                {/* Default Currency */}
                <CurrencySelector />

                {/* Locale */}
                <LocaleSelector />

                {/* Timezone */}
                <TimezoneSelector />
              </div>
            </div>
          </div>

          {/* More Section */}
          <div className="space-y-2">
            <h2
              className={`text-lg font-medium px-1 sticky top-[60px] bg-[#05060A] py-2 z-[5] transition-colors ${
                activeSection === 'more' ? 'text-white' : 'text-gray-500'
              }`}
            >
              más
            </h2>
            <div
              ref={(el) => (sectionsRef.current['more'] = el)}
              className="rounded-xl bg-secondary/30 overflow-hidden"
            >
              <div className="space-y-1">
                {/* Premium */}
                {session?.user && (
                  <SubscriptionStatusSimple user={session?.user} />
                )}

                {/* Review */}
                <button
                  onClick={() => {
                    window.open(
                      getWhatsappBotLinkWithMessage(
                        'Hola!! me gustaría dejar una reseña de la app'
                      ),
                      '_blank'
                    );
                  }}
                  className="flex text-left items-center w-full justify-between p-4 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="flex items-center shrink-0  justify-center w-10 h-10 rounded-full bg-gray-800 mr-4">
                      <Star className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <span className="text-lg">reseña</span>
                      <p className="text-sm text-gray-400">
                        envíanos comentarios en whatsapp
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    <svg
                      width="6"
                      height="10"
                      viewBox="0 0 6 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 9L5 5L1 1"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </button>

                {/* Help */}
                <button
                  onClick={() => {
                    window.open(
                      getWhatsappBotLinkWithMessage(
                        'Hola!! necesito ayuda con la app'
                      ),
                      '_blank'
                    );
                  }}
                  className="flex text-left items-center w-full justify-between p-4 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mr-4">
                      <HelpCircle className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <span className="text-lg">ayuda</span>
                      <p className="text-sm text-gray-400">
                        tuviste algún problema?
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    <svg
                      width="6"
                      height="10"
                      viewBox="0 0 6 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 9L5 5L1 1"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </button>

                {/* Legal */}
                <LegalButton />

                {/* Changelog */}
                <div className="flex items-center justify-between p-4 opacity-50 transition-colors">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mr-4">
                      <History className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <span className="text-lg">changelog (pronto)</span>
                      <p className="text-sm text-gray-400">
                        descubre las novedades de la app
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    <svg
                      width="6"
                      height="10"
                      viewBox="0 0 6 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 9L5 5L1 1"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Status */}
                <button
                  onClick={() => {
                    window.open('https://status.apolochat.com', '_blank');
                  }}
                  className="flex text-left items-center w-full justify-between p-4 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mr-4">
                      <Activity className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <span className="text-lg">estado</span>
                      <p className="text-sm text-gray-400">
                        todos los sistemas operativos
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    <svg
                      width="6"
                      height="10"
                      viewBox="0 0 6 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 9L5 5L1 1"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="flex my-6 pb-10 justify-center items-center flex-col gap-2">
            <p className="text-muted-foreground text-xs">v{APP_VERSION}</p>
            <p className="text-muted-foreground text-xs">síguenos en</p>
            <div className="flex flex-row gap-3">
              <a
                href="https://www.tiktok.com/@apollo.chat"
                className="hover:text-gray-300 text-gray-400"
              >
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 448 512"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                >
                  <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"></path>
                </svg>
                <span className="sr-only">TikTok</span>
              </a>
              <a
                href="https://www.instagram.com/apolo.chat/"
                className="hover:text-gray-300 text-gray-400"
              >
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 448 512"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                >
                  <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path>
                </svg>{' '}
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
