'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Home,
  HomeIcon,
  LibraryIcon,
  ScrollText,
  SparkleIcon,
} from 'lucide-react';

import { mixpanel } from '@/lib/tools/mixpanel';
import { useSession } from '@/app/_components/session-provider';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  isHomePage: boolean;
  onMicClick?: () => void;
  onPlusClick?: () => void;
  onSettingsClick?: () => void;
}

const springConfig = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
  mass: 1,
};

export const MobileNav = ({
  isHomePage,
  onMicClick,
  onPlusClick,
  onSettingsClick,
}: MobileNavProps) => {
  const pathname = usePathname();
  const { session } = useSession();
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#111111] shadow-md">
      <div className="flex items-center justify-between gap-1">
        <NavItem
          icon={
            <Home
              className={cn(
                'h-6 w-6',
                pathname === '/dashboard' ? 'text-blue-600' : 'text-gray-500'
              )}
            />
          }
          label="home"
          isActive={pathname === '/dashboard'}
          href="/dashboard"
          onClick={() => {
            mixpanel.track('home_visited', {
              distinct_id: session?.user?.phone_number,
              fecha_hora: new Date(),
            });
          }}
        />
        <NavItem
          icon={
            <ScrollText
              className={cn(
                'h-6 w-6',
                pathname === '/dashboard/report'
                  ? 'text-blue-600'
                  : 'text-gray-500'
              )}
            />
          }
          label="2025"
          isActive={pathname === '/dashboard/report'}
          href="/dashboard/report"
          onClick={() => {
            mixpanel.track('report_visited', {
              distinct_id: session?.user?.phone_number,
              fecha_hora: new Date(),
            });
          }}
        />
        {/* <button>
          <div className="relative -mt-6">
            <div className="absolute -inset-1.5 rounded-full bg-white shadow-lg"></div>
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white">
              <span className="text-2xl font-bold italic">v</span>
            </div>
          </div>
        </button> */}
        <NavItem
          icon={
            <LibraryIcon
              className={cn(
                'h-6 w-6',
                pathname === '/dashboard/books'
                  ? 'text-blue-600'
                  : 'text-gray-500'
              )}
            />
          }
          label="libros"
          isActive={pathname === '/dashboard/books'}
          href="/dashboard/books"
          onClick={() => {
            mixpanel.track('books_visited', {
              distinct_id: session?.user?.phone_number,
              fecha_hora: new Date(),
            });
          }}
        />
        <div className="flex flex-col items-center w-full py-3 opacity-50">
          <SparkleIcon className="h-6 w-6 text-gray-500" />
          <p className="text-xs text-gray-500">asistente</p>
        </div>
      </div>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  href: string;
  onClick: () => void;
  isPrimary?: boolean;
}

function NavItem({
  icon,
  label,
  isActive,
  href,
  onClick,
  isPrimary = false,
}: NavItemProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center w-full py-3"
      onClick={onClick}
    >
      {icon}
      <span
        className={`text-xs font-medium ${
          isActive ? 'text-blue-600' : 'text-gray-500'
        } ${isPrimary ? 'mt-1' : 'mt-1.5'}`}
      >
        {label}
      </span>
    </Link>
  );
}
