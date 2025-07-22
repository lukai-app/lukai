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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { formatBigNumber } from '@/lib/helpers/currency';
import { MobileCategorySelector } from '@/app/dashboard/_components/mobile-recent-transactions/mobile-category-selector';

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

export const MobileCategoryBudgetAnalysis: React.FC<
  CategoryBudgetAnalysisProps
> = (props) => {
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
    <div className="px-4">
      <div className="flex gap-4 flex-row items-center justify-between">
        <p className="text-muted-foreground mb-1 text-sm">
          gasto por categoría
        </p>
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
      <div className="grid gap-4 md:grid-cols-2 my-4">
        <div className="space-y-2">
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

      <ScrollArea className="w-full">
        <ChartContainer
          config={{
            amount: {
              label: 'gasto',
              color: 'hsl(var(--chart-1))',
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
            <ChartTooltip content={<ChartTooltipContent />} />
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
  );
};
