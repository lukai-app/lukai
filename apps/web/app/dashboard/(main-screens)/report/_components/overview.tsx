'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

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
}

export const Overview: React.FC<OverviewProps> = (props) => {
  const { data, locale, currency, year } = props;

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
    <ChartContainer
      config={{
        ingresos: {
          label: 'Ingresos',
          color: 'hsl(var(--chart-1))',
        },
        gastos: {
          label: 'Gastos',
          color: 'hsl(var(--chart-3))',
        },
      }}
      className="h-[300px] w-full"
    >
      <BarChart data={data} height={300} className="w-full">
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => formatCurrency(value).slice(0, -3)}
        />
        <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
        <Bar
          dataKey="income"
          fill="var(--color-ingresos)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="expense"
          fill="var(--color-gastos)"
          radius={[4, 4, 0, 0]}
        />
        {/* <Bar
            dataKey="savings"
            fill="var(--color-ahorros)"
            radius={[4, 4, 0, 0]}
          /> */}
      </BarChart>
    </ChartContainer>
  );
};
