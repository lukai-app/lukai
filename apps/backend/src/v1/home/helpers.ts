import { type monthly_snapshot } from '@prisma/client';
import prisma from '../../lib/prisma';
import { decryptModel } from '../../utils/model-encryption';
import { startOfMonth, endOfMonth } from 'date-fns';

export interface MonthData {
  month: number; // 0 to 11
  income: {
    amount: number;
    variation: number;
  };
  expense: {
    amount: number;
    variation: number;
  };
  currentMonthBudget: {
    used: number;
    budgeted: number | null;
  };
  savings: {
    amount: number;
    variation: number;
  };
  lastTransactions: Array<{
    id: string;
    date: string;
    description: string;
    category: string;
    amount: number;
  }>;
  expensesByCategory: Array<{
    id: string;
    category: string;
    amount: number;
    color: string;
  }>;
  incomeByCategory: Array<{
    id: string;
    category: string;
    amount: number;
    percentage: number;
  }>;
  budget: {
    used: number;
    budgeted: number;
  };
  dailyCashFlow: Array<{
    day: string;
    expenses: number;
  }>;
}

export interface YearData {
  year: number;
  annualSummary: Array<{
    month: number; // 1 to 12
    income: number;
    expense: number;
    savings: number;
  }>;
  cashFlow: Array<{
    month: string;
    income: number;
    expenses: number;
    fixed: number;
    flow: number;
    accumulated: number;
  }>;
  categoryBudgetAnalysis: {
    expenseCategoryId: string;
    totalSpent: number;
    monthlyAverage: number;
    monthlyData: Array<{
      month: number;
      amount: number;
      budgetTotal: number;
    }>;
  };
}

