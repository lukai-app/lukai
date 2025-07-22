'use client';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

import { useSession } from '@/app/_components/session-provider';
import { toast } from 'sonner';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { session } = useSession();

  if (session) {
    toast.info('Sesión activa 😎, redirigiendo...');
    router.push('/dashboard');
  }

  return <Suspense>{children}</Suspense>;
}
