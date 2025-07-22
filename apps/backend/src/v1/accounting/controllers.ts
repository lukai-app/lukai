import { Response } from 'express';
import { AuthRequest } from '../middlewares';
import { handleError } from '../../utils/handleError';
import prisma from '../../lib/prisma';
import { startOfMonth, endOfMonth } from 'date-fns';

export const getAccounting = async (req: AuthRequest, res: Response) => {
  try {
    const { year, month } = req.query;
    const yearNum = Number(year);
    const monthNum = Number(month);

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
        success: false
      });
    }

    const currency = req.query.currency
      ? (req.query.currency as string)
      : req.user?.favorite_currency_code || 'USD';

    const previousMonth = monthNum === 0 ? 11 : monthNum - 1;
    const previousYear = monthNum === 0 ? yearNum - 1 : yearNum;

    // Get monthly snapshot for the requested month and the previous month
    const monthlySnapshots = await prisma.monthly_snapshot.findMany({
      where: {
        contact_id: userId,
        OR: [
          {
            year: yearNum,
            month: monthNum
          },
          {
            year: previousYear,
            month: previousMonth
          }
        ],
        currency_code: currency
      },
      include: {
        account_balance_snapshots: {
          include: {
            account: true
          }
        }
      }
    });

    const monthlySnapshot = monthlySnapshots.find(
      (snapshot) => snapshot.year === yearNum && snapshot.month === monthNum
    );

    const previousMonthSnapshot = monthlySnapshots.find(
      (snapshot) =>
        snapshot.year === previousYear && snapshot.month === previousMonth
    );

    // If no snapshot exists for the requested month, return empty data, first verify if is the current month
    if (!monthlySnapshot) {
      return res.json({
        id: '',
        year: yearNum,
        month: monthNum,
        currency_code: currency,
        total_income: null,
        total_expense: null,
        total_savings: null,
        cash_flow: null,
        accumulated_cash: null,
        account_balance_snapshots: [],
        journal_entries: []
      });
    }

    // Get journal entries for the month
    const startDate = startOfMonth(new Date(yearNum, monthNum));
    const endDate = endOfMonth(new Date(yearNum, monthNum));

    const [incomes, expenses, transfers] = await Promise.all([
      prisma.income.findMany({
        where: {
          contact_id: userId,
          created_at: {
            gte: startDate,
            lte: endDate
          },
          currency_code: currency
        },
        include: {
          to: {
            select: {
              id: true,
              name: true
            }
          },
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          created_at: 'asc'
        }
      }),
      prisma.expense.findMany({
        where: {
          contact_id: userId,
          created_at: {
            gte: startDate,
            lte: endDate
          },
          currency_code: currency
        },
        include: {
          from: {
            select: {
              id: true,
              name: true
            }
          },
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          created_at: 'asc'
        }
      }),
      prisma.transfer.findMany({
        where: {
          contact_id: userId,
          created_at: {
            gte: startDate,
            lte: endDate
          },
          from: {
            currency_code: currency
          },
          to: {
            currency_code: currency
          }
        },
        include: {
          from: {
            select: {
              id: true,
              name: true
            }
          },
          to: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          created_at: 'asc'
        }
      })
    ]);

    // Transform transactions into journal entries
    const journalEntries = [
      ...incomes.map((income) => ({
        id: income.id,
        amount: income.amount,
        type: 'income' as const,
        accountFrom: null,
        accountTo: {
          id: income.to.id,
          name: income.to.name
        },
        description: income.description || undefined,
        category: income.category,
        created_at: income.created_at.toISOString()
      })),
      ...expenses.map((expense) => ({
        id: expense.id,
        amount: expense.amount,
        type: 'expense' as const,
        accountFrom: {
          id: expense.from.id,
          name: expense.from.name
        },
        accountTo: null,
        description: expense.description || undefined,
        category: expense.category,
        created_at: expense.created_at.toISOString()
      })),
      ...transfers.map((transfer) => ({
        id: transfer.id,
        amount: transfer.amount,
        type: 'transfer' as const,
        accountFrom: {
          id: transfer.from.id,
          name: transfer.from.name
        },
        accountTo: {
          id: transfer.to.id,
          name: transfer.to.name
        },
        description: transfer.description || undefined,
        timestamp: transfer.created_at.toISOString()
      }))
    ];

    // Return the data in the format expected by the use-accounting hook
    return res.json({
      id: monthlySnapshot.id,
      year: monthlySnapshot.year,
      month: monthlySnapshot.month,
      currency_code: monthlySnapshot.currency_code,
      total_income: monthlySnapshot.total_income,
      total_expense: monthlySnapshot.total_expense,
      total_savings: monthlySnapshot.total_savings,
      cash_flow: monthlySnapshot.cash_flow,
      accumulated_cash: monthlySnapshot.accumulated_cash,
      account_balance_snapshots: monthlySnapshot.account_balance_snapshots.map(
        (snapshot) => ({
          id: snapshot.id,
          account_id: snapshot.account_id,
          balance: snapshot.balance,
          account: {
            name: snapshot.account.name,
            account_type: snapshot.account.account_type
          },
          startingBalance:
            previousMonthSnapshot?.account_balance_snapshots.find(
              (snapshot) => snapshot.account_id === snapshot.account_id
            )?.balance || null
        })
      ),
      journal_entries: journalEntries
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.user?.id,
      endpoint: 'accounting.getAccounting',
      message: 'Error in accounting.getAccounting'
    });

    return res.status(500).json({
      message: 'Failed to fetch accounting data',
      success: false,
      error: error.message
    });
  }
};

