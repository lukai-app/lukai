'use client';

import { Text } from '@/components/ui/text';
import { MobileOverview } from './_components/overview-mobile';
import { CashFlow } from './_components/cash-flow';
import { CategoryBudgetAnalysis } from './_components/category-budget-analysis';
import { useAnalytics } from '@/app/dashboard/_hooks/use-analytics';
import { useAppContext } from '@/app/dashboard/_context/app-context';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/mobile-tabs';
import { useSession } from '@/app/_components/session-provider';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileCashFlow } from './_components/mobile-cash-flow';
import { MobileCategoryBudgetAnalysis } from './_components/mobile-category-budget-analysis';

export default function Report() {
  const { currency, year, month } = useAppContext();
  const { session } = useSession();
  const isMobile = useIsMobile();

  const [selectedTab, setSelectedTab] = useState<
    'expense' | 'income' | undefined
  >(undefined);

  const {
    data: response,
    isLoading,
    error,
  } = useAnalytics({
    year,
    currency,
    month,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(session?.user.favorite_locale || 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const FormattedMainTotal = ({ className }: { className: string }) => {
    const total = response?.yearData.annualSummary.reduce(
      (acc, curr) => acc + (curr.income ?? 0) - (curr.expense ?? 0),
      0
    );
    const parts = new Intl.NumberFormat(
      session?.user.favorite_locale || 'en-US',
      {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        notation: 'compact',
      }
    ).formatToParts(total);

    return (
      <div className={cn('text-4xl font-bold', className)}>
        {parts.map((part, index) => {
          if (part.type === 'currency') {
            return (
              <span key={index} className="ml-1">
                {part.value}
              </span>
            );
          }
          if (part.type === 'integer') {
            return <span key={index}>{part.value}</span>;
          }
          if (part.type === 'decimal') {
            return (
              <span key={index} className="text-muted-foreground text-2xl">
                {part.value}
              </span>
            );
          }
          if (part.type === 'fraction') {
            return (
              <span key={index} className="text-muted-foreground text-2xl">
                {part.value}
              </span>
            );
          }
          return <span key={index}>{part.value}</span>;
        })}
      </div>
    );
  };

  return (
    <>
      {isMobile ? (
        <>
          <div className="flex flex-col items-center p-4 mb-6">
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground mb-1 text-sm">
                así va tu año 2025
              </p>
            </div>
            <FormattedMainTotal className="mb-4" />

            <Tabs>
              <TabsList>
                <TabsTrigger
                  value="expense"
                  className={cn(
                    selectedTab === 'expense'
                      ? 'data-[state=active]:bg-yc-600'
                      : 'data-[state=active]:bg-transparent text-white'
                  )}
                  onClick={() => {
                    if (selectedTab === 'expense') {
                      setSelectedTab(undefined);
                    } else {
                      setSelectedTab('expense');
                    }
                  }}
                >
                  -{' '}
                  {formatCurrency(
                    response?.yearData.annualSummary.reduce(
                      (acc, curr) => acc + (curr.expense ?? 0),
                      0
                    ) ?? 0
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="income"
                  className={cn(
                    selectedTab === 'income'
                      ? 'data-[state=active]:bg-lemon-950'
                      : 'data-[state=active]:bg-transparent text-white'
                  )}
                  onClick={() => {
                    if (selectedTab === 'income') {
                      setSelectedTab(undefined);
                    } else {
                      setSelectedTab('income');
                    }
                  }}
                >
                  +{' '}
                  {formatCurrency(
                    response?.yearData.annualSummary.reduce(
                      (acc, curr) => acc + (curr.income ?? 0),
                      0
                    ) ?? 0
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {isLoading ? (
            <Text className="p-4">Loading...</Text>
          ) : error ? (
            <Text className="p-4">Error: {error.message}</Text>
          ) : response ? (
            <>
              <MobileOverview
                data={response.yearData.annualSummary}
                locale={response.locale}
                currency={response.currency}
                year={year}
                selectedTab={selectedTab}
              />

              <div className="h-20"></div>

              <MobileCashFlow
                data={response.yearData.cashFlow}
                currency={response.currency}
                locale={response.locale}
                year={year}
              />

              {/*  <IncomeBreakdown
              data={data.incomeByCategory}
              currency={data.currency}
              locale={session?.user.favorite_locale || 'en-US'}
            /> */}

              {/* <BudgetProgress
              budgetTotal={data.budget.budgeted}
              budgetUsed={data.budget.used}
              currency={data.currency}
              locale={session?.user.favorite_locale || 'en-US'}
            /> */}

              <div className="h-20"></div>

              <MobileCategoryBudgetAnalysis
                categories={response.expenseCategories}
                defaultData={response.yearData.categoryBudgetAnalysis}
                currency={response.currency}
                year={year}
                locale={response.locale}
              />
            </>
          ) : (
            <Text className="p-4">No data</Text>
          )}
        </>
      ) : (
        <>
          <div className="flex flex-col mb-9">
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground mb-1 text-sm">
                así va tu año 2025
              </p>
            </div>
            <FormattedMainTotal className="mb-4" />

            <Tabs>
              <TabsList>
                <TabsTrigger
                  value="expense"
                  className={cn(
                    selectedTab === 'expense'
                      ? 'data-[state=active]:bg-yc-600'
                      : 'data-[state=active]:bg-transparent text-white'
                  )}
                  onClick={() => {
                    if (selectedTab === 'expense') {
                      setSelectedTab(undefined);
                    } else {
                      setSelectedTab('expense');
                    }
                  }}
                >
                  -{' '}
                  {formatCurrency(
                    response?.yearData.annualSummary.reduce(
                      (acc, curr) => acc + (curr.expense ?? 0),
                      0
                    ) ?? 0
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="income"
                  className={cn(
                    selectedTab === 'income'
                      ? 'data-[state=active]:bg-lemon-950'
                      : 'data-[state=active]:bg-transparent text-white'
                  )}
                  onClick={() => {
                    if (selectedTab === 'income') {
                      setSelectedTab(undefined);
                    } else {
                      setSelectedTab('income');
                    }
                  }}
                >
                  +{' '}
                  {formatCurrency(
                    response?.yearData.annualSummary.reduce(
                      (acc, curr) => acc + (curr.income ?? 0),
                      0
                    ) ?? 0
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {isLoading ? (
            <Text className="p-4">Loading...</Text>
          ) : error ? (
            <Text className="p-4">Error: {error.message}</Text>
          ) : response ? (
            <>
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">resumen anual</h3>
                <div className="bg-zinc-900 rounded-lg p-4">
                  <MobileOverview
                    data={response.yearData.annualSummary}
                    locale={response.locale}
                    currency={response.currency}
                    year={year}
                    selectedTab={selectedTab}
                  />
                </div>
              </div>

              <div className="h-16"></div>

              <CashFlow
                data={response.yearData.cashFlow}
                currency={response.currency}
                locale={response.locale}
                year={year}
              />

              <div className="h-16"></div>

              {/*  <IncomeBreakdown
              data={data.incomeByCategory}
              currency={data.currency}
              locale={session?.user.favorite_locale || 'en-US'}
            /> */}

              {/* <BudgetProgress
              budgetTotal={data.budget.budgeted}
              budgetUsed={data.budget.used}
              currency={data.currency}
              locale={session?.user.favorite_locale || 'en-US'}
            /> */}
              <CategoryBudgetAnalysis
                categories={response.expenseCategories}
                defaultData={response.yearData.categoryBudgetAnalysis}
                currency={response.currency}
                year={year}
                locale={response.locale}
              />
            </>
          ) : (
            <Text className="p-4">No data</Text>
          )}
        </>
      )}
    </>
  );
}