export const getMonthData = async (params: {
  year: number;
  month: number;
  currency: string;
  userId: string;
  encryptionKey: Uint8Array;
  dynamicData?: {
    lastMonthSnapshot?: monthly_snapshot;
  };
}): Promise<MonthData> => {
  const { year, month, currency, userId, encryptionKey, dynamicData } = params;

  const monthData = {
    month: month,
    income: { amount: 0, variation: 0 },
    expense: { amount: 0, variation: 0 },
    currentMonthBudget: { used: 0, budgeted: 0 },
    savings: { amount: 0, variation: 0 },
    lastTransactions: [] as MonthData['lastTransactions'],
    expensesByCategory: [] as MonthData['expensesByCategory'],
    incomeByCategory: [] as MonthData['incomeByCategory'],
    budget: { used: 0, budgeted: 0 },
    dailyCashFlow: [] as MonthData['dailyCashFlow']
  };

  let lastMonthSnapshot: monthly_snapshot | null;

  if (dynamicData?.lastMonthSnapshot) {
    lastMonthSnapshot = dynamicData.lastMonthSnapshot;
  } else {
    lastMonthSnapshot = await prisma.monthly_snapshot.findUnique({
      where: {
        contact_id_year_month_currency_code: {
          contact_id: userId,
          month: month - 1,
          year: year,
          currency_code: currency
        }
      }
    });
  }

  // income
  const lastMonthIncomeData = lastMonthSnapshot?.total_income
    ? Number(
        decryptModel(
          { total_income: lastMonthSnapshot.total_income },
          encryptionKey
        ).total_income
      )
    : 0;

  const currentMonthIncomes = await prisma.income.findMany({
    where: {
      contact_id: userId,
      created_at: {
        gte: startOfMonth(new Date(Number(year), month, 1)),
        lt: endOfMonth(new Date(Number(year), month, 1))
      },
      currency_code: currency
    },
    select: {
      amount: true
    }
  });

  // Decrypt and sum amounts
  const currentMonthIncomeData = currentMonthIncomes.reduce((sum, income) => {
    const decryptedAmount = Number(
      decryptModel({ amount: income.amount }, encryptionKey).amount
    );
    return sum + decryptedAmount;
  }, 0);

  const variation = currentMonthIncomeData - lastMonthIncomeData;
  const percentage =
    lastMonthIncomeData === 0
      ? 0
      : parseFloat(((variation / lastMonthIncomeData) * 100).toFixed(2));

  monthData.income.amount = currentMonthIncomeData;
  monthData.income.variation = percentage;

  // expense
  const lastMonthExpenseData = lastMonthSnapshot?.total_expense
    ? Number(
        decryptModel(
          { total_expense: lastMonthSnapshot.total_expense },
          encryptionKey
        ).total_expense
      )
    : 0;

  const currentMonthExpenses = await prisma.expense.findMany({
    where: {
      contact_id: userId,
      created_at: {
        gte: startOfMonth(new Date(Number(year), month, 1)),
        lt: endOfMonth(new Date(Number(year), month, 1))
      },
      currency_code: currency
    },
    select: {
      amount: true,
      created_at: true,
      category: {
        select: {
          name: true,
          color: true
        }
      }
    }
  });

  // Decrypt and sum amounts
  const currentMonthExpenseData = currentMonthExpenses.reduce(
    (sum, expense) => {
      const decryptedAmount = Number(
        decryptModel({ amount: expense.amount }, encryptionKey).amount
      );
      return sum + decryptedAmount;
    },
    0
  );

  const expenseVariation = currentMonthExpenseData - lastMonthExpenseData;
  const expensePercentage =
    lastMonthExpenseData === 0
      ? 0
      : parseFloat(
          ((expenseVariation / lastMonthExpenseData) * 100).toFixed(2)
        );

  monthData.expense.amount = currentMonthExpenseData;
  monthData.expense.variation = expensePercentage;

  // daily cash flow
  const daysInMonth = endOfMonth(new Date(year, month, 1)).getDate();
  const dailyCashFlow = Array.from({ length: daysInMonth }, (_, index) => {
    const day = new Date(year, month, index + 1);
    const dayExpenses = currentMonthExpenses.reduce((acc, expense) => {
      if (expense.created_at.getDate() === day.getDate()) {
        const decryptedAmount = Number(
          decryptModel({ amount: expense.amount }, encryptionKey).amount
        );
        return acc + decryptedAmount;
      }
      return acc;
    }, 0);

    return {
      day: day.toISOString(),
      expenses: dayExpenses
    };
  });

  monthData.dailyCashFlow = dailyCashFlow;

  // current month budget
  const currentMonthBudget = await prisma.budget.findUnique({
    where: {
      contact_id_month_year_currency: {
        contact_id: userId,
        month: month,
        year: year,
        currency: currency
      }
    },
    select: {
      amount: true
    }
  });

  monthData.currentMonthBudget.used = monthData.expense.amount;
  monthData.currentMonthBudget.budgeted = currentMonthBudget
    ? Number(
        decryptModel({ amount: currentMonthBudget.amount }, encryptionKey)
          .amount
      )
    : null;

  // savings
  const lastMonthSavingsData = lastMonthSnapshot?.total_savings
    ? Number(
        decryptModel(
          { total_savings: lastMonthSnapshot.total_savings },
          encryptionKey
        ).total_savings
      )
    : 0;

  const currentMonthSavingsRequest = await prisma.transfer.findMany({
    where: {
      contact_id: userId,
      created_at: {
        gte: startOfMonth(new Date(Number(year), month, 1)),
        lt: endOfMonth(new Date(Number(year), month, 1))
      },
      to: {
        account_type: 'SAVINGS',
        currency_code: currency
      }
    },
    select: {
      id: true,
      amount: true,
      description: true,
      message: true,
      created_at: true
    }
  });

  // Decrypt all savings data
  const decryptedSavings = currentMonthSavingsRequest.map((saving) => {
    const decrypted = decryptModel(
      {
        amount: saving.amount,
        description: saving.description,
        message: saving.message
      },
      encryptionKey
    );

    return {
      ...saving,
      amount: Number(decrypted.amount),
      description: decrypted.description,
      message: decrypted.message
    };
  });

  const currentMonthSavingsData = decryptedSavings.reduce(
    (acc, saving) => acc + saving.amount,
    0
  );

  const savingsVariation = currentMonthSavingsData - lastMonthSavingsData;
  const savingsPercentage =
    lastMonthSavingsData === 0
      ? 0
      : parseFloat(
          ((savingsVariation / lastMonthSavingsData) * 100).toFixed(2)
        );

  monthData.savings.amount = currentMonthSavingsData;
  monthData.savings.variation = savingsPercentage;

  // last transactions
  const lastTransactions = await prisma.expense.findMany({
    where: {
      contact_id: userId,
      created_at: {
        gte: startOfMonth(new Date(Number(year), month, 1)),
        lt: endOfMonth(new Date(Number(year), month, 1))
      },
      currency_code: currency
    },
    select: {
      id: true,
      amount: true,
      description: true,
      created_at: true,
      category: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    },
    take: 5
  });

  const decryptedLastTransactions = lastTransactions.map((transaction) => {
    const decrypted = decryptModel(
      { amount: transaction.amount, description: transaction.description },
      encryptionKey
    );
    return {
      ...transaction,
      amount: Number(decrypted.amount),
      description: decrypted.description
    };
  });

  monthData.lastTransactions = decryptedLastTransactions.map((transaction) => ({
    id: transaction.id,
    date: transaction.created_at.toISOString(),
    description: transaction.description || '',
    category: transaction.category?.name || '',
    amount: transaction.amount
  }));

  // expenses by category
  const expensesByCategory = await prisma.expense.findMany({
    where: {
      contact_id: userId,
      created_at: {
        gte: startOfMonth(new Date(Number(year), month, 1)),
        lt: endOfMonth(new Date(Number(year), month, 1))
      },
      currency_code: currency
    },
    select: {
      amount: true,
      category_id: true,
      category: {
        select: {
          name: true,
          color: true
        }
      }
    }
  });

  // Decrypt and group by category
  const categoryTotals = expensesByCategory.reduce((acc, expense) => {
    const categoryId = expense.category_id;
    const decryptedAmount = Number(
      decryptModel({ amount: expense.amount }, encryptionKey).amount
    );

    if (!acc[categoryId]) {
      acc[categoryId] = {
        categoryId,
        name: expense.category?.name || 'Sin categoría',
        color: expense.category?.color || '#000000',
        total: 0
      };
    }

    acc[categoryId].total += decryptedAmount;
    return acc;
  }, {} as Record<string, { categoryId: string; name: string; color: string; total: number }>);

  monthData.expensesByCategory = Object.values(categoryTotals)
    .sort((a, b) => b.total - a.total)
    .map((category) => ({
      id: category.categoryId,
      category: category.name,
      amount: category.total,
      color: category.color
    }));

  // income by category
  const incomeByCategory = await prisma.income.findMany({
    where: {
      contact_id: userId,
      created_at: {
        gte: startOfMonth(new Date(Number(year), month, 1)),
        lt: endOfMonth(new Date(Number(year), month, 1))
      },
      currency_code: currency
    },
    select: {
      amount: true,
      category_id: true,
      category: {
        select: {
          name: true,
          color: true
        }
      }
    }
  });

  // Decrypt and group by category
  const incomeCategoryTotals = incomeByCategory.reduce((acc, income) => {
    const categoryId = income.category_id;
    const decryptedAmount = Number(
      decryptModel({ amount: income.amount }, encryptionKey).amount
    );

    if (!acc[categoryId]) {
      acc[categoryId] = {
        categoryId,
        name: income.category?.name || 'Sin categoría',
        color: income.category?.color || '#000000',
        total: 0
      };
    }

    acc[categoryId].total += decryptedAmount;
    return acc;
  }, {} as Record<string, { categoryId: string; name: string; color: string; total: number }>);

  monthData.incomeByCategory = Object.values(incomeCategoryTotals)
    .sort((a, b) => b.total - a.total)
    .map((category) => ({
      id: category.categoryId,
      category: category.name,
      amount: category.total,
      percentage: parseFloat(
        ((category.total / monthData.income.amount) * 100).toFixed(2)
      )
    }));

  // budget
  const budget = await prisma.budget.findFirst({
    where: {
      contact_id: userId,
      month: month,
      year: year,
      currency: currency
    },
    select: {
      amount: true
    }
  });

  monthData.budget.used = monthData.expense.amount;
  monthData.budget.budgeted = budget
    ? Number(decryptModel({ amount: budget.amount }, encryptionKey).amount)
    : 0;

  return monthData;
};

