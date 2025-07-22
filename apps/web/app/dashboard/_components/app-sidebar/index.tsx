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
import Link from 'next/link';

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

export function AppSidebar() {
  const { theme } = useTheme();
  const { session, signOut } = useSession();
  const router = useRouter();
  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 overflow-visible w-[280px]"
    >
      <div
        style={{
          height: 'unset',
        }}
        className="flex static flex-col w-[280px]"
      >
        <SidebarHeader className="h-[136px] flex w-full justify-center items-center">
          <Link
            href="/dashboard"
            className="flex flex-row gap-0 cursor-pointer"
          >
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
        <SidebarContent className="overflow-y-auto flex-1 pb-3">
          <SidebarGroup className="px-6 mb-4">
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
      </div>
    </Sidebar>
  );
}
