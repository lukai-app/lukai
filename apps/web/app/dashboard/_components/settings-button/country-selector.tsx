'use client';

import { useState, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Check, Globe, Search } from 'lucide-react';
import clm from 'country-locale-map';
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

interface CountrySelectorProps {
  className?: string;
}

interface UpdateCountryResponse {
  success: boolean;
  message: string;
  data?: {
    country_code: string;
  };
}

const updateCountryFunction = async (params: {
  country_code: string;
  token: string;
}) => {
  const response = (await fetch(
    `${env.NEXT_PUBLIC_API_URL}/v1/users/update-country`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.NEXT_PUBLIC_API_KEY,
        Authorization: `Bearer ${params.token}`,
      },
      body: JSON.stringify({ country_code: params.country_code }),
    }
  ).then((res) => res.json())) as UpdateCountryResponse;

  if (!response.success) {
    throw new Error(response.message || 'Failed to update country');
  }

  return response;
};

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  className,
}) => {
  const { session, signIn } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const countries = clm.getAllCountries();

  // Use useMemo for filtered countries to improve performance
  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;

    return countries.filter((country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, countries]);

  const { isPending, mutateAsync: updateCountry } = useMutation({
    mutationFn: updateCountryFunction,
    onError: (error) => {
      console.error(error);
      toast.error(error.message);
    },
    onSuccess: (response) => {
      toast.success(response.message || 'País actualizado con éxito');
      if (response.success && response.data && session) {
        // Update session with new country code
        signIn({
          ...session,
          user: {
            ...session.user,
            country_code: response.data.country_code,
          },
        });
      }
      setIsOpen(false);
    },
  });

  const handleCountrySelect = async (countryCode: string) => {
    if (!session?.token) return;
    setIsOpen(false);
    setSearchQuery('');
    await updateCountry({
      country_code: countryCode,
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
              <Globe className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <span className="text-lg">país</span>
              <p className="text-sm text-gray-400">
                {session?.user?.country_code
                  ? clm.getCountryNameByAlpha2(session?.user?.country_code)
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
            selecciona tu país
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="relative flex items-center w-full">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 absolute left-4" />
            <Input
              type="search"
              placeholder="buscar país"
              className="pl-10 h-14 w-full rounded-lg text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[400px]">
            <div className="space-y-1">
              {filteredCountries.map((country) => (
                <button
                  key={country.alpha2}
                  onClick={() => handleCountrySelect(country.alpha2)}
                  disabled={isPending}
                  className={`flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-800 transition-colors ${
                    session?.user?.country_code === country.alpha2
                      ? 'bg-gray-800'
                      : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="text-lg mr-2">{country.emoji}</div>
                    <span>{country.name}</span>
                  </div>
                  {session?.user?.country_code === country.alpha2 && (
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
