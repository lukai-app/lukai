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
    budget: number | null;
  }>;
  incomeByCategory: Array<{
    id: string;
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  dailyCashFlow: Array<{
    day: string;
    expenses: number;
    income: number;
  }>;
  expenses: Array<{
    id: string;
    amount: number;
    description: string;
    category_id: string;
    from_account_id: string;
    tags: Array<{
      id: string;
      name: string;
    }>;
    created_at: string;
  }>;
  incomes: Array<{
    id: string;
    amount: number;
    description: string;
    category_id: string;
    to_account_id: string;
    created_at: string;
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

export interface IHomeGetResponse {
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
  monthData: MonthData;
  yearData: YearData;
}
