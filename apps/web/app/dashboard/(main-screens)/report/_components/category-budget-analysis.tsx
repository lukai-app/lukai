'use client';

import React from 'react';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from 'recharts';

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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { env } from '@/env';
import { MobileCategorySelector } from '@/app/dashboard/_components/mobile-recent-transactions/mobile-category-selector';
import { ScrollBar } from '@/components/ui/scroll-area';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatBigNumber } from '@/lib/helpers/currency';

interface CategoryBudgetAnalysisProps {
  categories: Array<{
    value: string;
    label: string;
  }>;
  defaultData: {
    expenseCategoryId: string;
    totalSpent: number;
    monthlyAverage: number;
    monthlyData: Array<{
      month: number;
      amount: number;
      budgetTotal: number;
    }>;
  };
  year: number;
  currency: string;
  locale: string;
}

interface GetCategoryBudgetResponse {
  success: boolean;
  data: {
    expenseCategoryId: string;
    totalSpent: number;
    monthlyAverage: number;
    monthlyData: Array<{
      month: number;
      amount: number;
      budgetTotal: number;
    }>;
  };
  message: string;
}

const getCategoryBudgetFunction = async (params: {
  expenseCategoryId: string;
  year: number;
  currency: string;
  token: string;
}) => {
  const { expenseCategoryId, year, currency } = params;

  const response = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/v1/charts/category-budget?expenseCategoryId=${expenseCategoryId}&year=${year}&currency=${currency}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.NEXT_PUBLIC_API_KEY,
        Authorization: `Bearer ${params.token}`,
      },
    }
  ).then((res) => res.json() as Promise<GetCategoryBudgetResponse>);

  if (!response.success) {
    throw new Error(
      response.message || 'Failed to fetch income breakdown data'
    );
  }

  return response;
};

export const CategoryBudgetAnalysis: React.FC<CategoryBudgetAnalysisProps> = (
  props
) => {
  const { categories, defaultData, currency, locale, year } = props;
  const { session } = useSession();

  const [data, setData] = useState(defaultData);
  const [category, setCategory] = useState(defaultData.expenseCategoryId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const { mutate: getCategoryBudget, isPending } = useMutation({
    mutationFn: (categoryId: string) =>
      getCategoryBudgetFunction({
        expenseCategoryId: categoryId,
        year,
        currency,
        token: session?.token ?? '',
      }),
    onSuccess: (response: GetCategoryBudgetResponse) => {
      setData(response.data);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-semibold text-white">
            gasto por categoría
          </h3>
          <MobileCategorySelector
            selectedTab="expense"
            selectedCategory={category}
            setSelectedCategory={(value) => {
              setCategory(value);
              getCategoryBudget(value);
            }}
            showAll={false}
            mode="id"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              resumen de gastos
            </h4>
            <div className="grid gap-1">
              <div className="flex items-center justify-between">
                <p className="text-sm">total gastado:</p>
                <p className="font-medium">{formatCurrency(data.totalSpent)}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm">promedio mensual:</p>
                <p className="font-medium">
                  {formatCurrency(data.monthlyAverage)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-zinc-900 rounded-lg p-4">
        <ScrollArea className="w-full">
          <ChartContainer
            config={{
              amount: {
                label: 'gasto',
                color: '#F37212',
              },
            }}
            className="w-full h-[300px]"
          >
            <BarChart
              accessibilityLayer
              data={data.monthlyData.map((item) => ({
                month: new Date(year, item.month).toLocaleString(locale, {
                  month: 'short',
                }),
                amount: item.amount,
              }))}
              margin={{
                top: 24,
              }}
            >
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent labelFormatter={(value) => value} />
                }
              />{' '}
              <Bar
                dataKey="amount"
                fill="var(--color-amount)"
                radius={8}
                maxBarSize={100}
              >
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value: any) =>
                    value ? formatBigNumber({ value, decimals: true }) : ''
                  }
                />
              </Bar>
            </BarChart>
          </ChartContainer>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>
    </div>
  );
};

{
  /* <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Presupuesto Utilizado
                </h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">
                      {formatCurrency(data.budgetUsed)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      de {formatCurrency(data.budgetTotal)}
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-2xl font-bold">
                      {data.budgetUsed ?? 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Porcentaje usado
                    </p>
                  </div>
                </div>
                <Progress value={data.budgetUsed} className="h-3" />
              </div> */
}

/* <ChartContainer
          config={{
            amount: {
              label: 'Gasto',
              color: 'hsl(var(--chart-1))',
            },
          }}
          className="w-full h-[300px]"
        >
          <BarChart
            data={data.monthlyData.map((item) => ({
              month: new Date(year, item.month).toLocaleString(locale, {
                month: 'short',
              }),
              amount: item.amount,
            }))}
            className="w-full"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickFormatter={(value) => value.slice(0, 3)}
              fontSize={12}
            />
            <YAxis
              tickFormatter={(value) => `${formatCurrency(value)}`}
              fontSize={12}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="amount"
              fill="var(--color-amount)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer> */
