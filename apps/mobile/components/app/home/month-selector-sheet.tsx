import React from 'react';
import { View, Pressable, FlatList } from 'react-native';
import ActionSheet, {
  SheetManager,
  SheetProps,
} from 'react-native-actions-sheet';

import { useAppContext } from '@/components/app/app-context';

import { Text } from '@/components/ui/text';
import { useAnalytics } from '@/hooks/use-analytics';

const months = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

export const MonthSelectorSheet: React.FC<SheetProps<'month-selector'>> = (
  props
) => {
  const { locale, selectedTab, showAmount = true } = props.payload ?? {};
  const { year, month, setMonth, setYear, currency } = useAppContext();

  const { data } = useAnalytics({
    year,
    currency,
    month,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale ?? 'es-PE', {
      style: 'currency',
      currency: currency ?? 'PEN',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <ActionSheet
      gestureEnabled={true}
      indicatorStyle={{
        width: 100,
        backgroundColor: '#9CA3AF',
        marginTop: 10,
      }}
      containerStyle={{
        backgroundColor: '#05060A',
      }}
    >
      <View className="bg-black px-6">
        <Text
          className="text-left text-white text-4xl mr-auto mt-8"
          style={{
            fontFamily: 'Nunito_800ExtraBold',
          }}
        >
          mes
        </Text>
        <View className="overflow-x-auto mt-4 mb-4">
          <View className="flex space-x-3 w-fit">
            {[2025].map((year) => (
              <Pressable
                key={year}
                onPress={() => setYear(year)} // Reset month selection when changing year
                className={`
        rounded-full self-start bg-[#1a1a1a] px-6 py-3 whitespace-nowrap
        ${year === 2025 ? 'bg-[#333333]' : ''}
      `}
              >
                <Text
                  className="text-xl text-white"
                  style={{
                    fontFamily: 'Nunito_700Bold',
                  }}
                >
                  {year}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="bg-[#1a1a1a] rounded-3xl mb-4 p-6 !h-fit">
          <FlatList
            numColumns={3}
            data={months}
            keyExtractor={(item) => item}
            renderItem={({ item: monthString, index }) => (
              <Pressable
                key={monthString}
                onPress={() => {
                  setMonth(index);
                  SheetManager.hide('month-selector');
                }}
                className={`
      py-8 flex-1 rounded-2xl flex items-center justify-center text-xl text-center transition-colors
      ${
        month === index
          ? selectedTab === 'expense'
            ? 'bg-yc-700'
            : 'bg-lemon-950'
          : ''
      }
    `}
              >
                <Text
                  className="text-white text-2xl text-center"
                  style={{
                    fontFamily:
                      month === index
                        ? 'Nunito_800ExtraBold'
                        : 'Nunito_600SemiBold',
                  }}
                >
                  {monthString}
                </Text>
                {showAmount ? (
                  data?.yearData.annualSummary.find(
                    (summary) => summary.month === index
                  )?.[selectedTab === 'expense' ? 'expense' : 'income'] ? (
                    <Text className="text-base px-2 text-white text-center">
                      {data?.yearData.annualSummary.find(
                        (summary) => summary.month === index
                      )?.[selectedTab === 'expense' ? 'expense' : 'income']
                        ? formatCurrency(
                            data?.yearData.annualSummary.find(
                              (summary) => summary.month === index
                            )?.[
                              selectedTab === 'expense' ? 'expense' : 'income'
                            ] ?? 0
                          )
                        : ''}
                    </Text>
                  ) : null
                ) : null}
              </Pressable>
            )}
          />
        </View>
      </View>
    </ActionSheet>
  );
};
