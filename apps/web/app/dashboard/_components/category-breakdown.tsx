'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Cell, Pie, PieChart } from 'recharts';

import { useSession } from '@/app/_components/session-provider';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { env } from '@/env';

interface CategoryBreakdownResponse {
  success: boolean;
  data: Array<{
    category: string;
    amount: number;
    color: string;
  }>;
  message: string;
}

const getCategoryBreakdownFunction = async (params: {
  month: number;
  year: number;
  token: string;
}) => {
  const { month, year } = params;

  const response = (await fetch(
    `${env.NEXT_PUBLIC_API_URL}/v1/charts/category-breakdown?month=${month}&year=${year}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.NEXT_PUBLIC_API_KEY,
        Authorization: `Bearer ${params.token}`,
      },
    }
  ).then((res) => res.json())) as CategoryBreakdownResponse;

  if (!response.success) {
    throw new Error(
      response.message || 'Failed to fetch category breakdown data'
    );
  }

  return response;
};

interface CategoryBreakdownProps {
  data: Array<{
    category: string;
    amount: number;
    color: string;
  }>;
  currency: string;
  locale: string;
  year: number;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = (props) => {
  const { data, currency, locale, year } = props;
  const { session } = useSession();

  const [chartData, setChartData] = useState(data);
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());

  const { isPending, mutateAsync: getCategoryBreakdown } = useMutation({
    mutationFn: getCategoryBreakdownFunction,
    onError: (error) => {
      console.error(error);
      toast.error(error.message);
    },
    onSuccess: (response: CategoryBreakdownResponse) => {
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

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Categorías de Gastos</CardTitle>
        {/*  <Select
          value={month}
          onValueChange={(value) => {
            setMonth(value);
            getCategoryBreakdown({
              month: parseInt(value),
              year: year,
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
        </Select> */}
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            ...Object.fromEntries(
              chartData.map((item, index) => [
                item.category,
                {
                  label: item.category,
                  color: item.color,
                },
              ])
            ),
          }}
          className="h-[300px] w-full"
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(entry) => `${entry.name}`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>{' '}
        <div>
          {chartData
            .filter((expense) => expense.amount > 0)
            .sort((a, b) => b.amount - a.amount)
            .map((expense, index) => (
              <div key={expense.category}>
                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: expense.color }}
                    />
                    <span>{expense.category}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};
