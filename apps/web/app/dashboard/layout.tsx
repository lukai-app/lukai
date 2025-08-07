'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './_components/app-sidebar';
import { useSession } from '@/app/_components/session-provider';
import { AppProvider } from '@/app/dashboard/_context/app-context';
import { mixpanel } from '@/lib/tools/mixpanel';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileNav } from './_components/mobile-nav';
import { getWhatsappBotLinkWithMessage } from '@/lib/constants/chat';
import { MobileHeader } from './_components/mobile-header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, isLoading, signOut } = useSession();
  const isMobile = useIsMobile();
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);

  const isHomePage = useMemo(() => {
    return pathname === '/dashboard';
  }, [pathname]);

  useEffect(() => {
    if (!session && !isLoading) {
      const timer = setTimeout(() => {
        setShowRedirectMessage(true);
        router.push('/login');
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (session) {
      mixpanel.track('dashboard_visited', {
        distinct_id: session.user.phone_number,
        fecha_hora: new Date(),
      });
    }
  }, [session, isLoading]);

  if (isLoading) return <div>Loading...</div>;

  if (!session && showRedirectMessage) {
    return <div>Redirecting...</div>;
  }

  if (session) {
    return (
      <>
        {isMobile ? (
          <AppProvider>
            <div className="bg-[#05060A] flex flex-col min-h-screen font-nunito pb-32">
              <MobileHeader />
              {children}
              <MobileNav
                isHomePage={isHomePage}
                onSettingsClick={() => {
                  router.push('/dashboard/report');
                  mixpanel.track('report_visited', {
                    distinct_id: session?.user?.phone_number,
                    fecha_hora: new Date(),
                  });
                }}
                onMicClick={() => {
                  if (isHomePage) {
                    const whatsappLinkToRegisterExpense =
                      getWhatsappBotLinkWithMessage(
                        'hola!! quiero registrar un gasto'
                      );
                    window.open(whatsappLinkToRegisterExpense, '_blank');
                  } else {
                    router.push('/dashboard');
                    mixpanel.track('home_visited', {
                      distinct_id: session?.user?.phone_number,
                      fecha_hora: new Date(),
                    });
                  }
                }}
                onPlusClick={() => {
                  router.push('/dashboard/books');
                  mixpanel.track('books_visited', {
                    distinct_id: session?.user?.phone_number,
                    fecha_hora: new Date(),
                  });
                }}
              />
            </div>
          </AppProvider>
        ) : (
          <AppProvider>
            <SidebarProvider className="font-nunito bg-[#010802] min-h-svh">
              <AppSidebar
                variant="inset"
                className="min-h-svh sticky top-0 w-[260px]"
              />
              <SidebarInset className="flex flex-1 flex-col">
                {children}
              </SidebarInset>
            </SidebarProvider>
          </AppProvider>
        )}
      </>
    );
  }

  return <></>;
}
