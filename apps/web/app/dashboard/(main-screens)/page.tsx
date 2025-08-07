'use client';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

import { useIsMobile } from '@/hooks/use-mobile';
import { useSession } from '@/app/_components/session-provider';
import { useAnalytics } from '@/app/dashboard/_hooks/use-analytics';
import { useAppContext } from '@/app/dashboard/_context/app-context';

import { Text } from '@/components/ui/text';
import { CategoryBreakdown } from '../_components/category-breakdown';
import { RecentTransactions } from '../_components/recent-transactions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HighestExpenseCategory } from '../_components/highest-expense-category';
import { MonthSelector } from '../_components/month-selector';
import { DailyCashFlow } from '../_components/daily-cash-flow';
import { BudgetProgress } from '../_components/budget-progress';
import { BudgetPerCategory } from '../_components/budget-per-category';
import { OnboardingExperience } from '../_components/onboarding-experience';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/mobile-tabs';
import { cn } from '@/lib/utils';
import { MobileMonthSelector } from '../_components/mobile-month-selector';
import { MobileDailyCashFlow } from '../_components/mobile-daily-cash-flow';
import { MobileCategoryBreakdown } from '../_components/mobile-category-breakdown';
import { MobileRecentTransactions } from '../_components/mobile-recent-transactions';
import { parseAsBoolean, parseAsIsoDateTime, useQueryState } from 'nuqs';
import { TransactionModal } from '@/app/dashboard/_components/mobile-recent-transactions/transactions-modal';
import DayjsSingleton from '@/lib/helpers/Dayjs';
import { TagsBreakdown } from '@/app/dashboard/_components/tags-breakdown';
import { CashFlowSummary } from '@/app/dashboard/_components/cash-flow-summary';

