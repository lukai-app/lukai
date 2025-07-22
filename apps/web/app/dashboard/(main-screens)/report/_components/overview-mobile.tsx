'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { formatBigNumber } from '@/lib/helpers/currency';
interface OverviewProps {
  data: Array<{
    month: number; // 0 to 11
    income: number;
    expense: number;
    savings: number;
    name?: string;
  }>;
  locale: string;
  currency: string;
  year: number;
  selectedTab: 'expense' | 'income' | undefined;
}

export const MobileOverview: React.FC<OverviewProps> = (props) => {
  const { data, locale, currency, year, selectedTab } = props;

  // update data adding the month name
  data.forEach((item) => {
    item.name = new Date(year, item.month).toLocaleString(locale, {
      month: 'short',
    });
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <ScrollArea className="w-full px-4">
      <ChartContainer
        config={{
          ingresos: {
            label: 'Ingresos',
            color: 'hsl(var(--chart-2))',
          },
          gastos: {
            label: 'Gastos',
            color: '#F37212',
          },
        }}
        className="h-[300px] w-full"
      >
        <BarChart
          accessibilityLayer
          data={data}
          margin={{
            top: 20,
          }}
        >
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />

          <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
          {selectedTab === 'income' || selectedTab === undefined ? (
            <Bar
              dataKey="income"
              fill="var(--color-ingresos)"
              barSize={30}
              radius={4}
              maxBarSize={100}
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
          ) : null}
          {selectedTab === 'expense' || selectedTab === undefined ? (
            <Bar
              dataKey="expense"
              fill="var(--color-gastos)"
              barSize={30}
              radius={4}
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
          ) : null}
          {/* <Bar
            dataKey="savings"
            fill="var(--color-ahorros)"
            radius={[4, 4, 0, 0]}
          /> */}
        </BarChart>
      </ChartContainer>
      <ScrollBar orientation="horizontal" className="hidden" />
    </ScrollArea>
  );
};
