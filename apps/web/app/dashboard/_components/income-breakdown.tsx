'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useSession } from '@/app/_components/session-provider';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { env } from '@/env';

interface IncomeBreakdownResponse {
  success: boolean;
  data: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  message: string;
}

const getIncomeBreakdownFunction = async (params: {
  month: number;
  token: string;
}) => {
  const { month } = params;

  const response = (await fetch(
    `/api/v1/charts/income-breakdown?month=${month}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.NEXT_PUBLIC_API_KEY,
        Authorization: `Bearer ${params.token}`,
      },
    }
  ).then((res) => res.json())) as IncomeBreakdownResponse;

  if (!response.success) {
    throw new Error(
      response.message || 'Failed to fetch income breakdown data'
    );
  }

  return response;
};

interface IncomeBreakdownProps {
  data: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  currency: string;
  locale: string;
}

export const IncomeBreakdown: React.FC<IncomeBreakdownProps> = (props) => {
  const { data, currency, locale } = props;
  const { session } = useSession();

  const [chartData, setChartData] = useState(data);
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());

  const { isPending, mutateAsync: getIncomeBreakdown } = useMutation({
    mutationFn: getIncomeBreakdownFunction,
    onError: (error) => {
      console.error(error);
      toast.error(error.message);
    },
    onSuccess: (response: IncomeBreakdownResponse) => {
      toast.success(response.message);
      if (response.success) {
        setChartData(response.data);
      }
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const chartConfig = {
    percentage: {
      label: 'Percentage',
      color: '#000',
    },
    amount: {
      label: 'Amount',
      color: '#000',
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ingresos</CardTitle>
        <Select
          value={month}
          onValueChange={(value: string) => {
            setMonth(value);
            getIncomeBreakdown({
              month: Number(value),
              token: session?.token ?? '',
            });
          }}
          disabled={isPending}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar mes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Enero</SelectItem>
            <SelectItem value="2">Febrero</SelectItem>
            <SelectItem value="3">Marzo</SelectItem>
            <SelectItem value="4">Abril</SelectItem>
            <SelectItem value="5">Mayo</SelectItem>
            <SelectItem value="6">Junio</SelectItem>
            <SelectItem value="7">Julio</SelectItem>
            <SelectItem value="8">Agosto</SelectItem>
            <SelectItem value="9">Septiembre</SelectItem>
            <SelectItem value="10">Octubre</SelectItem>
            <SelectItem value="11">Noviembre</SelectItem>
            <SelectItem value="12">Diciembre</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-w-screen-xl">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: -50, right: 50 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="percentage"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              type="category"
              dataKey="category"
              width={100}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="percentage"
              fill="var(--color-percentage)"
              radius={5}
              barSize={40}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
