import { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import { cn } from '@/lib/utils';
import { useSession } from '@/components/auth/ctx';
import { useAnalytics } from '@/hooks/use-analytics';
import { useAppContext } from '@/components/app/app-context';

import { Header } from '@/components/app/header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { YearOverviewChart } from '@/components/app/report/year-overview-chart';
import { CashFlow } from '@/components/app/report/cash-flow';

export default function ReportScreen() {
  const { session } = useSession();
  const { year, month, currency } = useAppContext();
  const { data, isLoading, error } = useAnalytics({
    year,
    currency,
    month,
  });

  const [selectedTab, setSelectedTab] = useState<'expense' | 'income' | 'both'>(
    'both'
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(session?.user.favorite_locale || 'en-US', {
      style: 'currency',
      currency: data?.currency ?? 'PEN',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatBigNumber = ({
    value,
    decimals = true,
  }: {
    value: number;
    decimals: boolean;
  }) => {
    const numValue = Number(value);
    if (numValue >= 1000) {
      return `${(numValue / 1000).toFixed(0)}k`;
    } else if (numValue >= 1000000) {
      return `${(numValue / 1000000).toFixed(0)}M`;
    } else if (numValue >= 1000000000) {
      return `${(numValue / 1000000000).toFixed(0)}B`;
    } else if (numValue >= 1000000000000) {
      return `${(numValue / 1000000000000).toFixed(0)}T`;
    }
    return decimals ? numValue.toString() : Math.floor(numValue).toString();
  };

  const FormattedMainTotal = ({ className }: { className: string }) => {
    const total = data?.yearData.annualSummary.reduce(
      (acc, curr) => acc + (curr.income ?? 0) - (curr.expense ?? 0),
      0
    );
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
            onValueChange={(value) => {
              if (selectedTab === value) {
                setSelectedTab('both');
              } else {
                setSelectedTab(value as 'expense' | 'income');
              }
            }}
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
        </View>

        <>
          {isLoading ? (
            <Text className="p-4 text-white">Loading...</Text>
          ) : error ? (
            <Text className="p-4 text-white">Error: {error.message}</Text>
          ) : data ? (
            <>
              <YearOverviewChart
                data={data.yearData.annualSummary}
                locale={session?.user.favorite_locale || 'en-US'}
                year={year}
                selectedTab={selectedTab}
              />

              <View className="h-20"></View>

              {/* Cash flow */}
              <CashFlow
                data={data.yearData.cashFlow}
                currency={data.currency}
                locale={session?.user.favorite_locale || 'en-US'}
              />

              <View className="h-20"></View>
            </>
          ) : null}
        </>
      </ScrollView>
    </SafeAreaView>
  );
}
