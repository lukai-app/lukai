'use client';

import { useState, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Check, DollarSign, Search } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from '@/app/_components/session-provider';
import { env } from '@/env';
import { cn } from '@/lib/utils';
import { currencyCodeData } from '@/lib/constants/currencies';

interface CurrencySelectorProps {
  className?: string;
}

interface UpdateCurrencyResponse {
  success: boolean;
  message: string;
  data?: {
    favorite_currency_code: string;
  };
}

const updateCurrencyFunction = async (params: {
  currency_code: string;
  token: string;
}) => {
  const response = (await fetch(
    `${env.NEXT_PUBLIC_API_URL}/v1/users/update-currency`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.NEXT_PUBLIC_API_KEY,
        Authorization: `Bearer ${params.token}`,
      },
      body: JSON.stringify({ currency_code: params.currency_code }),
    }
  ).then((res) => res.json())) as UpdateCurrencyResponse;

  if (!response.success) {
    throw new Error(response.message || 'Failed to update currency');
  }

  return response;
};

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  className,
}) => {
  const { session, signIn } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Get the currency symbol for display
  const getCurrencySymbol = (currency: string) => {
    try {
      const formatter = new Intl.NumberFormat(
        session?.user?.favorite_locale ?? 'es-PE',
        {
          style: 'currency',
          currency,
          minimumFractionDigits: 0,
        }
      );
      return formatter.format(0).replace(/[0-9]/g, '').trim();
    } catch (error) {
      return '';
    }
  };

  // Use useMemo for filtered currencies to improve performance
  const filteredCurrencies = useMemo(() => {
    if (!searchQuery) return Object.values(currencyCodeData);

    return Object.values(currencyCodeData).filter(
      (currency) =>
        currency.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        currency.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const { isPending, mutateAsync: updateCurrency } = useMutation({
    mutationFn: updateCurrencyFunction,
    onError: (error) => {
      console.error(error);
      toast.error(error.message);
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Moneda actualizada con éxito');
      if (response.success && response.data && session) {
        // Update session with new currency
        signIn({
          ...session,
          user: {
            ...session.user,
            favorite_currency_code: response.data.favorite_currency_code,
          },
        });
      }
      setIsOpen(false);
    },
  });

  const handleCurrencySelect = async (currencyCode: string) => {
    if (!session?.token) return;
    setIsOpen(false);
    setSearchQuery('');
    await updateCurrency({
      currency_code: currencyCode,
      token: session.token,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          disabled={isPending}
          className={cn(
            'flex w-full text-left items-center rounded-lg justify-between p-4 transition-colors cursor-pointer',
            !isPending && 'hover:bg-gray-800',
            className
          )}
        >
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mr-4">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <span className="text-lg">moneda predeterminada</span>
              <p className="text-sm text-gray-400">
                {session?.user?.favorite_currency_code
                  ? `${
                      session?.user?.favorite_currency_code
                    } (${getCurrencySymbol(
                      session?.user?.favorite_currency_code
                    )})`
                  : ''}
              </p>
            </div>
          </div>
          <div className="text-gray-400 w-6 h-6 flex items-center justify-center disabled:opacity-50">
            {isPending ? (
              <div className="h-4 w-4 border-2 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
            ) : (
              <svg
                width="6"
                height="10"
                viewBox="0 0 6 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="animate-in fade-in duration-300"
              >
                <path
                  d="M1 9L5 5L1 1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#05060A] border-[#3a3a3c] mx-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">
            selecciona tu moneda
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="relative flex items-center w-full">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 absolute left-4" />
            <Input
              type="search"
              placeholder="buscar moneda"
              className="pl-10 h-14 w-full rounded-lg text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[400px]">
            <div className="space-y-1">
              {/* Used currencies section (if applicable) */}
              {session?.user?.used_currencies &&
                session.user.used_currencies.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gray-400 text-sm mb-2 px-3">
                      monedas que más usas
                    </p>
                    {session.user.used_currencies.map((code) => {
                      const currency = Object.values(currencyCodeData).find(
                        (c) => c.type === code
                      );
                      if (!currency) return null;

                      return (
                        <button
                          key={`used-${currency.type}`}
                          onClick={() => handleCurrencySelect(currency.type)}
                          disabled={isPending}
                          className={`flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-800 transition-colors ${
                            session?.user?.favorite_currency_code ===
                            currency.type
                              ? 'bg-gray-800'
                              : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="text-muted-foreground w-16 text-center bg-[#1a1a1a] rounded-full px-2 py-1 mr-3 font-medium">
                              {currency.type}
                            </span>
                            <span>{currency.title}</span>
                          </div>
                          {session?.user?.favorite_currency_code ===
                            currency.type && (
                            <Check className="h-5 w-5 text-green-500" />
                          )}
                        </button>
                      );
                    })}
                    <div className="border-t border-gray-800 my-2"></div>
                  </div>
                )}

              {/* All currencies */}
              {filteredCurrencies.map((currency) => (
                <button
                  key={currency.type}
                  onClick={() => handleCurrencySelect(currency.type)}
                  disabled={isPending}
                  className={`flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-800 transition-colors ${
                    session?.user?.favorite_currency_code === currency.type
                      ? 'bg-gray-800'
                      : ''
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-muted-foreground w-16 text-center bg-[#1a1a1a] rounded-full px-2 py-1 mr-3 font-medium">
                      {currency.type}
                    </span>
                    <span>{currency.title}</span>
                  </div>
                  {session?.user?.favorite_currency_code === currency.type && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
