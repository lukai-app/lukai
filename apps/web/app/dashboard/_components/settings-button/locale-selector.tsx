'use client';

import { useState, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Check, MapPin, Search } from 'lucide-react';
import { toast } from 'sonner';
import clm from 'country-locale-map';

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

interface LocaleSelectorProps {
  className?: string;
}

interface UpdateLocaleResponse {
  success: boolean;
  message: string;
  data?: {
    favorite_locale: string;
  };
}

interface LocaleItem {
  code: string;
  name: string;
  emoji: string;
}

const updateLocaleFunction = async (params: {
  locale: string;
  token: string;
}) => {
  const response = (await fetch(
    `${env.NEXT_PUBLIC_API_URL}/v1/users/update-locale`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.NEXT_PUBLIC_API_KEY,
        Authorization: `Bearer ${params.token}`,
      },
      body: JSON.stringify({ locale: params.locale }),
    }
  ).then((res) => res.json())) as UpdateLocaleResponse;

  if (!response.success) {
    throw new Error(response.message || 'Failed to update locale');
  }

  return response;
};

export const LocaleSelector: React.FC<LocaleSelectorProps> = ({
  className,
}) => {
  const { session, signIn } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Extract locales from countries
  const locales = useMemo(() => {
    const countries = clm.getAllCountries();
    const localeMap = new Map<string, LocaleItem>();

    // Then add all other locales from countries
    countries.forEach((country) => {
      if (country.locales && country.locales.length > 0) {
        country.locales.forEach((locale) => {
          if (!localeMap.has(locale)) {
            localeMap.set(locale, {
              code: locale,
              name: `${country.name} (${locale.replaceAll('_', '-')})`,
              emoji: country.emoji,
            });
          }
        });
      }
    });

    return Array.from(localeMap.values());
  }, []);

  // Use useMemo for filtered locales to improve performance
  const filteredLocales = useMemo(() => {
    if (!searchQuery) return locales;

    return locales.filter(
      (locale) =>
        locale.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        locale.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, locales]);

  const { isPending, mutateAsync: updateLocale } = useMutation({
    mutationFn: updateLocaleFunction,
    onError: (error) => {
      console.error(error);
      toast.error(error.message);
    },
    onSuccess: (response) => {
      toast.success(
        response.message || 'configuración regional actualizada con éxito'
      );
      if (response.success && response.data && session) {
        // Update session with new locale
        signIn({
          ...session,
          user: {
            ...session.user,
            favorite_locale: response.data.favorite_locale,
          },
        });
      }
      setIsOpen(false);
    },
  });

  const handleLocaleSelect = async (localeCode: string) => {
    if (!session?.token) return;
    setIsOpen(false);
    setSearchQuery('');
    await updateLocale({
      locale: localeCode,
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
              <MapPin className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <span className="text-lg">configuración regional</span>
              <p className="text-sm text-gray-400">
                {session?.user?.favorite_locale || 'No seleccionado'}
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
            selecciona tu configuración regional
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="relative flex items-center w-full">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 absolute left-4" />
            <Input
              type="search"
              placeholder="buscar configuración regional"
              className="pl-10 h-14 w-full rounded-lg text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[400px]">
            <div className="space-y-1">
              {filteredLocales.map((locale) => (
                <button
                  key={locale.code}
                  onClick={() =>
                    handleLocaleSelect(locale.code.replaceAll('_', '-'))
                  }
                  disabled={isPending}
                  className={`flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-800 transition-colors ${
                    session?.user?.favorite_locale === locale.code
                      ? 'bg-gray-800'
                      : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="text-lg mr-2">{locale.emoji}</div>
                    <span>{locale.name}</span>
                  </div>
                  {session?.user?.favorite_locale === locale.code && (
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
