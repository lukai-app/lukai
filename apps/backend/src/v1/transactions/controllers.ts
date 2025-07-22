import { Response } from 'express';
import prisma from '../../lib/prisma';
import { AuthRequest } from '../middlewares';
import { handleError } from '../../utils/handleError';
import { decryptModel, encryptModel } from '../../utils/model-encryption';
import { generateMonthlySnapshotForUserFunction } from '../crons/controllers';
import qstashClient from '../../lib/tools/qstash';
import { env } from '../../env';
import { decryptPermanentKey } from '../../utils/encryption';

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, category, type } = req.query;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
        success: false
      });
    }

    const currency = req.query.currency
      ? req.query.currency
      : req.user?.favorite_currency_code || 'USD';

    // range is mandatory because data is encrypted and we need to decrypt it, so to save performance we need to filter by date
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: 'Missing start or end date',
        success: false
      });
    }

    const dateFilter =
      startDate && endDate
        ? {
            created_at: {
              gte: new Date(startDate as string),
              lte: new Date(endDate as string)
            }
          }
        : {};

    // Fetch expenses
    const expenses =
      type !== 'income'
        ? await prisma.expense.findMany({
            where: {
              contact_id: userId,
              currency_code: currency as string,
              ...dateFilter,
              ...(category && { category_id: category as string })
            },
            include: {
              category: {
                select: {
                  id: true,
                  key: true,
                  name: true,
                  color: true,
                  image_id: true
                }
              },
              from: {
                select: {
                  id: true,
                  name: true,
                  account_type: true,
                  currency_code: true
                }
              },
              tags: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: {
              created_at: 'desc'
            }
          })
        : [];

    // Fetch incomes
    const incomes =
      type !== 'expense'
        ? await prisma.income.findMany({
            where: {
              contact_id: userId,
              currency_code: currency as string,
              ...dateFilter,
              ...(category && { category_id: category as string })
            },
            include: {
              category: {
                select: {
                  id: true,
                  key: true,
                  name: true,
                  color: true,
                  image_id: true
                }
              },
              to: {
                select: {
                  id: true,
                  name: true,
                  account_type: true,
                  currency_code: true
                }
              }
            },
            orderBy: {
              created_at: 'desc'
            }
          })
        : [];

    return res.status(200).json({
      expenses: expenses.map((expense) => ({
        ...expense,
        type: 'expense' as const,
        from_account: expense.from
      })),
      incomes: incomes.map((income) => ({
        ...income,
        type: 'income' as const,
        to_account: income.to
      }))
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.user?.id,
      endpoint: 'transactions.getTransactions',
      message: 'Error in transactions.getTransactions'
    });

    return res.status(500).json({
      message: 'Failed to fetch transactions',
      success: false,
      error: error.message
    });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { transactionId } = req.params;
    const appUser = req.user;

    if (!appUser.id) {
      return res.status(401).json({
        message: 'Unauthorized',
        success: false
      });
    }

    if (!appUser?.encryption_key) {
      throw new Error('User encryption key not found');
    }

    const encryptionKey = decryptPermanentKey(
      appUser.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    const userId = appUser.id;

    // Try to find and delete expense first
    let deletedExpense = null;
    let deletedIncome = null;

    try {
      deletedExpense = await prisma.expense.findUnique({
        where: {
          id: transactionId,
          contact_id: userId
        },
        include: {
          from: true
        }
      });

      if (deletedExpense) {
        // Validate transaction year
        const transactionYear = deletedExpense.created_at.getFullYear();
        const currentYear = new Date().getFullYear();

        if (transactionYear < currentYear) {
          return res.status(403).json({
            message: 'Cannot delete transactions from previous years',
            success: false
          });
        }

        // If validation passes, delete the expense
        await prisma.expense.delete({
          where: {
            id: transactionId,
            contact_id: userId
          }
        });
      }
    } catch (error) {
      // If expense not found, try to find income
      try {
        deletedIncome = await prisma.income.findUnique({
          where: {
            id: transactionId,
            contact_id: userId
          },
          include: {
            to: true
          }
        });

        if (deletedIncome) {
          // Validate transaction year
          const transactionYear = deletedIncome.created_at.getFullYear();
          const currentYear = new Date().getFullYear();

          if (transactionYear < currentYear) {
            return res.status(403).json({
              message: 'Cannot delete transactions from previous years',
              success: false
            });
          }

          // If validation passes, delete the income
          await prisma.income.delete({
            where: {
              id: transactionId,
              contact_id: userId
            }
          });
        }
      } catch (error) {
        return res.status(404).json({
          message: 'Transaction not found',
          success: false
        });
      }
    }

    if (deletedExpense) {
      // search by expense created_at if exist monthly_snapshot for the year and month
      const monthlySnapshot = await prisma.monthly_snapshot.findFirst({
        where: {
          contact_id: userId,
          year: deletedExpense.created_at.getFullYear(),
          month: deletedExpense.created_at.getMonth()
        }
      });

      if (monthlySnapshot) {
        // Get current date to know how many months to recalculate
        const currentDate = new Date();
        const deletedDate = deletedExpense.created_at;

        // Calculate all months between deleted transaction and current date
        let recalcYear = deletedDate.getFullYear();
        let recalcMonth = deletedDate.getMonth();

        // Recalculate each month's snapshot until we reach current month
        while (
          recalcYear < currentDate.getFullYear() ||
          (recalcYear === currentDate.getFullYear() &&
            recalcMonth < currentDate.getMonth())
        ) {
          const result = await generateMonthlySnapshotForUserFunction({
            userId,
            safeYear: recalcYear,
            safeMonth: recalcMonth,
            currency: deletedExpense.currency_code
          });

          if (!result.success) {
            console.error(
              `Failed to generate monthly snapshot for user ${userId}:`,
              result.error
            );
            throw new Error(
              `Failed to generate monthly snapshot for user ${userId}: ${result.error}`
            );
          }

          // Move to next month
          if (recalcMonth === 11) {
            recalcMonth = 0;
            recalcYear++;
          } else {
            recalcMonth++;
          }
        }
      } else {
        // Current month case - just update the account balance
        const account = await prisma.accounts.findUnique({
          where: { id: deletedExpense.from_account_id }
        });

        if (!account) {
          throw new Error('Account not found');
        }

        // Decrypt current balance and expense amount
        const decryptedBalance = decryptModel(
          { balance: account.balance },
          encryptionKey
        ).balance;
        const decryptedExpenseAmount = decryptModel(
          { amount: deletedExpense.amount },
          encryptionKey
        ).amount;

        // Calculate new balance
        const newBalance = (
          Number(decryptedBalance) + Number(decryptedExpenseAmount)
        ).toString();

        // Encrypt new balance
        const encryptedNewBalance = encryptModel(
          { balance: newBalance },
          encryptionKey
        ).balance;

        // Update account with new encrypted balance
        await prisma.accounts.update({
          where: { id: deletedExpense.from_account_id },
          data: { balance: encryptedNewBalance }
        });
      }
    } else if (deletedIncome) {
      // search by income created_at if exist monthly_snapshot for the year and month
      const monthlySnapshot = await prisma.monthly_snapshot.findFirst({
        where: {
          contact_id: userId,
          year: deletedIncome.created_at.getFullYear(),
          month: deletedIncome.created_at.getMonth()
        }
      });

      if (monthlySnapshot) {
        // Get current date to know how many months to recalculate
        const currentDate = new Date();
        const deletedDate = deletedIncome.created_at;

        // Calculate all months between deleted transaction and current date
        let recalcYear = deletedDate.getFullYear();
        let recalcMonth = deletedDate.getMonth();

        // Recalculate each month's snapshot until we reach current month
        while (
          recalcYear < currentDate.getFullYear() ||
          (recalcYear === currentDate.getFullYear() &&
            recalcMonth < currentDate.getMonth())
        ) {
          const result = await generateMonthlySnapshotForUserFunction({
            userId,
            safeYear: recalcYear,
            safeMonth: recalcMonth,
            currency: deletedIncome.currency_code
          });

          if (!result.success) {
            console.error(
              `Failed to generate monthly snapshot for user ${userId}:`,
              result.error
            );
            throw new Error(
              `Failed to generate monthly snapshot for user ${userId}: ${result.error}`
            );
          }

          // Move to next month
          if (recalcMonth === 11) {
            recalcMonth = 0;
            recalcYear++;
          } else {
            recalcMonth++;
          }
        }
      } else {
        // Current month case - just update the account balance
        const account = await prisma.accounts.findUnique({
          where: { id: deletedIncome.to_account_id }
        });

        if (!account) {
          throw new Error('Account not found');
        }

        // Decrypt current balance and income amount
        const decryptedBalance = decryptModel(
          { balance: account.balance },
          encryptionKey
        ).balance;
        const decryptedIncomeAmount = decryptModel(
          { amount: deletedIncome.amount },
          encryptionKey
        ).amount;

        // Calculate new balance
        const newBalance = (
          Number(decryptedBalance) - Number(decryptedIncomeAmount)
        ).toString();

        // Encrypt new balance
        const encryptedNewBalance = encryptModel(
          { balance: newBalance },
          encryptionKey
        ).balance;

        // Update account with new encrypted balance
        await prisma.accounts.update({
          where: { id: deletedIncome.to_account_id },
          data: { balance: encryptedNewBalance }
        });
      }
    }

    return res.status(200).json({
      message: 'Transaction deleted successfully',
      success: true
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.user?.id,
      endpoint: 'transactions.deleteTransaction',
      message: 'Error in transactions.deleteTransaction'
    });

    return res.status(500).json({
      message: 'Failed to delete transaction',
      success: false,
      error: error.message
    });
  }
};

