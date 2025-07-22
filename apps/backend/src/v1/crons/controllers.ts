import prisma from '../../lib/prisma';
import { handleError } from '../../utils/handleError';
import { endOfMonth, startOfMonth } from 'date-fns';
import { Request, Response } from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { decryptPermanentKey } from '../../utils/encryption';
import { env } from '../../env';
import { decryptModel, encryptModel } from '../../utils/model-encryption';

dayjs.extend(utc);

export const generateMonthlySnapshotForUserFunction = async ({
  userId,
  safeYear,
  safeMonth,
  currency
}: {
  userId: string;
  safeYear: number;
  safeMonth: number;
  currency?: string;
}) => {
  try {
    const user = await prisma.contact.findUnique({
      where: {
        id: userId
      },
      select: {
        name: true,
        encryption_key: true,
        expenses: {
          where: {
            created_at: {
              gte: startOfMonth(new Date(safeYear, safeMonth, 1)),
              lt: endOfMonth(new Date(safeYear, safeMonth, 1))
            }
          },
          select: {
            currency_code: true,
            amount: true,
            category_id: true,
            from_account_id: true
          }
        },
        incomes: {
          where: {
            created_at: {
              gte: startOfMonth(new Date(safeYear, safeMonth, 1)),
              lt: endOfMonth(new Date(safeYear, safeMonth, 1))
            }
          },
          select: {
            currency_code: true,
            amount: true,
            category_id: true,
            to_account_id: true
          }
        },
        transfers: {
          where: {
            created_at: {
              gte: startOfMonth(new Date(safeYear, safeMonth, 1)),
              lt: endOfMonth(new Date(safeYear, safeMonth, 1))
            },
            to: {
              account_type: 'SAVINGS'
            },
            from: {
              account_type: 'SAVINGS'
            }
          },
          select: {
            amount: true,
            from_account_id: true,
            to_account_id: true,
            to: {
              select: {
                account_type: true,
                currency_code: true
              }
            },
            from: {
              select: {
                account_type: true,
                currency_code: true
              }
            }
          }
        },
        monthly_snapshot: {
          where: {
            year: safeMonth === 0 ? safeYear - 1 : safeYear,
            month: safeMonth === 0 ? 11 : safeMonth - 1
          },
          select: {
            accumulated_cash: true,
            currency_code: true,
            account_balance_snapshots: {
              select: {
                account_id: true,
                balance: true
              }
            }
          }
        },
        accounts: {
          select: {
            id: true,
            name: true,
            account_type: true,
            currency_code: true,
            balance: true
          }
        }
      }
    });

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const encryptionKey = decryptPermanentKey(
      user.encryption_key,
      env.ENCRYPTION_MASTER_KEY
    );

    // only log expense length if it's more than 0
    if (user.expenses.length > 0) {
      console.log(
        'expenses length more than 0 (',
        user.expenses.length,
        ')',
        user.name
      );
    }

    // search in expenses and incomes all the currencies used by the user
    let userCurrencies = [
      ...Array.from(
        new Set([
          ...user.expenses.map((expense) => expense.currency_code),
          ...user.incomes.map((income) => income.currency_code),
          ...user.transfers.map((transfer) => transfer.to.currency_code)
        ])
      )
    ];

    if (userCurrencies.length > 0) {
      console.log('userCurrencies', userCurrencies);
    }

    if (currency) {
      userCurrencies = [currency];
    }

    // Process each currency independently to handle errors separately
    const results = await Promise.allSettled(
      userCurrencies.map(async (currency) => {
        try {
          const expenses = user.expenses.filter(
            (expense) => expense.currency_code === currency
          );
          const incomes = user.incomes.filter(
            (income) => income.currency_code === currency
          );
          const transfers = user.transfers.filter(
            (transfer) => transfer.to.currency_code === currency
          );

          // Decrypt expense amounts
          const decryptedExpenses = expenses.map((expense) => {
            const decrypted = decryptModel(
              { amount: expense.amount },
              encryptionKey
            );
            return {
              ...expense,
              amount: decrypted.amount
            };
          });

          // Decrypt income amounts
          const decryptedIncomes = incomes.map((income) => {
            const decrypted = decryptModel(
              { amount: income.amount },
              encryptionKey
            );
            return {
              ...income,
              amount: decrypted.amount
            };
          });

          // Decrypt transfer amounts
          const decryptedTransfers = transfers.map((transfer) => {
            const decrypted = decryptModel(
              { amount: transfer.amount },
              encryptionKey
            );
            return {
              ...transfer,
              amount: decrypted.amount
            };
          });

          // Calculate totals from decrypted values
          const totalExpense = decryptedExpenses.reduce(
            (acc, expense) => acc + Number(expense.amount),
            0
          );
          const totalIncome = decryptedIncomes.reduce(
            (acc, income) => acc + Number(income.amount),
            0
          );
          const totalSavings =
            decryptedTransfers
              .filter((transfer) => transfer.to.account_type === 'SAVINGS')
              .reduce((acc, transfer) => acc + Number(transfer.amount), 0) -
            decryptedTransfers
              .filter((transfer) => transfer.from.account_type === 'SAVINGS')
              .reduce((acc, transfer) => acc + Number(transfer.amount), 0);

          const cashFlow = totalIncome - totalExpense;

          // Get previous month's accumulated cash
          const previousMonthSnapshot = user.monthly_snapshot.find(
            (snapshot) => snapshot.currency_code === currency
          );

          // Decrypt previous month's accumulated cash if it exists
          let previousAccumulatedCash = 0;
          if (previousMonthSnapshot) {
            const decrypted = decryptModel(
              { accumulated_cash: previousMonthSnapshot.accumulated_cash },
              encryptionKey
            );
            previousAccumulatedCash = Number(decrypted.accumulated_cash);
          }

          const accumulatedCash = previousAccumulatedCash + cashFlow;

          // Encrypt the calculated values for storage
          const encryptedTotalIncome = encryptModel(
            { total_income: totalIncome.toString() },
            encryptionKey
          ).total_income;

          const encryptedTotalExpense = encryptModel(
            { total_expense: totalExpense.toString() },
            encryptionKey
          ).total_expense;

          const encryptedTotalSavings = encryptModel(
            { total_savings: totalSavings.toString() },
            encryptionKey
          ).total_savings;

          const encryptedCashFlow = encryptModel(
            { cash_flow: cashFlow.toString() },
            encryptionKey
          ).cash_flow;

          const encryptedAccumulatedCash = encryptModel(
            { accumulated_cash: accumulatedCash.toString() },
            encryptionKey
          ).accumulated_cash;

          // Process income categories
          const incomeSnapshotPerCategory = [
            ...Array.from(
              new Set([...incomes.map((income) => income.category_id)])
            )
          ].map((category) => {
            const categoryIncomes = decryptedIncomes.filter(
              (income) => income.category_id === category
            );

            const categoryTotalIncome = categoryIncomes.reduce(
              (acc, income) => acc + Number(income.amount),
              0
            );

            // Encrypt category total
            const encryptedAmount = encryptModel(
              { amount: categoryTotalIncome.toString() },
              encryptionKey
            ).amount;

            return {
              category_id: category,
              amount: encryptedAmount
            };
          });

          // Process expense categories
          const expenseSnapshotPerCategory = [
            ...Array.from(
              new Set([...expenses.map((expense) => expense.category_id)])
            )
          ].map((category) => {
            const categoryExpenses = decryptedExpenses.filter(
              (expense) => expense.category_id === category
            );

            const categoryTotalExpense = categoryExpenses.reduce(
              (acc, expense) => acc + Number(expense.amount),
              0
            );

            // Encrypt category total
            const encryptedAmount = encryptModel(
              { amount: categoryTotalExpense.toString() },
              encryptionKey
            ).amount;

            return {
              category_id: category,
              amount: encryptedAmount
            };
          });

          // Process account balance snapshots with historical calculation
          const accountBalanceSnapshots = await Promise.all(
            user.accounts
              .filter((account) => account.currency_code === currency)
              .map(async (account) => {
                let startingBalance;

                // If we have a previous month's snapshot, use that balance as starting point
                if (previousMonthSnapshot?.account_balance_snapshots) {
                  const previousBalance =
                    previousMonthSnapshot.account_balance_snapshots.find(
                      (snapshot) => snapshot.account_id === account.id
                    );

                  if (previousBalance) {
                    startingBalance = decryptModel(
                      { balance: previousBalance.balance },
                      encryptionKey
                    ).balance;
                  }
                }

                // If no previous snapshot found, use current balance for current month only
                if (!startingBalance) {
                  // If this is current month, use current balance
                  const currentDate = new Date();
                  const isCurrentMonth =
                    safeYear === currentDate.getFullYear() &&
                    safeMonth === currentDate.getMonth();

                  if (isCurrentMonth) {
                    startingBalance = decryptModel(
                      { balance: account.balance },
                      encryptionKey
                    ).balance;
                  } else {
                    // For historical months with no previous snapshot, start from 0
                    startingBalance = '0';
                  }
                }

                // Calculate all transactions affecting this account in the month
                let finalBalance = Number(startingBalance);

                // Add incomes to receiving accounts
                decryptedIncomes
                  .filter((income) => income.to_account_id === account.id)
                  .forEach((income) => {
                    finalBalance += Number(income.amount);
                  });

                // Subtract expenses from source accounts
                decryptedExpenses
                  .filter((expense) => expense.from_account_id === account.id)
                  .forEach((expense) => {
                    finalBalance -= Number(expense.amount);
                  });

                // Handle transfers (both outgoing and incoming)
                decryptedTransfers.forEach((transfer) => {
                  if (transfer.from_account_id === account.id) {
                    finalBalance -= Number(transfer.amount);
                  }
                  if (transfer.to_account_id === account.id) {
                    finalBalance += Number(transfer.amount);
                  }
                });

                // Encrypt final balance for storage
                const encryptedBalance = encryptModel(
                  { balance: finalBalance.toString() },
                  encryptionKey
                ).balance;

                return {
                  account_id: account.id,
                  balance: encryptedBalance
                };
              })
          );

          // Use upsert to either create new or replace existing monthly snapshot
          const newMonthlySnapshot = await prisma.monthly_snapshot.upsert({
            where: {
              contact_id_year_month_currency_code: {
                contact_id: userId,
                year: safeYear,
                month: safeMonth,
                currency_code: currency
              }
            },
            update: {
              total_income: encryptedTotalIncome,
              total_expense: encryptedTotalExpense,
              total_savings: encryptedTotalSavings,
              cash_flow: encryptedCashFlow,
              accumulated_cash: encryptedAccumulatedCash,
              income_snapshot_per_category: {
                deleteMany: {},
                createMany: {
                  data: incomeSnapshotPerCategory
                }
              },
              expense_snapshot_per_category: {
                deleteMany: {},
                createMany: {
                  data: expenseSnapshotPerCategory
                }
              },
              account_balance_snapshots: {
                deleteMany: {},
                createMany: {
                  data: accountBalanceSnapshots
                }
              }
            },
            create: {
              contact_id: userId,
              year: safeYear,
              month: safeMonth,
              currency_code: currency,
              total_income: encryptedTotalIncome,
              total_expense: encryptedTotalExpense,
              total_savings: encryptedTotalSavings,
              cash_flow: encryptedCashFlow,
              accumulated_cash: encryptedAccumulatedCash,
              income_snapshot_per_category: {
                createMany: {
                  data: incomeSnapshotPerCategory
                }
              },
              expense_snapshot_per_category: {
                createMany: {
                  data: expenseSnapshotPerCategory
                }
              },
              account_balance_snapshots: {
                createMany: {
                  data: accountBalanceSnapshots
                }
              }
            }
          });

          console.log(
            `newMonthlySnapshot for ${currency} at ${safeYear}-${safeMonth}`,
            newMonthlySnapshot.total_income,
            newMonthlySnapshot.total_expense,
            newMonthlySnapshot.total_savings,
            newMonthlySnapshot.cash_flow,
            newMonthlySnapshot.accumulated_cash
          );

          return { currency, success: true };
        } catch (error) {
          console.error(
            `Error generating monthly snapshot for currency ${currency}:`,
            error
          );
          return { currency, success: false, error };
        }
      })
    );

    // Log results for each currency
    const failedCurrencies = results
      .filter(
        (
          result
        ): result is PromiseFulfilledResult<{
          currency: string;
          success: boolean;
          error: unknown;
        }> => result.status === 'fulfilled' && !result.value.success
      )
      .map((result) => {
        const { currency, error } = result.value;
        console.error(
          `Failed to generate monthly snapshot for currency ${currency}:`,
          error
        );
        return { currency, error };
      });

    if (failedCurrencies.length > 0) {
      return {
        success: false,
        error: failedCurrencies
      };
    }

    return {
      success: true,
      result: { userId, name: user.name ?? '' }
    };
  } catch (error) {
    return {
      success: false,
      error: error
    };
  }
};

