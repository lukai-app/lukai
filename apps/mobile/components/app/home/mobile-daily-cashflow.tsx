import { BarChart } from 'react-native-gifted-charts';

import DayjsSingleton from '@/lib/Dayjs';
import { formatBigNumber } from '@/lib/helpers/currency';
import { Text } from '@/components/ui/text';

interface MobileDailyCashFlowProps {
  data: Array<{
    day: string;
    amount: number;
  }>;
  selectedTab: 'expense' | 'income';
  locale: string;
  onSelectedDate: (date: string) => void;
}

export const MobileDailyCashFlow: React.FC<MobileDailyCashFlowProps> = (
  props
) => {
  const { data, locale, onSelectedDate, selectedTab } = props;

  const dayjs = DayjsSingleton.getInstance(locale);

  return (
    <BarChart
      data={data.map((item, index) => ({
        value: item.amount,
        labelComponent: () =>
          index % 2 === 0 ? (
            <Text
              style={{
                color: '#9CA3AF',
                fontSize: 12,
                width: 45,
                textAlign: 'center',
                height: 25,
                fontFamily: 'Nunito_400Regular',
              }}
            >
              {dayjs(item.day).format('ddd D')}
            </Text>
          ) : null,
        topLabelComponent: () =>
          item.amount > 0 ? (
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
              {formatBigNumber({ value: item.amount, decimals: false })}
            </Text>
          ) : null,
        onPress: () => onSelectedDate(item.day),
      }))}
      frontColor={selectedTab === 'expense' ? '#F37212' : '#2EB88A'}
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
