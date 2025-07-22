'use client';

import { useState, useEffect } from 'react';
import {
  LockIcon,
  ShieldIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  KeyIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RainbowButton } from '@/components/magicui/rainbow-button';

// Componente para la animación de texto scramble
const TextScramble = ({
  finalText,
  initialText,
  isScrambling,
}: {
  finalText: string;
  initialText: string;
  isScrambling: boolean;
}) => {
  const [displayText, setDisplayText] = useState(initialText);
  const chars = '!<>-_\\/[]{}—=+*^?#________';

  useEffect(() => {
    if (!isScrambling) {
      return;
    }

    let iteration = 0;
    const maxIterations = 15;
    let interval: NodeJS.Timeout;

    const scramble = () => {
      if (iteration >= maxIterations) {
        clearInterval(interval);
        setDisplayText(finalText);
        return;
      }

      setDisplayText(
        finalText
          .split('')
          .map((char, idx) => {
            if (idx < iteration / 1.5) return finalText[idx];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      iteration += 1;
    };

    // Start with a mix of initial text and random chars
    setDisplayText(
      initialText
        .split('')
        .map((char, idx) => {
          if (Math.random() > 0.7) return char;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('')
    );

    interval = setInterval(scramble, 50);

    return () => clearInterval(interval);
  }, [finalText, initialText, isScrambling]);

  return <span className="font-mono whitespace-nowrap">{displayText}</span>;
};

export function E2EESection() {
  const [showRealData, setShowRealData] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(false);

  const handleDecrypt = () => {
    setIsDecrypting(true);
    setTimeout(() => {
      setIsDecrypted(true);
      setIsDecrypting(false);
    }, 1500);
  };

  const resetDecryption = () => {
    if (showRealData) {
      setIsDecrypted(false);
    }
  };

  useEffect(() => {
    resetDecryption();
  }, [showRealData]);

  return (
    <section className="w-full py-24 bg-black relative overflow-hidden">
      {/* Background gradient effect similar to Apolo landing */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-transparent opacity-50 pointer-events-none"></div>

      <div className="container overflow-hidden mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-6 w-full lg:w-1/2">
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 px-3 py-1"
            >
              <LockIcon className="h-3.5 w-3.5 mr-2" />
              Seguridad avanzada
            </Badge>

            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              🔒 Tu información, solo para ti
            </h2>

            <p className="text-zinc-400 text-lg">
              En Apolo, la privacidad es una prioridad. Toda tu información
              financiera está protegida con cifrado de extremo a extremo (E2EE),
              lo que significa que nadie, ni siquiera nosotros, puede acceder a
              tus datos.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                  <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                </div>
                <p className="ml-3 text-zinc-300">
                  Tus gastos están seguros y solo tú puedes verlos.
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                  <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                </div>
                <p className="ml-3 text-zinc-300">
                  Los datos en nuestra base están cifrados, sin riesgo de
                  exposición.
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                  <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                </div>
                <p className="ml-3 text-zinc-300">
                  Confianza total al registrar tus finanzas sin preocupaciones.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Button className="bg-white text-black hover:bg-white/90 rounded-full px-8">
                Comenzar prueba gratis
              </Button>
            </div>
          </div>

          {/* Right side - Visualization */}
          <div className="relative w-full lg:w-1/2">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20"></div>

            {!showRealData ? (
              <Card className="relative w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="p-1">
                  <div className="bg-black/40 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <ShieldIcon className="h-5 w-5 text-primary mr-2" />
                        <span className="text-white font-medium">
                          Datos cifrados
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-500 border-green-500/20"
                      >
                        Seguro
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="text-sm text-zinc-500 font-medium">
                          Transacciones
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                            <div className="text-xs text-zinc-500 mb-1">
                              Descripción
                            </div>
                            <div className="font-mono text-zinc-300 text-sm">
                              A7f3d9e2c...
                            </div>
                          </div>
                          <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                            <div className="text-xs text-zinc-500 mb-1">
                              Monto
                            </div>
                            <div className="font-mono text-zinc-300 text-sm">
                              B2e8c1f5d...
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-sm text-zinc-500 font-medium">
                          Datos personales
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                            <div className="text-xs text-zinc-500 mb-1">
                              Nombre
                            </div>
                            <div className="font-mono text-zinc-300 text-sm">
                              E3c5d7f9a...
                            </div>
                          </div>
                          <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                            <div className="text-xs text-zinc-500 mb-1">
                              Email
                            </div>
                            <div className="font-mono text-zinc-300 text-sm">
                              D1a9e3c5b...
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/30">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-zinc-400">
                            Estado de cifrado
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          >
                            E2EE Activo
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="relative w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl backdrop-blur-sm">
                <div className="p-1">
                  <div className="bg-black/40 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <EyeOffIcon className="h-5 w-5 text-primary mr-2" />
                        <span className="text-white font-medium">
                          Base de datos real
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      >
                        Cifrado E2EE
                      </Badge>
                    </div>

                    <div className="overflow-x-auto -mx-5 px-5">
                      <table className="w-full min-w-[240px] border-separate border-spacing-0">
                        <thead>
                          <tr>
                            {[
                              'id',
                              'contact_id',
                              'amount',
                              'description',
                              'currency',
                              'category_id',
                            ].map((header) => (
                              <th
                                key={header}
                                className="text-xs font-medium text-zinc-500 text-left pb-2 px-2"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border-t border-zinc-800 p-2 text-xs font-mono text-zinc-400">
                              67704690-5ba2-4d91-bf...
                            </td>
                            <td className="border-t border-zinc-800 p-2 text-xs font-mono text-zinc-400">
                              d0d93498-2289-473...
                            </td>
                            <td
                              className={`border-t border-zinc-800 p-2 text-xs font-mono ${
                                isDecrypted ? 'text-green-400' : 'text-zinc-400'
                              }`}
                            >
                              {isDecrypted || isDecrypting ? (
                                <TextScramble
                                  initialText="ro6POmylIvGlHt6wd1a+IZ6DPB..."
                                  finalText="S/ 120.50"
                                  isScrambling={isDecrypting}
                                />
                              ) : (
                                'ro6POmylIvGlHt6wd1a+IZ6DPB...'
                              )}
                            </td>
                            <td
                              className={`border-t border-zinc-800 p-2 text-xs font-mono ${
                                isDecrypted ? 'text-green-400' : 'text-zinc-400'
                              }`}
                            >
                              {isDecrypted || isDecrypting ? (
                                <TextScramble
                                  initialText="Zpj43TQx0l0i70VfSM2cv9ozM2ET..."
                                  finalText="Café Starbucks"
                                  isScrambling={isDecrypting}
                                />
                              ) : (
                                'Zpj43TQx0l0i70VfSM2cv9ozM2ET...'
                              )}
                            </td>
                            <td className="border-t border-zinc-800 p-2 text-xs font-mono text-zinc-400">
                              PEN
                            </td>
                            <td className="border-t border-zinc-800 p-2 text-xs font-mono text-zinc-400">
                              7dd023f6-286c-4639-86...
                            </td>
                          </tr>
                          <tr>
                            <td className="border-t border-zinc-800 p-2 text-xs font-mono text-zinc-400">
                              58a12f30-9c4e-42b7-ae...
                            </td>
                            <td className="border-t border-zinc-800 p-2 text-xs font-mono text-zinc-400">
                              c1e82a47-5f63-491...
                            </td>
                            <td
                              className={`border-t border-zinc-800 p-2 text-xs font-mono ${
                                isDecrypted ? 'text-green-400' : 'text-zinc-400'
                              }`}
                            >
                              {isDecrypted || isDecrypting ? (
                                <TextScramble
                                  initialText="pK8NzxRlJvTyHq3bA+7ZxCPR..."
                                  finalText="S/ 85.20"
                                  isScrambling={isDecrypting}
                                />
                              ) : (
                                'pK8NzxRlJvTyHq3bA+7ZxCPR...'
                              )}
                            </td>
                            <td
                              className={`border-t border-zinc-800 p-2 text-xs font-mono ${
                                isDecrypted ? 'text-green-400' : 'text-zinc-400'
                              }`}
                            >
                              {isDecrypted || isDecrypting ? (
                                <TextScramble
                                  initialText="rB30fCvMhUgQwWWrjdTAtXkcW0tld..."
                                  finalText="Supermercado Wong"
                                  isScrambling={isDecrypting}
                                />
                              ) : (
                                'rB30fCvMhUgQwWWrjdTAtXkcW0tld...'
                              )}
                            </td>
                            <td className="border-t border-zinc-800 p-2 text-xs font-mono text-zinc-400">
                              PEN
                            </td>
                            <td className="border-t border-zinc-800 p-2 text-xs font-mono text-zinc-400">
                              a4f91e25-73bd-48c2-95...
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/30">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="text-sm text-zinc-400">
                            Datos visibles para ti
                          </div>
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                            <span className="text-xs text-zinc-500">
                              Solo tú puedes descifrarlo
                            </span>
                          </div>
                        </div>
                        <RainbowButton
                          onClick={handleDecrypt}
                          disabled={isDecrypted || isDecrypting}
                          className={`relative overflow-hidden group ${
                            isDecrypted
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-white text-black'
                          }`}
                        >
                          <span className="relative z-10 flex items-center">
                            {isDecrypted ? (
                              <>
                                <CheckIcon className="h-3.5 w-3.5 mr-1.5" />
                                Desencriptado
                              </>
                            ) : (
                              <>
                                <KeyIcon className="h-3.5 w-3.5 mr-1.5" />
                                {isDecrypting
                                  ? 'Desencriptando...'
                                  : 'Desencriptar'}
                              </>
                            )}
                          </span>
                          <span className="absolute inset-0 translate-y-[100%] bg-black/30 group-hover:translate-y-[0%] transition-transform duration-200"></span>
                        </RainbowButton>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/30 rounded-full blur-3xl"></div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button
            onClick={() => setShowRealData(!showRealData)}
            variant="outline"
            size="lg"
            className="relative group overflow-hidden text-base rounded-full border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-white"
          >
            <span className="relative z-10 flex items-center">
              {showRealData ? (
                <>
                  <EyeIcon className="h-5 w-5 mr-2" />
                  Mostrar versión simplificada
                </>
              ) : (
                <>
                  <EyeOffIcon className="h-5 w-5 mr-2" />
                  ¿De verdad se ve así?
                </>
              )}
            </span>
            <span
              style={{
                mask: 'linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box,linear-gradient(rgb(0,0,0), rgb(0,0,0))',
                maskComposite: 'exclude',
              }}
              className="absolute inset-0 z-10 block rounded-[inherit] bg-[linear-gradient(-75deg,hsl(var(--primary)/10%)_calc(var(--x)+20%),hsl(var(--primary)/50%)_calc(var(--x)+25%),hsl(var(--primary)/10%)_calc(var(--x)+100%))] p-px"
            ></span>
            <span className="absolute inset-0 translate-y-[100%] bg-primary group-hover:translate-y-[0%] transition-transform duration-200"></span>
          </Button>
        </div>

        <div className="text-center mt-16">
          <p className="text-zinc-300 text-lg font-medium">
            Tu dinero, tus reglas. Sin riesgos, sin complicaciones. 🚀
          </p>
        </div>
      </div>
    </section>
  );
}
