'use client';

import { useState, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Check, Clock, Search } from 'lucide-react';
import { toast } from 'sonner';
import * as ct from 'countries-and-timezones';

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

interface TimezoneSelectorProps {
  className?: string;
}

interface UpdateTimezoneResponse {
  success: boolean;
  message: string;
  data?: {
    favorite_timezone: string;
  };
}

const updateTimezoneFunction = async (params: {
  timezone: string;
  token: string;
}) => {
  const response = (await fetch(
    `${env.NEXT_PUBLIC_API_URL}/v1/users/update-timezone`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.NEXT_PUBLIC_API_KEY,
        Authorization: `Bearer ${params.token}`,
      },
      body: JSON.stringify({ timezone: params.timezone }),
    }
  ).then((res) => res.json())) as UpdateTimezoneResponse;

  if (!response.success) {
    throw new Error(response.message || 'Failed to update timezone');
  }

  return response;
};

export const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({
  className,
}) => {
  const { session, signIn } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const timezones = ct.getAllTimezones();

  // Use useMemo for filtered timezones to improve performance
  const filteredTimezones = useMemo(() => {
    if (!searchQuery) return Object.values(timezones);

    return Object.values(timezones).filter(
      (timezone) =>
        timezone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        timezone.countries.some((country) =>
          country.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [searchQuery, timezones]);

  const { isPending, mutateAsync: updateTimezone } = useMutation({
    mutationFn: updateTimezoneFunction,
    onError: (error) => {
      console.error(error);
      toast.error(error.message);
    },
    onSuccess: (response) => {
      toast.success(response.message || 'zona horaria actualizada con éxito');
      if (response.success && response.data && session) {
        // Update session with new timezone
        signIn({
          ...session,
          user: {
            ...session.user,
            favorite_timezone: response.data.favorite_timezone,
          },
        });
      }
      setIsOpen(false);
    },
  });

  const handleTimezoneSelect = async (timezone: string) => {
    if (!session?.token) return;
    setIsOpen(false);
    setSearchQuery('');
    await updateTimezone({
      timezone,
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
              <Clock className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <span className="text-lg">zona horaria</span>
              <p className="text-sm text-gray-400">
                {session?.user?.favorite_timezone || 'No seleccionada'}
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
            selecciona tu zona horaria
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="relative flex items-center w-full">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 absolute left-4" />
            <Input
              type="search"
              placeholder="buscar zona horaria"
              className="pl-10 h-14 w-full rounded-lg text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[400px]">
            <div className="space-y-1">
              {filteredTimezones.map((timezone) => (
                <button
                  key={timezone.name}
                  onClick={() => handleTimezoneSelect(timezone.name)}
                  disabled={isPending}
                  className={`flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-800 transition-colors ${
                    session?.user?.favorite_timezone === timezone.name
                      ? 'bg-gray-800'
                      : ''
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-muted-foreground w-16 text-center bg-[#1a1a1a] rounded-full px-2 py-1 mr-3 font-medium">
                      {timezone.utcOffsetStr}
                    </span>
                    <span>{timezone.name}</span>
                  </div>
                  {session?.user?.favorite_timezone === timezone.name && (
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
