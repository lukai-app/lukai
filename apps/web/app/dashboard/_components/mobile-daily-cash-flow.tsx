'use client';

import { XAxis, LabelList } from 'recharts';

import { Bar, BarChart } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import DayjsSingleton from '@/lib/helpers/Dayjs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { formatBigNumber } from '@/lib/helpers/currency';
import { cn } from '@/lib/utils';

interface MobileDailyCashFlowProps {
  data: Array<{
    day: string;
    amount: number;
  }>;
  selectedTab: 'expense' | 'income';
  locale: string;
  onSelectedDate: (date: string) => void;
  className?: string;
}

export const MobileDailyCashFlow: React.FC<MobileDailyCashFlowProps> = (
  props
) => {
  const { data, locale, onSelectedDate, selectedTab, className } = props;

  const dayjs = DayjsSingleton.getInstance(locale);

  const chartConfig = {
    amount: {
      label: selectedTab === 'expense' ? 'Gastos' : 'Ingresos',
      color: selectedTab === 'expense' ? '#F37212' : 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig;

  return (
    <ScrollArea className={cn('w-full px-4', className)}>
      <ChartContainer config={chartConfig} className="h-[300px] w-full ">
        <BarChart
          accessibilityLayer
          data={data}
          margin={{
            top: 20,
          }}
        >
          <XAxis
            dataKey="day"
            tickMargin={8}
            tickFormatter={(value) => dayjs(value).format('ddd D')}
            tickLine={false}
            axisLine={false}
          />

          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(value) => dayjs(value).format('ddd D')}
              />
            }
          />
          <Bar
            dataKey="amount"
            radius={4}
            fill={'var(--color-amount)'}
            onClick={(e) => {
              const { payload } = e;
              onSelectedDate(payload.day);
            }}
            className="cursor-pointer"
          >
            <LabelList
              position="top"
              offset={12}
              className="fill-foreground"
              fontSize={12}
              formatter={(value: any) =>
                value ? formatBigNumber({ value, decimals: false }) : ''
              }
            />
          </Bar>
        </BarChart>
      </ChartContainer>
      <ScrollBar orientation="horizontal" className="hidden" />
    </ScrollArea>
  );
};
