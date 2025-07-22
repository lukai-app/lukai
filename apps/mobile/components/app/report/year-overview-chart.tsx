import { BarChart } from 'react-native-gifted-charts';

import DayjsSingleton from '@/lib/Dayjs';

import { Text } from '@/components/ui/text';
import { formatBigNumber } from '@/lib/helpers/currency';

interface YearOverviewChartProps {
  data: Array<{
    month: number; // 0 to 11
    income: number;
    expense: number;
    savings: number;
    name?: string;
  }>;
  locale: string;
  year: number;
  selectedTab: 'expense' | 'income' | 'both';
}

export const YearOverviewChart = (props: YearOverviewChartProps) => {
  const { data, locale, year, selectedTab } = props;

  const dayjs = DayjsSingleton.getInstance(locale);

  /* const barData = [
7        {
8          value: 40,
9          label: 'Jan',
10          spacing: 2,
11          labelWidth: 30,
12          labelTextStyle: {color: 'gray'},
13          frontColor: '#177AD5',
14        },
15        {value: 20, frontColor: '#ED6665'},
16        {
17          value: 50,
18          label: 'Feb',
19          spacing: 2,
20          labelWidth: 30,
21          labelTextStyle: {color: 'gray'},
22          frontColor: '#177AD5',
23        }, */
  // we need to separe the income and expense on the same array adding the type
  const formattedDataForChart = data.flatMap((item) => [
    {
      ...item,
      type: 'income',
      amount: item.income,
      label: dayjs(new Date(year, item.month)).format('MMM'),
    },
    {
      ...item,
      type: 'expense',
      amount: item.expense,
      label: dayjs(new Date(year, item.month)).format('MMM'),
    },
  ]);

  return (
    <BarChart
      data={
        selectedTab === 'both'
          ? formattedDataForChart.map((item) => {
              if (item.type === 'income') {
                return {
                  value: item.amount,
                  frontColor: '#2EB88A',
                  spacing: 2,
                  labelComponent: () => (
                    <Text
                      style={{
                        color: '#9CA3AF',
                        fontSize: 12,
                        width: 60,
                        textAlign: 'center',
                        height: 25,
                        fontFamily: 'Nunito_400Regular',
                      }}
                    >
                      {dayjs(new Date(year, item.month)).format('MMM')}
                    </Text>
                  ),
                  topLabelComponent: () => {
                    const value = item.amount;

                    return value > 0 ? (
                      <Text
                        style={{
                          color: 'white',
                          fontSize: 12,
                          width: 50,
                          textAlign: 'center',
                          height: 25,
                          fontFamily: 'Nunito_400Regular',
                        }}
                      >
                        {formatBigNumber({ value, decimals: false })}
                      </Text>
                    ) : null;
                  },
                };
              } else {
                return {
                  value: item.amount,
                  frontColor: '#F37212',
                  topLabelComponent: () => {
                    const value = item.amount;

                    return value > 0 ? (
                      <Text
                        style={{
                          color: 'white',
                          fontSize: 12,
                          width: 50,
                          textAlign: 'center',
                          height: 25,
                          fontFamily: 'Nunito_400Regular',
                        }}
                      >
                        {formatBigNumber({ value, decimals: false })}
                      </Text>
                    ) : null;
                  },
                };
              }
            })
          : data.map((item) => ({
              value: selectedTab === 'income' ? item.income : item.expense,
              frontColor: selectedTab === 'income' ? '#2EB88A' : '#F37212',
              spacing: 2,
              labelComponent: () => (
                <Text
                  style={{
                    color: '#9CA3AF',
                    fontSize: 12,
                    width: 60,
                    textAlign: 'center',
                    height: 25,
                    fontFamily: 'Nunito_400Regular',
                  }}
                >
                  {dayjs(new Date(year, item.month)).format('MMM')}
                </Text>
              ),
              topLabelComponent: () => {
                const value =
                  selectedTab === 'income' ? item.income : item.expense;

                return value > 0 ? (
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 12,
                      width: 50,
                      textAlign: 'center',
                      height: 25,
                      fontFamily: 'Nunito_400Regular',
                    }}
                  >
                    {formatBigNumber({ value, decimals: false })}
                  </Text>
                ) : null;
              },
            }))
      }
      barWidth={25}
      barBorderRadius={3}
      spacing={6}
      dashWidth={0}
      yAxisThickness={0}
      xAxisThickness={0}
      hideYAxisText={true}
      initialSpacing={0}
      overflowTop={20}
    />
  );
};
