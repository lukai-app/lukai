'use client';
import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';

import { useSession } from '@/app/_components/session-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MobileCurrencySelector } from '@/app/dashboard/_components/mobile-currency-selector';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useSession();
  return (
    <>
      <nav className="h-[136px] hidden md:block">
        <div className="flex items-center gap-4 h-full justify-end w-full">
          <MobileCurrencySelector
            locale={session?.user.favorite_locale || 'en-US'}
            usedCurrencies={session?.user.used_currencies || []}
          />
          <Link
            href="/dashboard/my-account"
            type="button"
            className="data-[state=open]:bg-sidebar-accent flex items-center gap-2 transition-all hover:bg-sidebar-accent rounded-full px-4 py-[5px] data-[state=open]:text-sidebar-accent-foreground"
          >
            {/*  signOut();
                                mixpanel.track('logout', {
                                  distinct_id: session?.user?.phone_number,
                                  fecha_hora: new Date(),
                                }); */}
            <Avatar className="h-12 w-12 rounded-full">
              <AvatarImage src={''} alt={session?.user.name} />
              <AvatarFallback className="rounded-lg font-semibold text-base">
                {session?.user?.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left font-medium leading-tight">
              <span className="truncate">{session?.user.name ?? ''}</span>
              <span className="truncate text-sm text-muted-foreground">
                {session?.user.phone_number}
              </span>
            </div>
            <ChevronRightIcon className="h-4 ml-4 w-4 text-white" />
          </Link>
        </div>
      </nav>
      {children}
    </>
  );
}