export const getCurrentMonthAccounting = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
        success: false
      });
    }

    const currency = req.query.currency
      ? (req.query.currency as string)
      : req.user?.favorite_currency_code || 'USD';

    // Get current date
    const now = new Date();

    // Get start and end dates for the current month
    const startDate = startOfMonth(now);
    const endDate = endOfMonth(now);

    const year = now.getFullYear();
    const month = now.getMonth();

    const previousMonth = month === 0 ? 11 : month - 1;
    const previousYear = month === 0 ? year - 1 : year;

    // Get all accounts for the user
    const accounts = await prisma.accounts.findMany({
      where: {
        contact_id: userId,
        currency_code: currency
      },
      select: {
        id: true,
        name: true,
        account_type: true,
        balance: true,
        balance_snapshots: {
          where: {
            monthly_snapshot: {
              year: previousYear,
              month: previousMonth
            }
          }
        }
      }
    });

    // Get all transactions for the current month
    const [incomes, expenses, transfers] = await Promise.all([
      prisma.income.findMany({
        where: {
          contact_id: userId,
          created_at: {
            gte: startDate,
            lte: endDate
          },
          currency_code: currency
        },
        include: {
          to: {
            select: {
              id: true,
              name: true
            }
          },
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          created_at: 'asc'
        }
      }),
      prisma.expense.findMany({
        where: {
          contact_id: userId,
          created_at: {
            gte: startDate,
            lte: endDate
          },
          currency_code: currency
        },
        include: {
          from: {
            select: {
              id: true,
              name: true
            }
          },
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          created_at: 'asc'
        }
      }),
      prisma.transfer.findMany({
        where: {
          contact_id: userId,
          created_at: {
            gte: startDate,
            lte: endDate
          },
          from: {
            currency_code: currency
          },
          to: {
            currency_code: currency
          }
        },
        include: {
          from: {
            select: {
              id: true,
              name: true
            }
          },
          to: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          created_at: 'asc'
        }
      })
    ]);

    // Transform transactions into the format expected by the hook
    const transactions = [
      ...incomes.map((income) => ({
        id: income.id,
        amount: income.amount,
        type: 'income' as const,
        accountFrom: null,
        accountTo: {
          id: income.to.id,
          name: income.to.name
        },
        description: income.description || undefined,
        created_at: income.created_at.toISOString(),
        category: income.category
      })),
      ...expenses.map((expense) => ({
        id: expense.id,
        amount: expense.amount,
        type: 'expense' as const,
        accountFrom: {
          id: expense.from.id,
          name: expense.from.name
        },
        accountTo: null,
        description: expense.description || undefined,
        created_at: expense.created_at.toISOString(),
        category: expense.category
      })),
      ...transfers.map((transfer) => ({
        id: transfer.id,
        amount: transfer.amount,
        type: 'transfer' as const,
        accountFrom: {
          id: transfer.from.id,
          name: transfer.from.name
        },
        accountTo: {
          id: transfer.to.id,
          name: transfer.to.name
        },
        description: transfer.description || undefined,
        created_at: transfer.created_at.toISOString()
      }))
    ];

    // Transform accounts into the format expected by the hook
    const transformedAccounts = accounts.map((account) => ({
      id: account.id,
      name: account.name,
      account_type: account.account_type,
      currentBalance: account.balance,
      startingBalance: account.balance_snapshots[0]?.balance || null
    }));

    // Return the data in the format expected by the useCurrentMonthAccounting hook
    return res.json({
      transactions,
      accounts: transformedAccounts
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.user?.id,
      endpoint: 'accounting.getCurrentMonthAccounting',
      message: 'Error in accounting.getCurrentMonthAccounting'
    });

    return res.status(500).json({
      message: 'Failed to fetch current month accounting data',
      success: false,
      error: error.message
    });
  }
};
