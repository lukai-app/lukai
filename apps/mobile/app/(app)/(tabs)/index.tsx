import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View, SafeAreaView, ScrollView, Pressable } from 'react-native';

import { cn } from '@/lib/utils';
import DayjsSingleton from '@/lib/Dayjs';
import { useSession } from '@/components/auth/ctx';
import { useAnalytics } from '@/hooks/use-analytics';
import { useAppContext } from '@/components/app/app-context';

import { Text } from '@/components/ui/text';
import { Header } from '@/components/app/header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon } from 'lucide-react-native';
import { SheetManager } from 'react-native-actions-sheet';
import { MobileDailyCashFlow } from '@/components/app/home/mobile-daily-cashflow';
import { MobileCategoryBreakdown } from '@/components/app/home/mobile-category-breakdown';
import { MobileRecentTransactions } from '@/components/app/home/mobile-recent-transactions';
import { mixpanelApp } from '@/lib/tools/mixpanel';
import { ANALYTICS_EVENTS } from '@/lib/analytics/constants';
import { AudioRecorder } from '@/components/audio-recorder';

const buildTransactionsUrl = (params: {
  tab?: string;
  category: string | null | undefined;
  dateFrom: Date | null | undefined;
  dateTo: Date | null | undefined;
}): `/transactions` | `/transactions?${string}` => {
  const searchParams = new URLSearchParams();

  if (params.tab) searchParams.append('tab', params.tab);
  if (params.category && params.category !== 'all')
    searchParams.append('category', params.category);
  if (params.dateFrom)
    searchParams.append('dateFrom', params.dateFrom.toISOString());
  if (params.dateTo) searchParams.append('dateTo', params.dateTo.toISOString());

  const queryString = searchParams.toString();
  return `/transactions${queryString ? `?${queryString}` : ''}` as
    | `/transactions`
    | `/transactions?${string}`;
};

