'use client';
import { SettingsButton } from '@/app/dashboard/_components/settings-button';
import { MobileCurrencySelector } from '@/app/dashboard/_components/mobile-currency-selector';
import { useSession } from '@/app/_components/session-provider';

export const MobileHeader: React.FC = () => {
  const { session } = useSession();

  return (
    <header className="w-full flex relative items-center p-4">
      <MobileCurrencySelector
        locale={session?.user.favorite_locale || 'en-US'}
        usedCurrencies={session?.user.used_currencies || []}
      />
      <img
        src={'/logos/white-transparent.png'}
        className="object-contain absolute left-1/2 -translate-x-1/2"
        style={{ width: 43 }}
      />
      <SettingsButton
        className="ml-auto"
        locale={session?.user.favorite_locale || 'en-US'}
      />
    </header>
  );
};
