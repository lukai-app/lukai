'use client';

import { BarChart } from 'react-native-gifted-charts';

import { formatBigNumber } from '@/lib/helpers/currency';
import { Text } from '@/components/ui/text';

interface CategoryBreakdownProps {
  data: Array<{
    id: string;
    category: string;
    amount: number;
    color: string;
  }>;
  selectedTab: 'expense' | 'income';
  onSelectCategory: (id: string) => void;
}

export const MobileCategoryBreakdown: React.FC<CategoryBreakdownProps> = (
  props
) => {
  const { data: chartData, onSelectCategory, selectedTab } = props;

  return (
    <BarChart
      data={chartData
        .sort((a, b) => b.amount - a.amount)
        .map((item) => ({
          value: item.amount,
          frontColor: item.color,
          labelComponent: () => (
            <Text
              style={{
                color: '#9CA3AF',
                fontSize: 12,
                width: 80,
                textAlign: 'center',
                height: 25,
                fontFamily: 'Nunito_400Regular',
              }}
            >
              {item.category}
            </Text>
          ),
          topLabelComponent: () => (
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
              {formatBigNumber({ value: item.amount, decimals: true })}
            </Text>
          ),
          onPress: () => onSelectCategory(item.id),
        }))}
      barWidth={65}
      barBorderRadius={8}
      spacing={10}
      dashWidth={0}
      yAxisThickness={0}
      xAxisThickness={0}
      hideYAxisText={true}
      initialSpacing={0}
      overflowTop={20}
    />
  );
};