export default function HomeScreen() {
  const { session } = useSession();
  const router = useRouter();
  const { year, month, currency } = useAppContext();
  const [selectedTab, setSelectedTab] = useState<'expense' | 'income'>(
    'expense'
  );

  const dayjs = DayjsSingleton.getInstance(
    session?.user.favorite_locale || 'en-US'
  );
  const selectedMonthStart = useMemo(() => {
    return dayjs().year(year).month(month).startOf('month').toDate();
  }, [year, month]);

  const selectedMonthEnd = useMemo(() => {
    return dayjs().year(year).month(month).endOf('month').toDate();
  }, [year, month]);

  const { data, isLoading, error } = useAnalytics({
    year,
    currency,
    month,
  });

  const displayText = useMemo(() => {
    const isCurrentMonth =
      month === new Date().getMonth() && year === new Date().getFullYear();

    return isCurrentMonth
      ? 'este mes'
      : `${dayjs().year(year).month(month).format('MMMM')} ${year}`;
  }, [month, year, dayjs]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(session?.user.favorite_locale || 'en-US', {
      style: 'currency',
      currency: data?.currency ?? 'PEN',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const FormattedMainTotal = ({ className }: { className: string }) => {
    const total =
      (data?.monthData.income.amount ?? 0) -
      (data?.monthData.expense.amount ?? 0);
    const parts = new Intl.NumberFormat(
      session?.user.favorite_locale || 'en-US',
      {
        style: 'currency',
        currency: data?.currency ?? 'PEN',
        minimumFractionDigits: 2,
        notation: 'compact',
      }
    ).formatToParts(total);

    return (
      <View className={cn('text-4xl flex flex-row font-bold', className)}>
        {parts.map((part, index) => {
          if (part.type === 'currency') {
            return (
              <Text
                key={index}
                className="ml-1 text-4xl text-white"
                style={{
                  fontFamily: 'Nunito_700Bold',
                }}
              >
                {part.value}
              </Text>
            );
          }
          if (part.type === 'integer') {
            return (
              <Text
                key={index}
                className="text-white text-4xl"
                style={{
                  fontFamily: 'Nunito_700Bold',
                }}
              >
                {part.value}
              </Text>
            );
          }
          if (part.type === 'decimal') {
            return (
              <Text
                key={index}
                className="text-[#9CA3AF] text-2xl"
                style={{
                  fontFamily: 'Nunito_700Bold',
                }}
              >
                {part.value}
              </Text>
            );
          }
          if (part.type === 'fraction') {
            return (
              <Text
                key={index}
                className="text-[#9CA3AF] text-2xl"
                style={{
                  fontFamily: 'Nunito_700Bold',
                }}
              >
                {part.value}
              </Text>
            );
          }
          return (
            <Text
              key={index}
              className="text-white text-4xl"
              style={{
                fontFamily: 'Nunito_700Bold',
              }}
            >
              {part.value}
            </Text>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#05060A' }}
      className="pt-6 px-3"
    >
      <ScrollView style={{ flex: 1 }}>
        <Header />

        <View className="flex flex-col items-center pt-6 px-4 mb-12">
          <Text className="text-[#9CA3AF] mb-2 text-lg">total</Text>

          <FormattedMainTotal className="mb-5" />

          <Tabs
            value={selectedTab}
            onValueChange={(value) =>
              setSelectedTab(value as 'expense' | 'income')
            }
            className="mb-3"
          >
            <TabsList className="flex !h-[50px] flex-row bg-transparent border border-[#1F2937] rounded-full p-1">
              <TabsTrigger
                value="expense"
                className={cn(
                  '!px-6 !py-1.5 rounded-full h-12',
                  selectedTab === 'expense' && '!bg-yc-500'
                )}
              >
                <Text
                  className={cn(
                    '!text-2xl',
                    selectedTab === 'expense' ? 'text-white' : 'text-[#9CA3AF]'
                  )}
                  style={{
                    fontFamily: 'Nunito_500Medium',
                  }}
                >
                  - {formatCurrency(data?.monthData.expense.amount ?? 0)}
                </Text>
              </TabsTrigger>
              <TabsTrigger
                value="income"
                className={cn(
                  'px-6 py-1.5 rounded-full h-12',
                  selectedTab === 'income' && '!bg-lemon-950'
                )}
              >
                <Text
                  className={cn(
                    '!text-2xl',
                    selectedTab === 'income' ? 'text-white' : 'text-[#9CA3AF]'
                  )}
                  style={{
                    fontFamily: 'Nunito_500Medium',
                  }}
                >
                  + {formatCurrency(data?.monthData.income.amount ?? 0)}
                </Text>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            onPress={() => {
              SheetManager.show('month-selector', {
                payload: {
                  locale: session?.user.favorite_locale || 'en-US',
                  selectedTab,
                  showAmount: true,
                },
              });
            }}
            size="sm"
            className="bg-[#1F2937] px-4 h-11 rounded-2xl gap-1 flex flex-row items-center justify-center"
          >
            <Text
              className="text-white"
              style={{
                fontFamily: 'Nunito_600SemiBold',
              }}
            >
              {displayText}
            </Text>{' '}
            <View className="mt-1">
              <ChevronDownIcon size={18} color="white" />
            </View>
          </Button>
        </View>

        <>
          {isLoading ? (
            <Text className="p-4 text-white">Loading...</Text>
          ) : error ? (
            <Text className="p-4 text-white">Error: {error.message}</Text>
          ) : data ? (
            <>
              <MobileDailyCashFlow
                data={
                  selectedTab === 'expense'
                    ? data.monthData.dailyCashFlow.map((item) => ({
                        day: item.day,
                        amount: item.expenses,
                        type: 'expense',
                      }))
                    : data.monthData.dailyCashFlow.map((item) => ({
                        day: item.day,
                        amount: item.income,
                        type: 'income',
                      }))
                }
                locale={session?.user.favorite_locale || 'en-US'}
                selectedTab={selectedTab}
                onSelectedDate={(date) => {
                  const dateStart = dayjs(date).startOf('day').toDate();
                  const dateEnd = dayjs(date).endOf('day').toDate();

                  mixpanelApp.track(ANALYTICS_EVENTS.TRANSACTIONS, {
                    distinct_id: session?.user?.phone_number,
                    from: 'daily_cashflow',
                  });

                  router.push(
                    buildTransactionsUrl({
                      tab: selectedTab,
                      category: null,
                      dateFrom: dateStart,
                      dateTo: dateEnd,
                    })
                  );
                }}
              />

              <View className="h-20"></View>

              <MobileCategoryBreakdown
                data={
                  selectedTab === 'expense'
                    ? data.monthData.expensesByCategory
                    : data.monthData.incomeByCategory
                }
                selectedTab={selectedTab}
                onSelectCategory={(category) => {
                  mixpanelApp.track(ANALYTICS_EVENTS.TRANSACTIONS, {
                    distinct_id: session?.user?.phone_number,
                    from: 'category_breakdown',
                  });

                  router.push(
                    buildTransactionsUrl({
                      tab: selectedTab,
                      category: category,
                      dateFrom: selectedMonthStart,
                      dateTo: selectedMonthEnd,
                    })
                  );
                }}
              />

              <View className="h-20"></View>

              <View className="px-4 pb-10">
                <MobileRecentTransactions
                  currency={session?.user.favorite_currency_code || 'PEN'}
                  locale={session?.user.favorite_locale || 'en-US'}
                  recentTransactions={data.monthData.lastTransactions}
                />
                <Pressable
                  onPress={() => {
                    mixpanelApp.track(ANALYTICS_EVENTS.TRANSACTIONS, {
                      distinct_id: session?.user?.phone_number,
                      from: 'recent_transactions',
                    });

                    router.push(
                      buildTransactionsUrl({
                        tab: selectedTab,
                        category: null,
                        dateFrom: selectedMonthStart,
                        dateTo: selectedMonthEnd,
                      })
                    );
                  }}
                  className="py-3 mt-4 bg-zinc-800 rounded-[16px] items-center justify-center"
                >
                  <Text
                    style={{
                      fontFamily: 'Nunito_700Bold',
                    }}
                    className="text-white"
                  >
                    ver todas las transacciones
                  </Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </>
      </ScrollView>

      <AudioRecorder className="absolute bottom-5 w-full items-center ml-3" />
    </SafeAreaView>
  );
}
