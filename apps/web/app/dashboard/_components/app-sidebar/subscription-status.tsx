import { CreditCard, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AppUser } from '@/app/_components/session-provider';
import { lemonProductLink } from '@/lib/constants/lemon';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { env } from '@/env';
import { useSession } from '@/app/_components/session-provider';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { BorderBeam } from '@/components/magicui/border-beam';
import { ShineBorder } from '@/components/magicui/shine-border';
import { mixpanel } from '@/lib/tools/mixpanel';
import { getWhatsappBotLinkWithMessage } from '@/lib/constants/chat';

function useBillingPortal() {
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useSession();

  const getBillingPortal = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/v1/subscriptions/billing-portal`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.NEXT_PUBLIC_API_KEY,
            Authorization: `Bearer ${session?.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get billing portal');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      // Open portal URL in new tab
      window.open(data.data.url, '_blank');
    } catch (error) {
      console.error('Error getting billing portal:', error);
      toast({
        title: 'Error',
        description: 'No se pudo obtener el portal de pagos. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, getBillingPortal };
}

interface SubscriptionStatusProps {
  user: AppUser;
}

export function SubscriptionStatus({ user }: SubscriptionStatusProps) {
  // No subscription
  if (!user?.subscription) {
    return <NoSubscriptionCard user={user} />;
  }

  // Inactive subscription
  if (
    user.subscription.status !== 'active' &&
    user.subscription.status !== 'on_trial'
  ) {
    return <ReactivateSubscriptionCard />;
  }

  // Active subscription
  return <ManageSubscriptionButton />;
}

// Component 1: No subscription - Conversion optimized card
function NoSubscriptionCard({ user }: { user: AppUser }) {
  return (
    <Card className="w-full bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700 shadow-lg overflow-hidden">
      <ShineBorder shineColor={['#A07CFE', '#FE8FB5', '#FFBE7B']} />

      <CardHeader className="pb-2 p-4">
        <CardTitle className="text-sm font-medium flex items-center text-zinc-100">
          <Sparkles className="h-4 w-4 mr-2 text-amber-400" />
          Mejora tu experiencia
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2 px-4">
        <CardDescription className="text-xs text-zinc-400">
          Desbloquea a tu asistente de finanzas personales y toma el control de
          tus finanzas.
        </CardDescription>
      </CardContent>
      <CardFooter className="px-4">
        <Button
          className="w-full !bg-white !text-black transition-all border-0"
          size="sm"
          onClick={() => {
            mixpanel.track('checkout_started', {
              distinct_id: user.phone_number,
              fecha_hora: new Date(),
              canal: 'web',
            });

            const checkoutLink = `${lemonProductLink}?checkout[custom][phone_number]=${
              user.phone_number
            }&checkout[billing_address][country]=${user.country_code ?? ''}`;
            window.open(checkoutLink, '_blank');
          }}
        >
          Iniciar suscripción
        </Button>
      </CardFooter>
    </Card>
  );
}

// Component 2: Inactive subscription - Conversion optimized card
function ReactivateSubscriptionCard() {
  const { isLoading, getBillingPortal } = useBillingPortal();

  return (
    <Card className="w-full bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700 shadow-lg overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium flex items-center text-zinc-100">
          <RefreshCw className="h-4 w-4 mr-2 text-emerald-400" />
          Reactiva tu suscripción
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <CardDescription className="text-xs text-zinc-400">
          Has perdido acceso a tu asistente de finanzas. Reactiva ahora para
          continuar.
        </CardDescription>
      </CardContent>
      <CardFooter className="px-4">
        <Button
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0"
          size="sm"
          //onClick={getBillingPortal}
          onClick={() => {
            window.open(
              getWhatsappBotLinkWithMessage(
                'Hola!! quiero reactivar mi suscripción'
              ),
              '_blank'
            );
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando...
            </>
          ) : (
            'Ir al portal para reactivar'
          )}
        </Button>
      </CardFooter>
      <BorderBeam duration={8} size={100} />
    </Card>
  );
}

// Component 3: Active subscription - Simple button
function ManageSubscriptionButton() {
  const { isLoading, getBillingPortal } = useBillingPortal();

  return (
    <SidebarMenuButton
      // onClick={getBillingPortal}
      onClick={() => {
        window.open(
          getWhatsappBotLinkWithMessage(
            'Hola!! quiero gestionar mi suscripción'
          ),
          '_blank'
        );
      }}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Abriendo portal
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4" />
          Gestionar suscripción
        </>
      )}
    </SidebarMenuButton>
  );
}
