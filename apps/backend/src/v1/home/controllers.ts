import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../../env';
import prisma from '../../lib/prisma';
import { handleError } from '../../utils/handleError';
import { startOfMonth, endOfMonth } from 'date-fns';

export interface MonthData {
  month: number; // 0 to 11
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
    id: string;
    category: string;
    amount: string; // Encrypted
    budget: string | null; // Encrypted
    color: string;
  }>;
  incomeByCategory: Array<{
    id: string;
    category: string;
    amount: string; // Encrypted
    color: string;
    percentage: number;
  }>;
  budget: {
    used: string; // Encrypted
    budgeted: string | null; // Encrypted
  };
  dailyCashFlow: Array<{
    day: string;
    expenses: string; // Encrypted
    income: string; // Encrypted
  }>;
  expenses: Array<{
    id: string;
    amount: string; // Encrypted
    description: string; // Encrypted
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
    amount: string; // Encrypted
    description: string; // Encrypted
    category_id: string;
    to_account_id: string;
    created_at: string;
  }>;
}

export interface YearData {
  year: number;
  annualSummary: Array<{
    month: number; // 0 to 11
    income: string | null; // Encrypted
    expense: string | null; // Encrypted
    savings: string | null; // Encrypted
  }>;
  currentMonthData: {
    month: number;
    income: string | null; // Encrypted
    expense: string | null; // Encrypted
    savings: string | null; // Encrypted
  } | null;
  cashFlow: Array<{
    month: string;
    income: string | null; // Encrypted
    expenses: string | null; // Encrypted
    fixed: string | null; // Encrypted
    flow: string | null; // Encrypted
    accumulated: string | null; // Encrypted
  }>;
  categoryBudgetAnalysis: {
    expenseCategoryId: string;
    totalSpent: string | null; // Encrypted
    monthlyAverage: string | null; // Encrypted
    monthlyData: Array<{
      month: number;
      amount: string | null; // Encrypted
      budgetTotal: string | null; // Encrypted
    }>;
    currentMonthDataForCategory: {
      month: number;
      expenses: string | null;
    } | null;
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

export const getHome = async (req: Request, res: Response) => {
  const apiKey = req.headers['x-api-key'];

  if (apiKey !== env.API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'No tienes permiso para acceder'
    });
  }

  let user;