export async function monthlySnapshot(req: Request, res: Response) {
  try {
    let { year, month } = req.body;

    if (!year || !month) {
      // Get current date in UTC explicitly
      const currentDate = dayjs.utc();
      const previousMonth = currentDate.subtract(1, 'month');

      if (!year) {
        year = previousMonth.year();
      }

      if (!month) {
        month = previousMonth.month();
      }
    }

    // Add type assertion to help TypeScript understand these are definitely numbers
    const safeYear = year as number;
    const safeMonth = month as number;

    let errors: { userId: string; error: any }[] = [];
    let success: { userId: string; name: string }[] = [];

    const generateMonthlySnapshotForUser = async (userId: string) => {
      try {
        const result = await generateMonthlySnapshotForUserFunction({
          userId,
          safeYear,
          safeMonth
        });

        if (result.success) {
          success.push({ userId, name: result.result.name });
        } else {
          errors.push({ userId, error: result.error });
        }
      } catch (error) {
        errors.push({ userId, error });
      }
    };

    const users = await prisma.contact.findMany({
      select: {
        id: true
      }
    });

    await Promise.all(
      users.map((user) => generateMonthlySnapshotForUser(user.id))
    );

    // If there are any errors, return success: false
    if (errors.length > 0) {
      return res.status(200).json({
        success: false,
        errors,
        results: success,
        message: 'Some snapshots failed to generate'
      });
    }

    return res.status(200).json({ success: true, errors, results: success });
  } catch (error) {
    handleError({
      error,
      userId: undefined,
      endpoint: 'cron.monthly-snapshot',
      message: 'Error in monthly snapshot'
    });

    return res.status(500).json({
      success: false,
      message: 'Error al generar el snapshot'
    });
  }
}
