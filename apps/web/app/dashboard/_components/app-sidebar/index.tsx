'use client';
import { useRouter, usePathname } from 'next/navigation';
import {
  ListIcon,
  ScrollText,
  HomeIcon,
  LibraryIcon,
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
  SidebarMenuButton,
} from '@/components/ui/sidebar';

import { useSession } from '@/app/_components/session-provider';
import { mixpanel } from '@/lib/tools/mixpanel';
import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MobileCurrencySelector } from '@/app/dashboard/_components/mobile-currency-selector';
import { cn } from '@/lib/utils';

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
    title: 'Conexiones (beta)',
    url: '/dashboard/connections',
    icon: LinkIcon,
    mixpanelEvent: 'connections_visited',
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="none" {...props}>
      <SidebarHeader className="p-6 pb-4">
        <Link
          href="/dashboard"
          className="flex flex-row gap-2 items-center cursor-pointer"
        >
          <div className="w-7 h-7 bg-lukai-primary rounded-md flex items-center justify-center">
            <img
              src="/logos/logo-white.svg"
              alt="LukAI Logo"
              className="w-8 h-8"
            />
          </div>
          <span className="text-3xl font-bold text-lukai-primary">LukAI</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-4">
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
                      className={cn(
                        '!px-4 !py-3 !rounded-xl text-[#AFAFAF] gap-3 !h-12 font-medium',
                        pathname === item.url
                          ? 'bg-sidebar-accent text-primary !font-semibold hover:!text-primary'
                          : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <item.icon className="!h-5 !w-5" />
                      <span className="text-base">{item.title}</span>
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
