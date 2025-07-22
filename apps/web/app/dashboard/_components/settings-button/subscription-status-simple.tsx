import { CreditCard, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { AppUser } from '@/app/_components/session-provider';
import { lemonProductLink } from '@/lib/constants/lemon';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { env } from '@/env';
import { useSession } from '@/app/_components/session-provider';
import { mixpanel } from '@/lib/tools/mixpanel';
import { getWhatsappBotLinkWithMessage } from '@/lib/constants/chat';
import { cn } from '@/lib/utils';

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
  className?: string;
}

export function SubscriptionStatusSimple({
  user,
  className,
}: SubscriptionStatusProps) {
  // No subscription
  if (!user?.subscription) {
    return <NoSubscriptionButton user={user} className={className} />;
  }

  // Inactive subscription
  if (
    user.subscription.status !== 'active' &&
    user.subscription.status !== 'on_trial'
  ) {
    return <ReactivateSubscriptionButton className={className} />;
  }

  // Active subscription
  return <ManageSubscriptionButton className={className} />;
}

// Component 1: No subscription - Simple button
function NoSubscriptionButton({
  user,
  className,
}: {
  user: AppUser;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 hover:bg-gray-800 transition-colors cursor-pointer',
        className
      )}
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
      <div className="flex items-center">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mr-4">
          <Sparkles className="h-5 w-5 text-amber-400" />
        </div>
        <span className="text-lg">premium</span>
      </div>
      <div className="text-gray-400">
        <svg
          width="6"
          height="10"
          viewBox="0 0 6 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 9L5 5L1 1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

// Component 2: Inactive subscription - Simple button
function ReactivateSubscriptionButton({ className }: { className?: string }) {
  const { isLoading, getBillingPortal } = useBillingPortal();

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 hover:bg-gray-800 transition-colors cursor-pointer',
        className
      )}
      onClick={() => {
        window.open(
          getWhatsappBotLinkWithMessage(
            'Hola!! quiero reactivar mi suscripción'
          ),
          '_blank'
        );
      }}
    >
      <div className="flex items-center">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mr-4">
          <RefreshCw className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <span className="text-lg">activar premium</span>
          <p className="text-sm text-gray-400">
            reactivar tu suscripción para continuar
          </p>
        </div>
      </div>
      <div className="text-gray-400">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <svg
            width="6"
            height="10"
            viewBox="0 0 6 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
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
    </div>
  );
}

// Component 3: Active subscription - Simple button
function ManageSubscriptionButton({ className }: { className?: string }) {
  const { isLoading, getBillingPortal } = useBillingPortal();

  return (
    <button
      className={cn(
        'flex items-center w-full rounded-lg justify-between p-4 hover:bg-gray-800 transition-colors cursor-pointer',
        className
      )}
      onClick={() => {
        window.open(
          getWhatsappBotLinkWithMessage(
            'Hola!! quiero gestionar mi suscripción'
          ),
          '_blank'
        );
      }}
    >
      <div className="flex items-center">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mr-4">
          <CreditCard className="h-5 w-5 text-blue-400" />
        </div>
        <span className="text-lg">gestionar suscripción</span>
      </div>
      <div className="text-gray-400">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <svg
            width="6"
            height="10"
            viewBox="0 0 6 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
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
  );
}
