'use client';
import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import { SessionProvider } from './session-provider';

export const ClientProviders = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient();

  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="dark" attribute="class">
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};
