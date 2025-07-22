'use client';

import { useState, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Check, Languages, Search } from 'lucide-react';
import { toast } from 'sonner';
import { getLangNameFromCode } from 'language-name-map';

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

interface LanguageSelectorProps {
  className?: string;
}

interface UpdateLanguageResponse {
  success: boolean;
  message: string;
  data?: {
    favorite_language: string;
  };
}

// Define common languages to show in selector
const commonLanguages = [
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'en', name: 'English', native: 'English' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'sv', name: 'Swedish', native: 'Svenska' },
  { code: 'no', name: 'Norwegian', native: 'Norsk' },
  { code: 'fi', name: 'Finnish', native: 'Suomi' },
  { code: 'da', name: 'Danish', native: 'Dansk' },
  { code: 'cs', name: 'Czech', native: 'Čeština' },
];

const updateLanguageFunction = async (params: {
  language_code: string;
  token: string;
}) => {
  const response = (await fetch(
    `${env.NEXT_PUBLIC_API_URL}/v1/users/update-language`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.NEXT_PUBLIC_API_KEY,
        Authorization: `Bearer ${params.token}`,
      },
      body: JSON.stringify({ language_code: params.language_code }),
    }
  ).then((res) => res.json())) as UpdateLanguageResponse;

  if (!response.success) {
    throw new Error(response.message || 'Failed to update language');
  }

  return response;
};

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className,
}) => {
  const { session, signIn } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Use useMemo for filtered languages to improve performance
  const filteredLanguages = useMemo(() => {
    if (!searchQuery) return commonLanguages;

    return commonLanguages.filter(
      (language) =>
        language.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        language.native.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const { isPending, mutateAsync: updateLanguage } = useMutation({
    mutationFn: updateLanguageFunction,
    onError: (error) => {
      console.error(error);
      toast.error(error.message);
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Idioma actualizado con éxito');
      if (response.success && response.data && session) {
        // Update session with new language
        signIn({
          ...session,
          user: {
            ...session.user,
            favorite_language: response.data.favorite_language,
          },
        });
      }
      setIsOpen(false);
    },
  });

  const handleLanguageSelect = async (languageCode: string) => {
    if (!session?.token) return;
    setIsOpen(false);
    setSearchQuery('');
    await updateLanguage({
      language_code: languageCode,
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
              <Languages className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <span className="text-lg">idioma</span>
              <p className="text-sm text-gray-400">
                {session?.user?.favorite_language
                  ? getLangNameFromCode(session?.user?.favorite_language)?.name
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
            selecciona tu idioma
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="relative flex items-center w-full">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 absolute left-4" />
            <Input
              type="search"
              placeholder="buscar idioma"
              className="pl-10 h-14 w-full rounded-lg text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[400px]">
            <div className="space-y-1">
              {filteredLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                  disabled={isPending}
                  className={`flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-800 transition-colors ${
                    session?.user?.favorite_language === language.code
                      ? 'bg-gray-800'
                      : ''
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{language.name}</span>
                    <span className="text-sm text-gray-400">
                      ({language.native})
                    </span>
                  </div>
                  {session?.user?.favorite_language === language.code && (
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