export const queueTransactionDeletion = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { transactionId } = req.params;
    const appUser = req.user;

    if (!appUser?.id) {
      return res.status(401).json({
        message: 'Unauthorized',
        success: false
      });
    }

    const response = await qstashClient.publishJSON({
      url: `${env.API_BASE_URL}/v1/transactions/${transactionId}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${appUser.jwt}`
      },
      delay: '10s' // seconds
    });

    return res.status(200).json({
      success: true,
      message: 'Transaction deletion queued successfully',
      undo_token: response.messageId
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.user?.id,
      endpoint: 'transactions.queueTransactionDeletion',
      message: 'Error queueing transaction deletion'
    });

    return res.status(500).json({
      message: 'Failed to queue transaction deletion',
      success: false,
      error: error.message
    });
  }
};

export const cancelTransactionDeletion = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { undo_token } = req.params;
    const appUser = req.user;

    if (!appUser?.id) {
      return res.status(401).json({
        message: 'Unauthorized',
        success: false
      });
    }

    await qstashClient.messages.delete(undo_token);

    return res.status(200).json({
      success: true,
      message: 'Transaction deletion cancelled'
    });
  } catch (error: any) {
    handleError({
      error,
      userId: req.user?.id,
      endpoint: 'transactions.cancelTransactionDeletion',
      message: 'Error cancelling transaction deletion'
    });

    return res.status(500).json({
      message: 'Failed to cancel transaction deletion',
      success: false,
      error: error.message
    });
  }
};