  try {
    const year = req.query.year;
    const currency = req.query.currency;
    const month = req.query.month;

    const auth = req.headers['authorization'] || '';
    const token = auth.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No tienes permiso para acceder'
      });
    }

    const decryptedToken = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      iat: number;
      exp: number;
    };

    const userId = decryptedToken.id;

    user = await prisma.contact.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const defaultCurrency = currency ?? (user.favorite_currency_code || 'USD');
    const defaultMonth = month ? Number(month) : new Date().getMonth();

    const response: IHomeGetResponse = {
      currency: defaultCurrency,
      locale: user.favorite_locale || 'en-US',
      language: user.favorite_language || 'EN',
      expenseCategories: [],
      incomeCategories: [],
      monthData: {
        month: defaultMonth,
        income: { amount: '', variation: 0 },
        expense: { amount: '', variation: 0 },
        currentMonthBudget: { used: '', budgeted: null },
        savings: { amount: '', variation: 0 },
        lastTransactions: [],
        expensesByCategory: [],
        incomeByCategory: [],
        budget: { used: '', budgeted: null },
        dailyCashFlow: [],
        expenses: [],
        incomes: []
      },
      yearData: {
        year: Number(year),
        annualSummary: [],
        currentMonthData: null,
        cashFlow: [],
        categoryBudgetAnalysis: {
          expenseCategoryId: '',
          totalSpent: '',
          monthlyAverage: null,
          monthlyData: [],
          currentMonthDataForCategory: null
        }
      }
    };

    // Get Categories
    const userExpenseCategories = await prisma.expense_category.findMany({
      where: { contact_id: userId }
    });

    response.expenseCategories = userExpenseCategories.map((category) => ({
      value: category.id,
      label: category.name
    }));

    const userIncomeCategories = await prisma.income_category.findMany({
      where: { contact_id: userId }
    });

    response.incomeCategories = userIncomeCategories.map((category) => ({
      value: category.id,
      label: category.name
    }));

    // Get current month data
    const currentMonthIncomes = await prisma.income.findMany({
      where: {
        contact_id: userId,
        created_at: {
          gte: startOfMonth(new Date(Number(year), defaultMonth, 1)),
          lt: endOfMonth(new Date(Number(year), defaultMonth, 1))
        },
        currency_code: defaultCurrency
      },
      select: {
        id: true,
        amount: true,
        description: true,
        created_at: true,
        to_account_id: true,
        category_id: true,
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    const currentMonthExpenses = await prisma.expense.findMany({
      where: {
        contact_id: userId,
        created_at: {
          gte: startOfMonth(new Date(Number(year), defaultMonth, 1)),
          lt: endOfMonth(new Date(Number(year), defaultMonth, 1))
        },
        currency_code: defaultCurrency
      },
      select: {
        id: true,
        amount: true,
        description: true,
        created_at: true,
        from_account_id: true,
        category_id: true,
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        tags: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    const daysInMonth = endOfMonth(
      new Date(Number(year), defaultMonth, 1)
    ).getDate();

    // Calculate daily cash flow
    const dailyCashFlow = Array.from({ length: daysInMonth }, (_, i) => {
      const day = new Date(Number(year), defaultMonth, i + 1);
      const dayExpenses = currentMonthExpenses
        .filter((expense) => expense.created_at.getDate() === day.getDate())
        .map((expense) => expense.amount)
        .join(',');

      const dayIncomes = currentMonthIncomes
        .filter((income) => income.created_at.getDate() === day.getDate())
        .map((income) => income.amount)
        .join(',');

      return {
        day: day.toISOString(),
        expenses: dayExpenses || null,
        income: dayIncomes || null
      };
    });

    // Set up month data with raw encrypted values
    response.monthData = {
      month: defaultMonth,
      income: {
        amount: currentMonthIncomes.map((income) => income.amount).join(','),
        variation: 0
      },
      expense: {
        amount: currentMonthExpenses.map((expense) => expense.amount).join(','),
        variation: 0
      },
      currentMonthBudget: {
        used: currentMonthExpenses.map((expense) => expense.amount).join(','),
        budgeted: null
      },
      savings: {
        amount: '0',
        variation: 0
      },
      lastTransactions: [
        ...currentMonthIncomes.map((income) => ({
          id: income.id,
          date: income.created_at.toISOString(),
          description: income.description || '',
          category: income.category?.name || '',
          amount: income.amount
        })),
        ...currentMonthExpenses.map((expense) => ({
          id: expense.id,
          date: expense.created_at.toISOString(),
          description: expense.description || '',
          category: expense.category?.name || '',
          amount: expense.amount
        }))
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
      expensesByCategory: [],
      incomeByCategory: [],
      budget: {
        used: currentMonthExpenses.map((expense) => expense.amount).join(','),
        budgeted: null
      },
      dailyCashFlow: dailyCashFlow,
      expenses: [],
      incomes: []
    };

    // get all budgets for the current month
    const currentMonthBudget = await prisma.budget.findUnique({
      where: {
        contact_id_month_year_currency: {
          contact_id: userId,
          month: defaultMonth,
          year: Number(year),
          currency: defaultCurrency
        }
      },
      select: {
        amount: true,
        budget_per_category: {
          select: {
            amount: true,
            expense_category_id: true
          }
        }
      }
    });

    response.monthData.currentMonthBudget.used =
      response.monthData.expense.amount;
    response.monthData.currentMonthBudget.budgeted = currentMonthBudget?.amount;

    // Group expenses by category with raw encrypted values
    const expensesByCategory = currentMonthExpenses.reduce((acc, expense) => {
      const categoryId = expense.category?.id || 'Sin categoría';
      const categoryName = expense.category?.name || 'Sin categoría';
      const categoryColor = expense.category?.color || '#000000';

      if (!acc[categoryId]) {
        acc[categoryId] = {
          id: categoryId,
          category: categoryName,
          amount: '',
          color: categoryColor,
          budget: null
        };
      }

      // Just append the encrypted amount to the list
      acc[categoryId].amount = acc[categoryId].amount
        ? acc[categoryId].amount + ',' + expense.amount
        : expense.amount;

      // if the category has a budget, add the budget to the list, if not, set null
      const categoryBudget = currentMonthBudget?.budget_per_category.find(
        (budget) => budget.expense_category_id === categoryId
      );

      acc[categoryId].budget = categoryBudget?.amount || null;

      return acc;
    }, {} as Record<string, { id: string; category: string; amount: string; color: string; budget: string | null }>);

    response.monthData.expensesByCategory = Object.values(expensesByCategory);

    // Group income by category with raw encrypted values
    const incomeByCategory = currentMonthIncomes.reduce((acc, income) => {
      const categoryId = income.category?.id || 'Sin categoría';
      const categoryName = income.category?.name || 'Sin categoría';

      if (!acc[categoryId]) {
        acc[categoryId] = {
          id: categoryId,
          category: categoryName,
          amount: '',
          percentage: 0,
          color: income.category.color
        };
      }

      // Just append the encrypted amount to the list
      acc[categoryId].amount = acc[categoryId].amount
        ? acc[categoryId].amount + ',' + income.amount
        : income.amount;

      return acc;
    }, {} as Record<string, { id: string; category: string; amount: string; percentage: number; color: string }>);

    response.monthData.incomeByCategory = Object.values(incomeByCategory);

    // handle current month if it's the current year
    let currentMonthData: {
      month: number;
      income: string;
      expense: string;
      savings: string;
    } | null = null;
    const currentMonthIndex = new Date().getMonth();

    if (Number(year) === new Date().getFullYear()) {
      const currentMonthIncomes = await prisma.income.findMany({
        where: {
          contact_id: userId,
          created_at: {
            gte: startOfMonth(new Date(Number(year), currentMonthIndex, 1)),
            lt: endOfMonth(new Date(Number(year), currentMonthIndex, 1))
          },
          currency_code: defaultCurrency
        }
      });

      const currentMonthExpenses = await prisma.expense.findMany({
        where: {
          contact_id: userId,
          created_at: {
            gte: startOfMonth(new Date(Number(year), currentMonthIndex, 1)),
            lt: endOfMonth(new Date(Number(year), currentMonthIndex, 1))
          },
          currency_code: defaultCurrency
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
            currency_code: defaultCurrency
          }
        },
        select: {
          amount: true,
          created_at: true
        }
      });

      currentMonthData = {
        month: currentMonthIndex,
        income: currentMonthIncomes.map((income) => income.amount).join(','),
        expense: currentMonthExpenses
          .map((expense) => expense.amount)
          .join(','),
        savings: currentMonthSavingsRequest
          .map((savings) => savings.amount)
          .join(',')
      };
    }

    // Get year snapshot with raw encrypted values
    const yearSnapshot = await prisma.monthly_snapshot.findMany({
      where: {
        contact_id: userId,
        year: Number(year),
        currency_code: defaultCurrency
      }
    });

    // Get cash flow with raw encrypted values
    const cashFlow = Array.from({ length: 12 }, (_, index) => {
      const monthSnapshot = yearSnapshot.find(
        (snapshot) => snapshot.month === index
      );

      return {
        month: index.toString(),
        income: monthSnapshot?.total_income || null,
        expenses: monthSnapshot?.total_expense || null,
        fixed: null,
        flow: monthSnapshot?.cash_flow || null,
        accumulated: monthSnapshot?.accumulated_cash || null
      };
    });

    const annualSummary = Array.from({ length: 12 }, (_, index) => {
      const monthSnapshot = yearSnapshot.find(
        (snapshot) => snapshot.month === index
      );

      return {
        month: index,
        income: monthSnapshot?.total_income || null,
        expense: monthSnapshot?.total_expense || null,
        savings: monthSnapshot?.total_savings || null
      };
    });

    // get a ramdom expense category id
    const expenseCategoryId =
      response.expenseCategories[
        Math.floor(Math.random() * response.expenseCategories.length)
      ].value;

    const categoryExpenseSnapshot =
      await prisma.expense_snapshot_per_category.findMany({
        where: {
          monthly_snapshot: {
            year: Number(year),
            contact_id: userId,
            currency_code: defaultCurrency
          },
          category_id: expenseCategoryId
        },
        include: {
          monthly_snapshot: true
        }
      });

    let currentMonthDataForCategory: {
      month: number;
      expenses: string;
    } | null = null;

    if (Number(year) === new Date().getFullYear()) {
      const currentMonthExpenses = await prisma.expense.findMany({
        where: {
          contact_id: userId,
          created_at: {
            gte: startOfMonth(new Date()),
            lt: endOfMonth(new Date())
          },
          currency_code: defaultCurrency,
          category_id: expenseCategoryId
        },
        select: {
          amount: true
        }
      });

      currentMonthDataForCategory = {
        month: currentMonthIndex,
        expenses: currentMonthExpenses
          .map((expense) => expense.amount)
          .join(',')
      };
    }

    const categoryBudget = await prisma.budget_per_category.findMany({
      where: {
        budget: {
          year: Number(year),
          contact_id: userId,
          currency: defaultCurrency
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

    // Set up year data with raw encrypted values
    response.yearData = {
      year: Number(year),
      annualSummary: annualSummary,
      currentMonthData: currentMonthData,
      cashFlow: cashFlow,
      categoryBudgetAnalysis: {
        expenseCategoryId: expenseCategoryId,
        totalSpent: null,
        monthlyAverage: null,
        monthlyData: Array.from({ length: 12 }, (_, index) => {
          const snapshot = categoryExpenseSnapshot.find(
            (s) => s.monthly_snapshot.month === index
          );

          const budget = categoryBudget.find((b) => b.budget.month === index);
          const budgetAmount = budget?.budget.amount;

          return {
            month: index,
            amount: snapshot?.amount || null,
            budgetTotal: budgetAmount || null
          };
        }),
        currentMonthDataForCategory: currentMonthDataForCategory
      }
    };

    response.monthData.expenses = currentMonthExpenses.map((expense) => ({
      id: expense.id,
      amount: expense.amount,
      description: expense.description,
      category_id: expense.category_id,
      from_account_id: expense.from_account_id,
      tags: expense.tags.map((tag) => ({
        id: tag.id,
        name: tag.name
      })),
      created_at: expense.created_at.toISOString()
    }));

    response.monthData.incomes = currentMonthIncomes.map((income) => ({
      id: income.id,
      amount: income.amount,
      description: income.description,
      category_id: income.category_id,
      to_account_id: income.to_account_id,
      created_at: income.created_at.toISOString()
    }));

    return res.json({
      success: true,
      data: response,
      message: 'Información obtenida correctamente'
    });
  } catch (error: any) {
    if (error.message.includes('jwt expired')) {
      return res.status(401).json({ message: 'TokenExpiredError' });
    }

    handleError({
      error,
      userId: user?.phone_number,
      endpoint: 'home.get',
      message: 'Error in home.get'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al obtener la información'
    });
  }
};
