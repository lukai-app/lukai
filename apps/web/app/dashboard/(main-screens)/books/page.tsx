'use client';

import { useState, useEffect } from 'react';
import { Text } from '@/components/ui/text';
import { useSession } from '@/app/_components/session-provider';
import { useAppContext } from '@/app/dashboard/_context/app-context';
import { importKey } from '@/lib/utils/encryption';
import { Books } from './_components/books';
import { MobileBooks } from './_components/mobile-books';
import { useMonthlyAccounting } from '@/app/dashboard/_hooks/use-monthly-accounting';
import { MonthSelector } from '@/app/dashboard/_components/month-selector';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileMonthSelector } from '@/app/dashboard/_components/mobile-month-selector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AccountingPage() {
  const { session } = useSession();
  const { currency } = useAppContext();
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const { year, month, setMonth } = useAppContext();
  const isMobile = useIsMobile();
  const [selectedTab, setSelectedTab] = useState<
    'journal' | 'ledger' | 'profit-loss' | 'balance'
  >('journal');

  const months = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];

  useEffect(() => {
    if (session?.encryptionKey) {
      importKey(session.encryptionKey).then(setCryptoKey);
    }
  }, [session?.encryptionKey]);

  const {
    data: decryptedData,
    isLoading,
    error,
  } = useMonthlyAccounting({
    year: year,
    month: month,
    currency,
    cryptoKey,
  });

  return (
    <>
      {isMobile ? (
        <>
          <div className="flex flex-col items-center p-4">
            <p className="text-muted-foreground mb-1">libros contables</p>
            <MobileMonthSelector
              locale={session?.user.favorite_locale || 'en-US'}
              selectedTab="expense"
              showAmount={false}
            />
          </div>

          <MobileBooks
            decryptedData={decryptedData}
            isLoading={isLoading}
            error={error}
            currency={currency}
            month={month}
            year={year}
          />
        </>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold">
              libro {selectedTab === 'journal' ? 'diario' : 'mayor'}
            </h1>
            <Tabs
              className=""
              value={selectedTab}
              onValueChange={(value) =>
                setSelectedTab(value as 'journal' | 'ledger')
              }
            >
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="journal">libro diario</TabsTrigger>
                <TabsTrigger value="ledger">libro mayor</TabsTrigger>
                <TabsTrigger value="profit-loss">
                  estado de resultados
                </TabsTrigger>
                <TabsTrigger value="balance">balance general</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <MonthSelector
            selectedMonth={month}
            setSelectedMonth={setMonth}
            year={year}
            className="mb-2"
          />

          <Books
            selectedTab={selectedTab}
            decryptedData={decryptedData}
            isLoading={isLoading}
            error={error}
            currency={currency}
            month={month}
            year={year}
          />
        </>
      )}
    </>
  );
}