export default function HomePage() {
  const { session, signOut, isLoading: isSessionLoading } = useSession();
  const { currency, year, month, setMonth } = useAppContext();
  const isMobile = useIsMobile();
  const dayjs = DayjsSingleton.getInstance(
    session?.user.favorite_locale || 'en-US'
  );

  const [selectedTab, setSelectedTab] = useQueryState<'expense' | 'income'>(
    'tab',
    {
      defaultValue: 'expense',
      parse: (value) => {
        if (value === 'expense' || value === 'income') {
          return value as 'expense' | 'income';
        } else {
          return 'expense';
        }
      },
    }
  );

  const [openTransactionsModal, setOpenTransactionsModal] = useQueryState(
    'openTransactionsModal',
    parseAsBoolean.withDefault(false)
  );
  const [selectedCategory, setSelectedCategory] = useQueryState('category', {
    defaultValue: 'all',
  });
  const [selectedTag, setSelectedTag] = useQueryState('tag', {
    defaultValue: 'all',
  });
  const [dateFrom, setDateFrom] = useQueryState(
    'from',
    parseAsIsoDateTime.withDefault(
      dayjs().year(year).month(month).day(1).startOf('month').toDate()
    )
  );
  const [dateTo, setDateTo] = useQueryState(
    'to',
    parseAsIsoDateTime.withDefault(
      dayjs().year(year).month(month).day(1).endOf('month').toDate()
    )
  );

  const { data, isLoading, error } = useAnalytics({
    year,
    currency,
    month,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(session?.user.favorite_locale || 'en-US', {
      style: 'currency',
      currency: data?.currency ?? 'PEN',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const categoryWithHighestExpense = data?.monthData.expensesByCategory?.reduce(
    (acc, curr) => (acc.amount > curr.amount ? acc : curr),
    { category: '', amount: 0 }
  );

  const FormattedMainTotal = ({ className }: { className: string }) => {
    const total =
      (data?.monthData.income.amount ?? 0) -
      (data?.monthData.expense.amount ?? 0);
    const parts = new Intl.NumberFormat(
      session?.user.favorite_locale || 'en-US',
      {
        style: 'currency',
        currency: data?.currency ?? 'PEN',
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

  useEffect(() => {
    if (error?.message === 'TokenExpiredError') {
      toast.error('Su sesión ha expirado');
      signOut();
    }
  }, [error]);

  if (isSessionLoading) {
    return <div>Loading...</div>;
  }

  if (session?.user?.expenses_count === 0) {
    return <OnboardingExperience />;
  }

  return (
    <>
      {isMobile ? (
        <>
          <div className="flex flex-col items-center p-4 mb-6">
            <p className="text-muted-foreground mb-1">total</p>
            <FormattedMainTotal className="mb-4" />

            <Tabs
              value={selectedTab}
              onValueChange={(value) =>
                setSelectedTab(value as 'expense' | 'income')
              }
              className="mb-3"
            >
              <TabsList>
                <TabsTrigger
                  value="expense"
                  className="data-[state=active]:bg-yc-600"
                >
                  - {formatCurrency(data?.monthData.expense.amount ?? 0)}
                </TabsTrigger>
                <TabsTrigger
                  value="income"
                  className="data-[state=active]:bg-lemon-950"
                >
                  + {formatCurrency(data?.monthData.income.amount ?? 0)}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <MobileMonthSelector
              locale={session?.user.favorite_locale || 'en-US'}
              selectedTab={selectedTab}
            />
          </div>

          {/* Cash Flow Summary */}
          {data && (
            <div className="px-4 mb-6">
              <CashFlowSummary
                netAmount={
                  (data.monthData.income.amount ?? 0) -
                  (data.monthData.expense.amount ?? 0)
                }
                income={data.monthData.income.amount ?? 0}
                spend={data.monthData.expense.amount ?? 0}
                previousPeriodAmount={355.34} // You can replace this with actual previous period data
                previousPeriodLabel="in Jul 1 - Jul 6, 2025"
                currency={data.currency}
                locale={session?.user.favorite_locale || 'en-US'}
              />
            </div>
          )}

          <>
            {isLoading ? (
              <Text className="p-4">Loading...</Text>
            ) : error ? (
              <Text className="p-4">Error: {error.message}</Text>
            ) : data ? (
              <>
                <MobileDailyCashFlow
                  data={
                    selectedTab === 'expense'
                      ? data.monthData.dailyCashFlow.map((item) => ({
                          day: item.day,
                          amount: item.expenses,
                          type: 'expense',
                        }))
                      : data.monthData.dailyCashFlow.map((item) => ({
                          day: item.day,
                          amount: item.income,
                          type: 'income',
                        }))
                  }
                  locale={session?.user.favorite_locale || 'en-US'}
                  selectedTab={selectedTab}
                  onSelectedDate={(date) => {
                    // date is like 2025-04-08T05:00:00.000Z
                    const dateStart = dayjs(date).startOf('day').toDate();
                    const dateEnd = dayjs(date).endOf('day').toDate();
                    setDateFrom(dateStart);
                    setDateTo(dateEnd);
                    setOpenTransactionsModal(true);
                  }}
                />

                <div className="h-20"></div>

                <MobileCategoryBreakdown
                  data={
                    selectedTab === 'expense'
                      ? data.monthData.expensesByCategory
                      : data.monthData.incomeByCategory
                  }
                  selectedTab={selectedTab}
                  onSelectCategory={(id) => {
                    setSelectedCategory(id);
                    setOpenTransactionsModal(true);
                  }}
                />

                {selectedTab === 'expense' ? (
                  <>
                    <div className="h-20"></div>

                    <TagsBreakdown
                      data={data.monthData.expenses}
                      selectedTab={selectedTab}
                      onSelectTag={(id) => {
                        setSelectedTag(id);
                        setOpenTransactionsModal(true);
                      }}
                    />
                  </>
                ) : null}

                <div className="h-20"></div>

                {data.monthData.currentMonthBudget.budgeted &&
                  data.monthData.currentMonthBudget.used && (
                    <>
                      <BudgetProgress
                        budgetTotal={data.monthData.currentMonthBudget.budgeted}
                        budgetUsed={data.monthData.currentMonthBudget.used}
                        currency={data.currency}
                        locale={session?.user.favorite_locale || 'en-US'}
                        className="px-4 mb-4"
                      />

                      <BudgetPerCategory
                        data={data.monthData.expensesByCategory.map(
                          (expenseByCategory) => {
                            const image_url =
                              session?.user.expense_categories.find(
                                (category) =>
                                  category.value === expenseByCategory.id
                              )?.image_url;

                            return {
                              ...expenseByCategory,
                              image_url: image_url ?? null,
                            };
                          }
                        )}
                        onSelectCategory={(id) => {
                          setSelectedCategory(id);
                          setOpenTransactionsModal(true);
                        }}
                        currency={data.currency}
                        locale={session?.user.favorite_locale || 'en-US'}
                        className="px-4"
                      />
                      <div className="h-20"></div>
                    </>
                  )}

                <div className="flex flex-col gap-4 px-4">
                  <MobileRecentTransactions
                    locale={session?.user.favorite_locale || 'en-US'}
                    recentTransactions={data.monthData.lastTransactions}
                  />
                  <TransactionModal
                    locale={session?.user.favorite_locale || 'en-US'}
                    openTransactionsModal={openTransactionsModal}
                    setOpenTransactionsModal={setOpenTransactionsModal}
                    selectedTabDefault={selectedTab}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    setDateFrom={setDateFrom}
                    setDateTo={setDateTo}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedTag={selectedTag}
                    setSelectedTag={setSelectedTag}
                  />
                </div>

                {/*                 <Card>
                  <CardHeader>
                    <CardTitle>Transacciones Recientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RecentTransactions
                      data={data.monthData.lastTransactions}
                      currency={data.currency}
                      locale={session?.user.favorite_locale || 'en-US'}
                    />
                  </CardContent>
                </Card>

                <CategoryBreakdown
                  data={data.monthData.expensesByCategory}
                  currency={data.currency}
                  locale={session?.user.favorite_locale || 'en-US'}
                  year={year}
                /> */}
              </>
            ) : null}
          </>

          <div className="h-20"></div>
        </>
      ) : (
        <>
          {isLoading ? (
            <Text className="p-4">Loading...</Text>
          ) : error ? (
            <Text className="p-4">Error: {error.message}</Text>
          ) : data ? (
            <>
              <div className="flex items-center border-b px-10 py-4 justify-between gap-4 mb-10">
                <p className="text-xl font-semibold">Dashboard</p>
                <MobileMonthSelector
                  locale={session?.user.favorite_locale || 'en-US'}
                  selectedTab={selectedTab}
                  className="h-[50px] px-6 text-base rounded-full"
                />
              </div>

              {/* Cash Flow Summary */}
              <div className="mb-9">
                <CashFlowSummary
                  netAmount={
                    (data.monthData.income.amount ?? 0) -
                    (data.monthData.expense.amount ?? 0)
                  }
                  income={data.monthData.income.amount ?? 0}
                  spend={data.monthData.expense.amount ?? 0}
                  previousPeriodAmount={355.34} // You can replace this with actual previous period data
                  previousPeriodLabel="in Jul 1 - Jul 6, 2025"
                  currency={data.currency}
                  locale={session?.user.favorite_locale || 'en-US'}
                />
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold">
                  {selectedTab === 'expense' ? 'gastos' : 'ingresos'} por día
                </h3>
                <div className="bg-zinc-900 rounded-lg p-4">
                  <MobileDailyCashFlow
                    data={
                      selectedTab === 'expense'
                        ? data.monthData.dailyCashFlow.map((item) => ({
                            day: item.day,
                            amount: item.expenses,
                            type: 'expense',
                          }))
                        : data.monthData.dailyCashFlow.map((item) => ({
                            day: item.day,
                            amount: item.income,
                            type: 'income',
                          }))
                    }
                    locale={session?.user.favorite_locale || 'en-US'}
                    selectedTab={selectedTab}
                    onSelectedDate={(date) => {
                      // date is like 2025-04-08T05:00:00.000Z
                      const dateStart = dayjs(date).startOf('day').toDate();
                      const dateEnd = dayjs(date).endOf('day').toDate();
                      setDateFrom(dateStart);
                      setDateTo(dateEnd);
                      setOpenTransactionsModal(true);
                    }}
                    className="px-0"
                  />
                </div>
              </div>

              <div className="h-16"></div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold">
                  {selectedTab === 'expense' ? 'gastos' : 'ingresos'} por
                  categoría
                </h3>
                <div className="bg-zinc-900 rounded-lg p-4">
                  <MobileCategoryBreakdown
                    data={
                      selectedTab === 'expense'
                        ? data.monthData.expensesByCategory
                        : data.monthData.incomeByCategory
                    }
                    selectedTab={selectedTab}
                    onSelectCategory={(id) => {
                      setSelectedCategory(id);
                      setOpenTransactionsModal(true);
                    }}
                  />
                </div>
              </div>

              {selectedTab === 'expense' ? (
                <>
                  <div className="h-16"></div>

                  <div className="space-y-6">
                    <div className="text-xl font-semibold">tags</div>
                    <div className="bg-zinc-900 rounded-lg p-4">
                      <TagsBreakdown
                        data={data.monthData.expenses}
                        selectedTab={selectedTab}
                        onSelectTag={(id) => {
                          setSelectedTag(id);
                          setOpenTransactionsModal(true);
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : null}

              {data.monthData.currentMonthBudget.budgeted &&
                data.monthData.currentMonthBudget.used && (
                  <>
                    <div className="h-16"></div>

                    <BudgetProgress
                      budgetTotal={data.monthData.currentMonthBudget.budgeted}
                      budgetUsed={data.monthData.currentMonthBudget.used}
                      currency={data.currency}
                      locale={session?.user.favorite_locale || 'en-US'}
                    />

                    <BudgetPerCategory
                      data={data.monthData.expensesByCategory.map(
                        (expenseByCategory) => {
                          const image_url =
                            session?.user.expense_categories.find(
                              (category) =>
                                category.value === expenseByCategory.id
                            )?.image_url;

                          return {
                            ...expenseByCategory,
                            image_url: image_url ?? null,
                          };
                        }
                      )}
                      onSelectCategory={(id) => {
                        setSelectedCategory(id);
                        setOpenTransactionsModal(true);
                      }}
                      currency={data.currency}
                      locale={session?.user.favorite_locale || 'en-US'}
                    />
                  </>
                )}

              <div className="h-16"></div>

              <div className="flex flex-col gap-4">
                <MobileRecentTransactions
                  locale={session?.user.favorite_locale || 'en-US'}
                  recentTransactions={data.monthData.lastTransactions}
                />
                <TransactionModal
                  locale={session?.user.favorite_locale || 'en-US'}
                  openTransactionsModal={openTransactionsModal}
                  setOpenTransactionsModal={setOpenTransactionsModal}
                  selectedTabDefault={selectedTab}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  setDateFrom={setDateFrom}
                  setDateTo={setDateTo}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedTag={selectedTag}
                  setSelectedTag={setSelectedTag}
                />
              </div>

              {/*  <IncomeBreakdown
              data={data.incomeByCategory}
              currency={data.currency}
              locale={session?.user.favorite_locale || 'en-US'}
            /> */}
            </>
          ) : null}
        </>
      )}
    </>
  );
}
