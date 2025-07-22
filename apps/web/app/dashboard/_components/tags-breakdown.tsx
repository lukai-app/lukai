'use client';
import { Bar, BarChart, LabelList, XAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { formatBigNumber } from '@/lib/helpers/currency';

interface TagsBreakdownProps {
  data: Array<{
    id: string;
    amount: number;
    tags: Array<{
      id: string;
      name: string;
    }>;
  }>;
  onSelectTag: (id: string) => void;
  selectedTab: 'expense' | 'income';
}

export const TagsBreakdown: React.FC<TagsBreakdownProps> = (props) => {
  const { data, onSelectTag, selectedTab } = props;

  const chartData = data.reduce<
    Array<{ id: string; tag: string; amount: number }>
  >((acc, transaction) => {
    transaction.tags.forEach((tag) => {
      const existingTag = acc.find((item) => item.id === tag.id);
      if (existingTag) {
        existingTag.amount += transaction.amount;
      } else {
        acc.push({
          id: tag.id,
          tag: tag.name,
          amount: transaction.amount,
        });
      }
    });
    return acc;
  }, []);

  return (
    <ScrollArea className="w-full px-4">
      <ChartContainer
        config={{
          ...Object.fromEntries(
            chartData.map((item) => [
              item.tag,
              {
                label: item.tag,
                color:
                  selectedTab === 'expense' ? '#F37212' : 'hsl(var(--chart-2))',
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
            dataKey="tag"
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
              onSelectTag(payload.id);
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