export const getYearData = async (params: {
  year: number;
  currency: string;
  userId: string;
  expenseCategoryId?: string;
  encryptionKey: Uint8Array;
  dynamicData?: {
    currentMonthData?: {
      income: { amount: number };
      expense: { amount: number };
      savings: { amount: number };
    };
    yearSnapshot?: Array<monthly_snapshot>;
  };
}): Promise<YearData> => {
  const { year, currency, userId, encryptionKey, dynamicData } = params;

  const yearData: YearData = {
    year: year,
    annualSummary: [],
    cashFlow: [],
    categoryBudgetAnalysis: {
      expenseCategoryId: '',
      totalSpent: 0,
      monthlyAverage: 0,
      monthlyData: []
    }
  };

  let yearSnapshot: Array<monthly_snapshot>;

  if (dynamicData?.yearSnapshot) {
    yearSnapshot = dynamicData.yearSnapshot;
  } else {
    yearSnapshot = await prisma.monthly_snapshot.findMany({
      where: {
        contact_id: userId,
        year: year,
        currency_code: currency
      }
    });
  }

  // Decrypt year snapshot data
  const decryptedSnapshots = yearSnapshot.map((snapshot) => ({
    ...snapshot,
    total_income: Number(
      decryptModel({ total_income: snapshot.total_income }, encryptionKey)
        .total_income
    ),
    total_expense: Number(
      decryptModel({ total_expense: snapshot.total_expense }, encryptionKey)
        .total_expense
    ),
    total_savings: Number(
      decryptModel({ total_savings: snapshot.total_savings }, encryptionKey)
        .total_savings
    ),
    cash_flow: Number(
      decryptModel({ cash_flow: snapshot.cash_flow }, encryptionKey).cash_flow
    ),
    accumulated_cash: Number(
      decryptModel(
        { accumulated_cash: snapshot.accumulated_cash },
        encryptionKey
      ).accumulated_cash
    )
  }));

  // handle current month if it's the current year
  let currentMonthData: {
    month: number;
    income: number;
    expense: number;
    savings: number;
  } | null = null;
  const currentMonthIndex = new Date().getMonth();

  if (Number(year) === new Date().getFullYear()) {
    if (dynamicData?.currentMonthData) {
      currentMonthData = {
        month: currentMonthIndex,
        income: dynamicData.currentMonthData.income.amount,
        expense: dynamicData.currentMonthData.expense.amount,
        savings: dynamicData.currentMonthData.savings.amount
      };
    } else {
      // current month doesn't exist in the snapshot
      const currentMonthIncomeRequest = await prisma.income.findMany({
        where: {
          contact_id: userId,
          created_at: {
            gte: startOfMonth(new Date()),
            lt: endOfMonth(new Date())
          },
          currency_code: currency
        },
        select: {
          amount: true
        }
      });

      const currentMonthExpenseRequest = await prisma.expense.findMany({
        where: {
          contact_id: userId,
          created_at: {
            gte: startOfMonth(new Date()),
            lt: endOfMonth(new Date())
          },
          currency_code: currency
        },
        select: {
          amount: true
        }
      });

      const currentMonthSavingsRequest = await prisma.transfer.findMany({
        where: {
          contact_id: userId,
          created_at: {
            gte: startOfMonth(new Date()),
            lt: endOfMonth(new Date())
          },
          to: {
            account_type: 'SAVINGS',
            currency_code: currency
          }
        },
        select: {
          amount: true,
          created_at: true
        }
      });

      // Decrypt and sum incomes
      const currentMonthIncome = currentMonthIncomeRequest.reduce(
        (sum, income) => {
          const decryptedAmount = Number(
            decryptModel({ amount: income.amount }, encryptionKey).amount
          );
          return sum + decryptedAmount;
        },
        0
      );

      // Decrypt and sum expenses
      const currentMonthExpense = currentMonthExpenseRequest.reduce(
        (sum, expense) => {
          const decryptedAmount = Number(
            decryptModel({ amount: expense.amount }, encryptionKey).amount
          );
          return sum + decryptedAmount;
        },
        0
      );

      // Decrypt and sum savings
      const currentMonthSavings = currentMonthSavingsRequest.reduce(
        (sum, saving) => {
          const decryptedAmount = Number(
            decryptModel({ amount: saving.amount }, encryptionKey).amount
          );
          return sum + decryptedAmount;
        },
        0
      );

      currentMonthData = {
        month: currentMonthIndex,
        income: currentMonthIncome,
        expense: currentMonthExpense,
        savings: currentMonthSavings
      };
    }
  }

  // Annual Summary
  const annualSummary = Array.from({ length: 12 }, (_, index) => {
    const monthSnapshot = decryptedSnapshots.find(
      (snapshot) => snapshot.month === index
    );

    return {
      month: index,
      income: monthSnapshot?.total_income || 0,
      expense: monthSnapshot?.total_expense || 0,
      savings: monthSnapshot?.total_savings || 0
    };
  });

  if (Number(year) === new Date().getFullYear() && currentMonthData) {
    // Replace the current month data if it already exists in the snapshot
    const existingMonthIndex = annualSummary.findIndex(
      (summary) => summary.month === currentMonthIndex
    );

    if (existingMonthIndex !== -1) {
      annualSummary[existingMonthIndex] = currentMonthData;
    } else {
      annualSummary.push(currentMonthData);
    }
  }

  yearData.annualSummary = annualSummary;

  // Cash Flow
  const cashFlow = Array.from({ length: 12 }, (_, index) => {
    const monthSnapshot = decryptedSnapshots.find(
      (snapshot) => snapshot.month === index
    );

    return {
      month: index.toString(),
      income: monthSnapshot?.total_income || 0,
      expenses: monthSnapshot?.total_expense || 0,
      fixed: 0,
      flow: monthSnapshot?.cash_flow || 0,
      accumulated: monthSnapshot?.accumulated_cash || 0
    };
  });

  if (Number(year) === new Date().getFullYear() && currentMonthData) {
    const pastMonthsData = cashFlow.find(
      (flow) => flow.month === `${currentMonthIndex - 1}`
    );

    const currentMonthCashFlow = {
      month: `${currentMonthIndex}`,
      income: currentMonthData.income,
      expenses: currentMonthData.expense,
      fixed: 0,
      flow: currentMonthData.income - currentMonthData.expense,
      accumulated: pastMonthsData
        ? pastMonthsData.accumulated +
          currentMonthData.income -
          currentMonthData.expense
        : currentMonthData.income - currentMonthData.expense
    };

    const existingCashFlowIndex = cashFlow.findIndex(
      (flow) => flow.month === `${currentMonthIndex}`
    );

    if (existingCashFlowIndex !== -1) {
      cashFlow[existingCashFlowIndex] = currentMonthCashFlow;
    } else {
      cashFlow.push(currentMonthCashFlow);
    }
  }

  yearData.cashFlow = cashFlow;

  // category budget analysis
  let expenseCategoryId: string;

  if (params.expenseCategoryId) {
    expenseCategoryId = params.expenseCategoryId;
  } else {
    // Get all categories and their encrypted amounts for the last month
    const categoriesWithExpenses =
      await prisma.expense_snapshot_per_category.findMany({
        where: {
          monthly_snapshot: {
            year: year,
            contact_id: userId,
            currency_code: currency
          }
        },
        select: {
          category_id: true,
          amount: true
        }
      });

    // Decrypt the amounts and find the category with the highest total
    let maxAmount = 0;
    let maxCategoryId: string | null = null;

    for (const item of categoriesWithExpenses) {
      const decryptedAmount = Number(
        decryptModel({ amount: item.amount }, encryptionKey).amount
      );
      if (decryptedAmount > maxAmount) {
        maxAmount = decryptedAmount;
        maxCategoryId = item.category_id;
      }
    }

    if (maxCategoryId) {
      expenseCategoryId = maxCategoryId;
    } else {
      expenseCategoryId = await prisma.expense_category
        .findFirst({
          where: {
            contact_id: userId
          },
          select: {
            id: true
          }
        })
        .then((category) => category?.id || '');
    }
  }

  if (!expenseCategoryId) {
    throw new Error(`Could not find any expense category for user ${userId}`);
  }

  yearData.categoryBudgetAnalysis = await getCategoryBudgetResponse({
    expenseCategoryId,
    year: Number(year),
    currency,
    userId,
    encryptionKey
  });

  return yearData;
};

