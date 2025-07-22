'use client';
import { Bar, BarChart, LabelList, XAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { formatBigNumber } from '@/lib/helpers/currency';

interface CategoryBreakdownProps {
  data: Array<{
    id: string;
    category: string;
    amount: number;
    color: string;
  }>;
  onSelectCategory: (id: string) => void;
  selectedTab: 'expense' | 'income';
}

export const MobileCategoryBreakdown: React.FC<CategoryBreakdownProps> = (
  props
) => {
  const { data: chartData, onSelectCategory, selectedTab } = props;

  return (
    <ScrollArea className="w-full px-4">
      <ChartContainer
        config={{
          ...Object.fromEntries(
            chartData.map((item, index) => [
              item.category,
              {
                label: item.category,
                color: item.color,
                id: item.id,
              },
            ])
          ),
          amount: {
            label: selectedTab === 'expense' ? 'Gastos' : 'Ingresos',
            color:
              selectedTab === 'expense' ? '#F37212' : 'hsl(var(--chart-2))',
          },
        }}
        className="h-[300px] w-full"
      >
        <BarChart
          accessibilityLayer
          data={chartData.sort((a, b) => b.amount - a.amount)}
          margin={{
            top: 24,
          }}
        >
          <XAxis
            dataKey="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 7)}
          />

          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent labelFormatter={(value) => value} />}
          />

          <Bar
            dataKey="amount"
            fill={'var(--color-amount)'}
            radius={8}
            onClick={(e) => {
              const { payload } = e;
              onSelectCategory(payload.id);
            }}
            maxBarSize={100}
            className="cursor-pointer"
          >
            <LabelList
              position="top"
              offset={12}
              className="fill-foreground"
              fontSize={12}
              formatter={(value: any) =>
                formatBigNumber({ value, decimals: true })
              }
            />
          </Bar>

          <ChartTooltip content={<ChartTooltipContent />} />
        </BarChart>
      </ChartContainer>{' '}
      <ScrollBar orientation="horizontal" className="hidden" />
    </ScrollArea>
  );
};
