'use client';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import {
  LogOutIcon,
  ListIcon,
  ScrollText,
  HomeIcon,
  LibraryIcon,
  CoinsIcon,
  XIcon,
  LinkIcon,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

import { useSession } from '@/app/_components/session-provider';
import { CurrencySelector } from './currency-selector';
import { YearSelector } from './year-selector';
import { SubscriptionStatus } from './subscription-status';
import { mixpanel } from '@/lib/tools/mixpanel';
import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MobileCurrencySelector } from '@/app/dashboard/_components/mobile-currency-selector';

const items = [
  {
    title: 'Home',
    url: '/dashboard',
    icon: HomeIcon,
    mixpanelEvent: 'home_visited',
  },
  {
    title: 'Reporte anual',
    url: '/dashboard/report',
    icon: ScrollText,
    mixpanelEvent: 'report_visited',
  },
  {
    title: 'Transacciones',
    url: '/dashboard/transactions',
    icon: ListIcon,
    mixpanelEvent: 'transactions_visited',
  },
  {
    title: 'Libros (beta)',
    url: '/dashboard/books',
    icon: LibraryIcon,
    mixpanelEvent: 'books_visited',
  },
  {
    title: 'Connections (beta)',
    url: '/dashboard/connections',
    icon: LinkIcon,
    mixpanelEvent: 'connections_visited',
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { theme } = useTheme();
  const { session, signOut } = useSession();
  const router = useRouter();
  return (
    <Sidebar collapsible="none" {...props}>
      <SidebarHeader>
        <Link href="/dashboard" className="flex flex-row gap-0 cursor-pointer">
          <img
            src={'/logos/white-transparent.png'}
            className="object-contain mt-1"
            style={{ height: 48 }}
          />
          <img
            src={'/logo-white.png'}
            className="object-contain"
            style={{ width: 106 }}
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <button
                      disabled={session?.user?.expenses_count === 0}
                      onClick={() => {
                        router.push(item.url);
                        mixpanel.track(item.mixpanelEvent, {
                          distinct_id: session?.user?.phone_number,
                          fecha_hora: new Date(),
                        });
                      }}
                      className="!px-4 !py-3 !rounded-full gap-5 !h-12"
                    >
                      <item.icon className="h-6 w-6" />
                      <span className="text-sm">{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
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
      </SidebarFooter>
    </Sidebar>
  );
}
