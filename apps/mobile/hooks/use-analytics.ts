'use client';

import { env } from '@/env';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { importKey, decryptNumber, decrypt } from '@/lib/encryption';
import { differenceInMonths, startOfYear } from 'date-fns';

import { useSession } from '@/components/auth/ctx';
import { IHomeGetResponse } from '@/types/analytics';

interface HomeResponse {
  data: IHomeGetResponse;
  success: boolean;
  message: string;
}

interface RawHomeResponse {
  data: {
    currency: string;
    locale: string;
    language: string;
    expenseCategories: Array<{
      value: string;
      label: string;
    }>;
    incomeCategories: Array<{
      value: string;
      label: string;
    }>;
    monthData: {
      month: number;
      income: {
        amount: string; // Encrypted
        variation: number;
      };
      expense: {
        amount: string; // Encrypted
        variation: number;
      };
      currentMonthBudget: {
        used: string; // Encrypted
        budgeted: string | null; // Encrypted
      };
      savings: {
        amount: string; // Encrypted
        variation: number;
      };
      lastTransactions: Array<{
        id: string;
        date: string;
        description: string; // Encrypted
        category: string;
        amount: string; // Encrypted
      }>;
      expensesByCategory: Array<{
        category: string;
        amount: string; // Encrypted
        color: string;
      }>;
      incomeByCategory: Array<{
        category: string;
        amount: string; // Encrypted
        percentage: number;
        color: string;
      }>;
      budget: {
        used: string; // Encrypted
        budgeted: string; // Encrypted
      };
      dailyCashFlow: Array<{
        day: string;
        expenses: string; // Encrypted
        income: string; // Encrypted
      }>;
    };
    yearData: {
      year: number;
      annualSummary: Array<{
        month: number;
        income: string; // Encrypted
        expense: string; // Encrypted
        savings: string; // Encrypted
      }>;
      currentMonthData: {
        month: number;
        income: string | null; // Encrypted
        expense: string | null; // Encrypted
        savings: string | null; // Encrypted
      } | null;
      cashFlow: Array<{
        month: string;
        income: string; // Encrypted
        expenses: string; // Encrypted
        fixed: string; // Encrypted
        flow: string; // Encrypted
        accumulated: string; // Encrypted
      }>;
      categoryBudgetAnalysis: {
        expenseCategoryId: string;
        totalSpent: string; // Encrypted
        monthlyAverage: number;
        monthlyData: Array<{
          month: number;
          amount: string; // Encrypted
          budgetTotal: string; // Encrypted
        }>;
        currentMonthDataForCategory: {
          month: number;
          expenses: string | null;
        } | null;
      };
    };
    encryptionKey: string;
  };
  success: boolean;
  message: string;
}