export async function getCategoryBudgetResponse(params: {
  expenseCategoryId: string;
  year: number;
  currency: string;
  userId: string;
  encryptionKey: Uint8Array;
}): Promise<YearData['categoryBudgetAnalysis']> {
  const { expenseCategoryId, year, currency, userId, encryptionKey } = params;

  const categoryBudget = await prisma.budget_per_category.findMany({
    where: {
      budget: {
        year: year,
        contact_id: userId,
        currency: currency
      },
      expense_category_id: expenseCategoryId
    },
    include: {
      budget: {
        select: {
          month: true,
          amount: true
        }
      }
    }
  });

  const categoryExpenseSnapshot =
    await prisma.expense_snapshot_per_category.findMany({
      where: {
        monthly_snapshot: {
          year: year,
          contact_id: userId,
          currency_code: currency
        },
        category_id: expenseCategoryId
      },
      include: {
        monthly_snapshot: true
      }
    });

  const currentMonthIndex = new Date().getMonth();

  let currentMonthDataForCategory: {
    month: number;
    expense: number;
  } | null = null;

  if (Number(year) === new Date().getFullYear()) {
    const currentMonthExpenses = await prisma.expense.findMany({
      where: {
        contact_id: userId,
        created_at: {
          gte: startOfMonth(new Date()),
          lt: endOfMonth(new Date())
        },
        currency_code: currency,
        category_id: expenseCategoryId
      },
      select: {
        amount: true
      }
    });

    // Decrypt and sum amounts
    const currentMonthExpenseAmount = currentMonthExpenses.reduce(
      (sum, expense) => {
        const decryptedAmount = Number(
          decryptModel({ amount: expense.amount }, encryptionKey).amount
        );
        return sum + decryptedAmount;
      },
      0
    );

    currentMonthDataForCategory = {
      month: currentMonthIndex,
      expense: currentMonthExpenseAmount
    };
  }

  // Decrypt and sum snapshot amounts
  const totalExpenseForCategory =
    categoryExpenseSnapshot.reduce((acc, snapshot) => {
      const decryptedAmount = Number(
        decryptModel({ amount: snapshot.amount }, encryptionKey).amount
      );
      return acc + decryptedAmount;
    }, 0) + (currentMonthDataForCategory?.expense || 0);

  const totalMonths =
    categoryExpenseSnapshot.length + (currentMonthDataForCategory ? 1 : 0);

  const categoryBudgetAnalysis = {
    expenseCategoryId: expenseCategoryId,
    totalSpent: totalExpenseForCategory,
    monthlyAverage: parseFloat(
      (totalExpenseForCategory / (totalMonths === 0 ? 1 : totalMonths)).toFixed(
        2
      )
    ),
    monthlyData: Array.from({ length: 12 }, (_, index) => {
      const snapshot = categoryExpenseSnapshot.find(
        (s) => s.monthly_snapshot.month === index
      );

      const budget = categoryBudget.find((b) => b.budget.month === index);
      const budgetAmount = budget
        ? Number(
            decryptModel({ amount: budget.budget.amount }, encryptionKey).amount
          )
        : 0;

      return {
        month: index,
        amount:
          Number(year) === new Date().getFullYear() &&
          currentMonthDataForCategory?.month === index
            ? currentMonthDataForCategory.expense
            : snapshot
            ? Number(
                decryptModel({ amount: snapshot.amount }, encryptionKey).amount
              )
            : 0,
        budgetTotal: budgetAmount
      };
    })
  };

  return categoryBudgetAnalysis;
}
