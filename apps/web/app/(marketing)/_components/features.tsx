'use client';

import { ArrowUpRight, UserIcon } from 'lucide-react';
import { forwardRef, useRef } from 'react';

import { cn } from '@/lib/utils';
import { getWhatsappBotLinkWithMessage } from '@/lib/constants/chat';

import { AnimatedBeam } from '@/components/magicui/animated-beam';

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]',
        className
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = 'Circle';

export const Features = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  return (
    <section
      id="features"
      className="bg-black min-h-[100vh] flex items-center justify-center text-white py-16 px-4 md:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-6">
            <p className="text-purple-400">Integración</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Control Total de
              <br />
              Tus Finanzas
            </h1>
            <p className="text-gray-400 text-lg">
              Gestiona tus gastos de manera inteligente con nuestro agente de
              IA. Obtén insights valiosos y mantén el control de tus gastos sin
              complicaciones.
            </p>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  window.open(
                    getWhatsappBotLinkWithMessage('hola!! soy nuevo en la app'),
                    '_blank'
                  );
                }}
                className={`px-6 py-3 flex items-center gap-2 rounded-lg transition-colors ${'bg-purple-600 text-white'}`}
              >
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 448 512"
                  className="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
                </svg>{' '}
                Prueba Apolo en WhatsApp
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 my-auto">
            {/* Integration Cards */}
            <div className="relative">
              {/* Gradient Border Effect */}
              <div className="inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-2xl p-[1px]">
                <div className="bg-gray-900 h-full w-full rounded-2xl">
                  <div className="flex flex-col gap-4 p-6">
                    <div
                      className={cn(
                        'relative flex w-full items-center justify-center overflow-hidden md:p-10'
                      )}
                      ref={containerRef}
                    >
                      <div className="flex w-full max-w-lg flex-row items-stretch justify-between gap-10">
                        <div className="flex flex-col justify-center">
                          <Circle ref={div7Ref}>
                            <UserIcon className="text-black" />
                          </Circle>
                        </div>
                        <div className="flex flex-col justify-center">
                          <Circle ref={div6Ref} className="size-16">
                            <svg
                              width="100"
                              height="100"
                              viewBox="0 0 175.216 175.552"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-6 h-6"
                            >
                              <defs>
                                <linearGradient
                                  id="b"
                                  x1="85.915"
                                  x2="86.535"
                                  y1="32.567"
                                  y2="137.092"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop offset="0" stopColor="#57d163" />
                                  <stop offset="1" stopColor="#23b33a" />
                                </linearGradient>
                                <filter
                                  id="a"
                                  width="1.115"
                                  height="1.114"
                                  x="-.057"
                                  y="-.057"
                                  colorInterpolationFilters="sRGB"
                                >
                                  <feGaussianBlur stdDeviation="3.531" />
                                </filter>
                              </defs>
                              <path
                                d="m54.532 138.45 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.523h.023c33.707 0 61.139-27.426 61.153-61.135.006-16.335-6.349-31.696-17.895-43.251A60.75 60.75 0 0 0 87.94 25.983c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.558zm-40.811 23.544L24.16 123.88c-6.438-11.154-9.825-23.808-9.821-36.772.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954zm0 0"
                                fill="#b3b3b3"
                                filter="url(#a)"
                              />
                              <path
                                d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"
                                fill="#ffffff"
                              />
                              <path
                                d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.559 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.524h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.929z"
                                fill="url(#linearGradient1780)"
                              />
                              <path
                                d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"
                                fill="url(#b)"
                              />
                              <path
                                d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"
                                fill="#ffffff"
                                fillRule="evenodd"
                              />
                            </svg>
                          </Circle>
                        </div>
                        <div className="flex flex-col justify-center gap-2">
                          <Circle ref={div1Ref}>
                            <img
                              src="/logos/black-no-bg.png"
                              alt="Apolo logo"
                              className="w-6 h-6 shrink-0"
                            />
                          </Circle>
                        </div>
                      </div>

                      {/* AnimatedBeams */}
                      <AnimatedBeam
                        containerRef={containerRef}
                        fromRef={div1Ref}
                        toRef={div6Ref}
                        duration={2}
                      />
                      <AnimatedBeam
                        containerRef={containerRef}
                        fromRef={div6Ref}
                        toRef={div7Ref}
                        duration={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center justify-between rounded-md bg-[#121212]/50 px-3 py-2 ring-1 ring-white/5 transition-colors duration-500 hover:bg-[#121212]/60">
                <span className="text-base text-gray-300">
                  No más gastos sin registrar, todo en un solo lugar.{' '}
                </span>
                <span className="ring-1 w-5 h-5 shrink-0 ring-emerald-500 inline-flex items-center gap-x-1.5 rounded-[4px] px-1.5 py-0.5 text-sm/5 font-medium sm:text-xs/5 forced-colors:outline bg-zinc-600/10 text-emerald-500 group-data-[hover]:bg-zinc-600/20 dark:bg-white/5 dark:text-zinc-400 dark:group-data-[hover]:bg-white/10">
                  ✓
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-[#121212]/50 px-3 py-2 ring-1 ring-white/5 transition-colors duration-500 hover:bg-[#121212]/60">
                <span className="text-base text-gray-300">
                  Toma mejores decisiones con datos claros.
                </span>
                <span className="ring-1 w-5 h-5 shrink-0 ring-emerald-500 inline-flex items-center gap-x-1.5 rounded-[4px] px-1.5 py-0.5 text-sm/5 font-medium sm:text-xs/5 forced-colors:outline bg-zinc-600/10 text-emerald-500 group-data-[hover]:bg-zinc-600/20 dark:bg-white/5 dark:text-zinc-400 dark:group-data-[hover]:bg-white/10">
                  ✓
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-[#121212]/50 px-3 py-2 ring-1 ring-white/5 transition-colors duration-500 hover:bg-[#121212]/60">
                <span className="text-base text-gray-300">
                  Nunca más olvides cuánto has gastado.
                </span>
                <span className="ring-1 w-5 h-5 shrink-0 ring-emerald-500 inline-flex items-center gap-x-1.5 rounded-[4px] px-1.5 py-0.5 text-sm/5 font-medium sm:text-xs/5 forced-colors:outline bg-zinc-600/10 text-emerald-500 group-data-[hover]:bg-zinc-600/20 dark:bg-white/5 dark:text-zinc-400 dark:group-data-[hover]:bg-white/10">
                  ✓
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