const getHome = async (params: {
  year: number;
  month: number;
  currency: string | null;
  token: string;
}) => {
  const { year, currency } = params;

  const response = (await fetch(
    `${env.EXPO_PUBLIC_API_URL}/v1/home?year=${year}${
      currency ? `&currency=${currency}` : ''
    }${params.month ? `&month=${params.month}` : ''}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.EXPO_PUBLIC_API_KEY,
        Authorization: `Bearer ${params.token}`,
      },
    }
  ).then((res) => res.json())) as RawHomeResponse;

  if (!response.success) {
    throw new Error(response.message || 'Failed to fetch home data');
  }

  return response;
};

export function useAnalytics(params: {
  year: number;
  currency: string;
  month: number;
}) {
  const { year, currency, month } = params;
  const { session } = useSession();
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [transformedData, setTransformedData] =
    useState<IHomeGetResponse | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);

  // Fetch raw data
  const {
    data: rawData,
    isLoading: isRawLoading,
    error,
  } = useQuery<RawHomeResponse>({
    queryKey: ['home', { year, currency, month }],
    queryFn: () =>
      getHome({
        year,
        month,
        currency,
        token: session?.token ?? '',
      }),
    enabled: !!session?.token,
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnMount: false, // Don't refetch when mounting new components
  });

  // Import encryption key
  useEffect(() => {
    if (session?.encryptionKey) {
      importKey(session.encryptionKey).then(setCryptoKey);
    }
  }, [session?.encryptionKey]);

  // Transform data when raw data or crypto key changes
  useEffect(() => {
    const transformData = async () => {
      if (!rawData || !cryptoKey) {
        setTransformedData(null);
        return;
      }

      setIsTransforming(true);
      try {
        // Helper function to decrypt and sum comma-separated encrypted amounts
        const decryptAndSumAmounts = async (
          encryptedAmounts: string
        ): Promise<number> => {
          if (!encryptedAmounts) return 0;
          const amounts = encryptedAmounts.split(',').filter(Boolean);
          const decryptedAmounts = await Promise.all(
            amounts.map((amount) => decryptNumber(amount, cryptoKey))
          );
          return decryptedAmounts.reduce<number>(
            (sum: number, amount: number | null) => sum + (amount ?? 0),
            0
          );
        };

        // Decrypt month data
        const decryptedMonthData = {
          ...rawData.data.monthData,
          income: {
            ...rawData.data.monthData.income,
            amount:
              (await decryptAndSumAmounts(
                rawData.data.monthData.income.amount
              )) || 0,
          },
          expense: {
            ...rawData.data.monthData.expense,
            amount:
              (await decryptAndSumAmounts(
                rawData.data.monthData.expense.amount
              )) || 0,
          },
          currentMonthBudget: {
            ...rawData.data.monthData.currentMonthBudget,
            used:
              (await decryptAndSumAmounts(
                rawData.data.monthData.currentMonthBudget.used
              )) || 0,
            budgeted: rawData.data.monthData.currentMonthBudget.budgeted
              ? (await decryptNumber(
                  rawData.data.monthData.currentMonthBudget.budgeted,
                  cryptoKey
                )) || 0
              : null,
          },
          savings: {
            ...rawData.data.monthData.savings,
            amount: 0, // Will be calculated below
          },
          lastTransactions: await Promise.all(
            rawData.data.monthData.lastTransactions.map(
              async (transaction) => ({
                ...transaction,
                description: transaction.description
                  ? (await decrypt(transaction.description, cryptoKey)) || ''
                  : '',
                amount:
                  (await decryptNumber(transaction.amount, cryptoKey)) || 0,
              })
            )
          ),
          expensesByCategory: await Promise.all(
            rawData.data.monthData.expensesByCategory.map(async (category) => ({
              ...category,
              amount: (await decryptAndSumAmounts(category.amount)) || 0,
            }))
          ),
          incomeByCategory: await Promise.all(
            rawData.data.monthData.incomeByCategory.map(async (category) => ({
              ...category,
              amount: (await decryptAndSumAmounts(category.amount)) || 0,
              percentage: 0, // Will be calculated below
            }))
          ),
          budget: {
            ...rawData.data.monthData.budget,
            used:
              (await decryptAndSumAmounts(
                rawData.data.monthData.budget.used
              )) || 0,
            budgeted: rawData.data.monthData.budget.budgeted
              ? (await decryptNumber(
                  rawData.data.monthData.budget.budgeted,
                  cryptoKey
                )) || 0
              : null,
          },
          dailyCashFlow: await Promise.all(
            rawData.data.monthData.dailyCashFlow.map(async (day) => ({
              ...day,
              expenses: (await decryptAndSumAmounts(day.expenses)) || 0,
              income: (await decryptAndSumAmounts(day.income)) || 0,
            }))
          ),
        };

        // Calculate savings
        decryptedMonthData.savings.amount =
          (decryptedMonthData.income.amount || 0) -
          (decryptedMonthData.expense.amount || 0);

        // Get last month's data for variations
        const lastMonthSnapshot = rawData.data.yearData.annualSummary.find(
          (summary) => summary.month === month - 1
        );

        if (lastMonthSnapshot) {
          const lastMonthIncome =
            (await decryptNumber(lastMonthSnapshot.income, cryptoKey)) || 0;
          const lastMonthExpense =
            (await decryptNumber(lastMonthSnapshot.expense, cryptoKey)) || 0;
          const lastMonthSavings =
            (await decryptNumber(lastMonthSnapshot.savings, cryptoKey)) || 0;

          // Calculate income variation
          const incomeVariation =
            lastMonthIncome === 0
              ? 0
              : (((decryptedMonthData.income.amount || 0) - lastMonthIncome) /
                  lastMonthIncome) *
                100;
          decryptedMonthData.income.variation = parseFloat(
            incomeVariation.toFixed(2)
          );

          // Calculate expense variation
          const expenseVariation =
            lastMonthExpense === 0
              ? 0
              : (((decryptedMonthData.expense.amount || 0) - lastMonthExpense) /
                  lastMonthExpense) *
                100;
          decryptedMonthData.expense.variation = parseFloat(
            expenseVariation.toFixed(2)
          );

          // Calculate savings variation
          const savingsVariation =
            lastMonthSavings === 0
              ? 0
              : (((decryptedMonthData.savings.amount || 0) - lastMonthSavings) /
                  lastMonthSavings) *
                100;
          decryptedMonthData.savings.variation = parseFloat(
            savingsVariation.toFixed(2)
          );
        }

        // Calculate income percentages
        const totalIncome = decryptedMonthData.income.amount || 0;
        if (totalIncome > 0) {
          decryptedMonthData.incomeByCategory =
            decryptedMonthData.incomeByCategory.map((category) => ({
              ...category,
              percentage: parseFloat(
                (((category.amount || 0) / totalIncome) * 100).toFixed(2)
              ),
            }));
        }

        const annualSummary = await Promise.all(
          rawData.data.yearData.annualSummary.map(async (summary) => ({
            ...summary,
            income: (await decryptNumber(summary.income, cryptoKey)) || 0,
            expense: (await decryptNumber(summary.expense, cryptoKey)) || 0,
            savings: (await decryptNumber(summary.savings, cryptoKey)) || 0,
          }))
        );

        const cashFlow = await Promise.all(
          rawData.data.yearData.cashFlow.map(async (flow) => ({
            ...flow,
            income: flow.income
              ? (await decryptNumber(flow.income, cryptoKey)) || 0
              : 0,
            expenses: flow.expenses
              ? (await decryptNumber(flow.expenses, cryptoKey)) || 0
              : 0,
            fixed: flow.fixed
              ? (await decryptNumber(flow.fixed, cryptoKey)) || 0
              : 0,
            flow: flow.flow
              ? (await decryptNumber(flow.flow, cryptoKey)) || 0
              : 0,
            accumulated: flow.accumulated
              ? (await decryptNumber(flow.accumulated, cryptoKey)) || 0
              : 0,
          }))
        );

        if (rawData.data.yearData.currentMonthData !== null) {
          const currentMonthIndex =
            rawData.data.yearData.currentMonthData.month;

          const currentMonthData = {
            ...rawData.data.yearData.currentMonthData,
            income: rawData.data.yearData.currentMonthData.income
              ? (await decryptAndSumAmounts(
                  rawData.data.yearData.currentMonthData.income
                )) || 0
              : 0,
            expense: rawData.data.yearData.currentMonthData.expense
              ? (await decryptAndSumAmounts(
                  rawData.data.yearData.currentMonthData.expense
                )) || 0
              : 0,
            savings: rawData.data.yearData.currentMonthData.savings
              ? (await decryptAndSumAmounts(
                  rawData.data.yearData.currentMonthData.savings
                )) || 0
              : 0,
          };

          const pastMonthsData = cashFlow.find(
            (flow) => flow.month === `${currentMonthIndex - 1}`
          );

          const currentMonthCashFlow = {
            ...cashFlow[currentMonthIndex],
            income: currentMonthData.income,
            expenses: currentMonthData.expense,
            fixed: 0,
            flow: currentMonthData.income - currentMonthData.expense,
            accumulated: pastMonthsData
              ? pastMonthsData.accumulated +
                currentMonthData.income -
                currentMonthData.expense
              : currentMonthData.income - currentMonthData.expense,
          };

          if (currentMonthIndex !== -1) {
            annualSummary[currentMonthIndex] = currentMonthData;

            cashFlow[currentMonthIndex] = currentMonthCashFlow;
          } else {
            annualSummary.push(currentMonthData);
            cashFlow.push(currentMonthCashFlow);
          }
        }

        const currentMonthDataForCategory =
          rawData.data.yearData.categoryBudgetAnalysis
            .currentMonthDataForCategory;

        const categoryMonthlyData = await Promise.all(
          rawData.data.yearData.categoryBudgetAnalysis.monthlyData.map(
            async (data) => ({
              ...data,
              amount: (await decryptNumber(data.amount, cryptoKey)) || 0,
              budgetTotal:
                (await decryptNumber(data.budgetTotal, cryptoKey)) || 0,
            })
          )
        );

        if (currentMonthDataForCategory) {
          // replace the amount of the current month data for category
          const currentMonthDataForCategoryIndex =
            categoryMonthlyData.findIndex(
              (data) => data.month === currentMonthDataForCategory.month
            );

          categoryMonthlyData[currentMonthDataForCategoryIndex] = {
            ...categoryMonthlyData[currentMonthDataForCategoryIndex],
            amount: currentMonthDataForCategory.expenses
              ? (await decryptAndSumAmounts(
                  currentMonthDataForCategory.expenses
                )) || 0
              : 0,
          };
        }

        const totalMonthsSinceStartOfYear =
          differenceInMonths(new Date(), startOfYear(new Date())) + 1;

        // Decrypt year data
        const decryptedYearData = {
          ...rawData.data.yearData,
          annualSummary: annualSummary,
          cashFlow: cashFlow.map((flow) => ({
            ...flow,
            month: parseInt(flow.month),
          })),
          categoryBudgetAnalysis: {
            ...rawData.data.yearData.categoryBudgetAnalysis,
            totalSpent: categoryMonthlyData.reduce(
              (acc, data) => acc + data.amount,
              0
            ),
            monthlyAverage:
              categoryMonthlyData.reduce((acc, data) => acc + data.amount, 0) /
              totalMonthsSinceStartOfYear,
            monthlyData: categoryMonthlyData,
          },
        };

        // Set the transformed data
        setTransformedData({
          currency: rawData.data.currency,
          locale: session?.user.favorite_locale || 'en-US',
          language: rawData.data.language,
          expenseCategories: rawData.data.expenseCategories,
          incomeCategories: rawData.data.incomeCategories,
          monthData: decryptedMonthData as any, // Type assertion to bypass type checking
          yearData: decryptedYearData,
        });
      } catch (err) {
        console.error('Error transforming data:', err);
        setTransformedData(null);
      } finally {
        setIsTransforming(false);
      }
    };

    transformData();
  }, [rawData, cryptoKey, month]);

  return {
    data: transformedData,
    isLoading: isRawLoading || isTransforming || !cryptoKey,
    error,
  };
}
