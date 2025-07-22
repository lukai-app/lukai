import { ChatCompletionTool } from 'openai/resources';
import prisma from '../../../lib/prisma';
import { sendTemplate } from '../../../lib/tools/whatsapp';
import { mixpanelServer } from '../../../lib/tools/mixpanel';
import { account_type, expense } from '@prisma/client';
import { defaultColors } from '../../../lib/constants/defaultCategories';
import DayjsSingleton from '../../../lib/helpers/Dayjs';
import { customCheckoutLink, lemon } from '../../../lib/tools/lemon';
import { encrypt, decrypt } from '../../../utils/encryption';
import { handleError } from '../../../utils/handleError';
import { env } from '../../../env';
import { googleSheetsService } from '../../../lib/tools/googleSheets';

export const callForCustomerSupport = async ({
  phoneNumber,
  context
}: {
  phoneNumber: string;
  context: string;
}) => {
  try {
    await sendTemplate({
      to: env.WHATSAPP_ADMIN_NUMBER,
      templateName: 'admin_soporte_feedback_notificacion',
      params: [phoneNumber, context]
    });

    return 'Se ha notificado al equipo de soporte.';
  } catch (error: any) {
    handleError({
      error,
      userId: phoneNumber,
      endpoint: 'tool.callForCustomerSupport',
      message:
        `*Parameters:* ${JSON.stringify({ phoneNumber, context })} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al notificar al equipo de soporte.';
  }
};

export const saveUserFeedback = async ({
  feedback,
  phoneNumber
}: {
  feedback: string;
  phoneNumber: string;
}) => {
  try {
    await sendTemplate({
      to: env.WHATSAPP_ADMIN_NUMBER,
      templateName: 'admin_soporte_feedback_notificacion',
      params: [phoneNumber, feedback]
    });

    return 'Feedback guardado correctamente.';
  } catch (error: any) {
    handleError({
      error,
      userId: phoneNumber,
      endpoint: 'tool.saveUserFeedback',
      message:
        `*Parameters:* ${JSON.stringify({ feedback, phoneNumber })} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al guardar el feedback.';
  }
};

export const saveUserProfileInsights = async ({
  phoneNumber,
  insights
}: {
  phoneNumber: string;
  insights: string;
}) => {
  try {
    await prisma.contact.update({
      where: {
        phone_number: phoneNumber
      },
      data: {
        user_profile_insights: insights
      }
    });

    return 'Insights de perfil guardados correctamente. Esto no se mostrará al usuario. Se utiliza para mejorar la experiencia del usuario. Y no se compartirá con terceros. Ni con el usuario.';
  } catch (error: any) {
    handleError({
      error,
      userId: phoneNumber,
      endpoint: 'tool.saveUserProfileInsights',
      message:
        `*Parameters:* ${JSON.stringify({ phoneNumber, insights })} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al guardar los insights de perfil.';
  }
};

export const registerExpenses = async (params: {
  userPhoneNumber: string;
  expenses: Array<{
    amount: number;
    categoryKey: string;
    description: string;
    message: string;
    currencyCode: string;
    fromAccountKey: string;
    transactionTags?: string[];
    createdAt?: string; // ISO date
  }>;
  encryptionKey: Uint8Array;
}) => {
  try {
    const { userPhoneNumber, encryptionKey } = params;
    let { expenses } = params;

    const userExpenseCategories = await prisma.expense_category.findMany({
      where: {
        contact: {
          phone_number: userPhoneNumber
        }
      }
    });

    const userAccounts = await prisma.accounts.findMany({
      where: {
        contact: {
          phone_number: userPhoneNumber
        }
      }
    });

    // Check if all expense categories exist, if not create them
    const categoryKeysToCreate = Array.from(
      new Set(expenses.map((expense) => expense.categoryKey))
    ).filter(
      (categoryKey) =>
        !userExpenseCategories.some(
          (category) => category.key.toLowerCase() === categoryKey.toLowerCase()
        )
    );

    // Create missing expense categories
    for (const categoryKey of categoryKeysToCreate) {
      const createdCategory = await createExpenseCategoryPrimitive({
        userPhoneNumber,
        name: categoryKey.split('_').join(' ').toLowerCase(),
        key: categoryKey.toUpperCase(),
        description: undefined
      });
      userExpenseCategories.push(createdCategory);
    }

    // Create missing financial accounts
    const accountsToCreate = expenses.filter(
      (expense) =>
        !userAccounts.some(
          (account) =>
            account.key.toLowerCase() ===
              expense.fromAccountKey.toLowerCase() &&
            account.currency_code === expense.currencyCode
        )
    );

    // Create accounts for each missing combination of key and currency
    for (const expense of accountsToCreate) {
      const accountKey = expense.fromAccountKey;
      const accountName = accountKey.split('_').join(' ').toLowerCase();

      const { account } = await createFinancialAccountPrimitive({
        userPhoneNumber,
        accountType: 'REGULAR',
        name: accountName,
        key: accountKey.toUpperCase(),
        balance: 0,
        currencyCode: expense.currencyCode,
        description: undefined,
        encryptionKey
      });
      userAccounts.push(account);
    }

    // group expenses by accountID and currency
    const expensesByAccount = expenses.reduce((acc, expense) => {
      const accountKey = `${expense.fromAccountKey}_${expense.currencyCode}`;
      if (!acc[accountKey]) {
        acc[accountKey] = [];
      }

      acc[accountKey].push(expense);

      return acc;
    }, {} as Record<string, typeof expenses>);

    // remove unexisting transaction tags
    const existingTransactionTags = await prisma.transaction_tag.findMany({
      where: {
        contact: {
          phone_number: userPhoneNumber
        }
      }
    });

    const existingTransactionTagNames = existingTransactionTags.map((tag) =>
      tag.name.toLowerCase()
    );

    // if expense have unexisting transaction tags, remove them from the expense
    expenses = expenses.map((expense) => {
      return {
        ...expense,
        transactionTags: expense.transactionTags?.filter((tag) =>
          existingTransactionTagNames.includes(tag.toLowerCase())
        )
      };
    });

    // create expense by expense because prisma createMany not work with tags
    const createdExpenses: Array<expense> = [];

    for (const expense of expenses) {
      const category = userExpenseCategories.find(
        (category) =>
          category.key.toLowerCase() === expense.categoryKey.toLowerCase()
      );

      const fromAccount = userAccounts.find(
        (account) =>
          account.key.toLowerCase() === expense.fromAccountKey.toLowerCase() &&
          account.currency_code === expense.currencyCode
      );

      if (!fromAccount) {
        throw new Error(
          `Account not found for key: ${expense.fromAccountKey} and currency: ${expense.currencyCode}`
        );
      }

      const transactionTagsIds =
        expense.transactionTags?.map((transactionTag) => {
          const tag = existingTransactionTags.find(
            (tag) => tag.name.toLowerCase() === transactionTag.toLowerCase()
          );
          return tag?.id;
        }) ?? [];

      const createdExpense = await prisma.expense.create({
        data: {
          amount: encrypt(expense.amount.toString(), encryptionKey),
          description: encrypt(expense.description, encryptionKey),
          message: encrypt(expense.message, encryptionKey),
          contact: {
            connect: {
              phone_number: userPhoneNumber
            }
          },
          category: {
            connect: {
              id: category.id
            }
          },
          from: {
            connect: {
              id: fromAccount.id
            }
          },
          currency_code: expense.currencyCode,
          tags: {
            connect: transactionTagsIds
              .filter((id) => id !== undefined)
              .map((id) => ({ id }))
          },
          created_at: expense.createdAt
            ? (() => {
                const date = new Date(expense.createdAt);
                // If time is midnight (00:00:00), it means only date was provided
                if (
                  date.getHours() === 0 &&
                  date.getMinutes() === 0 &&
                  date.getSeconds() === 0
                ) {
                  // Use the date from createdAt but time from current moment
                  const now = new Date();
                  date.setHours(
                    now.getHours(),
                    now.getMinutes(),
                    now.getSeconds()
                  );
                }
                return date;
              })()
            : new Date()
        }
      });
      createdExpenses.push(createdExpense);
    }

    const user = await prisma.contact.update({
      where: {
        phone_number: userPhoneNumber
      },
      data: {
        accounts: {
          updateMany: Object.entries(expensesByAccount).map(([_, expenses]) => {
            const accountKey = expenses[0].fromAccountKey;
            const currencyCode = expenses[0].currencyCode;

            const account = userAccounts.find(
              (account) =>
                account.key.toLowerCase() === accountKey.toLowerCase() &&
                account.currency_code === currencyCode
            );

            if (!account) {
              throw new Error(
                `Account not found for key: ${accountKey} and currency: ${currencyCode}`
              );
            }

            // Decrypt current balance, subtract expense amount, and encrypt result
            const currentBalance = parseFloat(
              decrypt(account.balance, encryptionKey)
            );
            const newAmount = expenses.reduce(
              (acc, expense) => acc + expense.amount,
              0
            );
            const newBalance = currentBalance - newAmount;

            return {
              where: {
                id: account.id
              },
              data: {
                balance: encrypt(newBalance.toString(), encryptionKey)
              }
            };
          })
        }
      }
    });

    mixpanelServer.track('expense_logged', {
      distinct_id: user.phone_number,
      phone_number: user.phone_number,
      name: user.name,
      favorite_language: user.favorite_language,
      currency: expenses[0].currencyCode,
      datetime: new Date(),
      category: expenses[0].categoryKey,
      mp_country_code: user.country_code,
      country_code: user.country_code
    });
    mixpanelServer.people.increment(
      user.phone_number,
      'expenses',
      createdExpenses.length
    );

    // Sync expenses to Google Sheets
    try {
      await syncExpensesToGoogleSheets(
        user.phone_number,
        createdExpenses,
        encryptionKey
      );
    } catch (syncError) {
      // Don't fail the expense creation if Google Sheets sync fails
      console.error('Google Sheets sync failed:', syncError);
      await handleError({
        error: syncError,
        userId: user.phone_number,
        endpoint: 'google-sheets-sync-expenses',
        message: `Failed to sync ${createdExpenses.length} expenses to Google Sheets for user ${user.phone_number}`
      });
    }

    return `Gasto(s) registrado(s) correctamente. Número de gastos: ${createdExpenses.length}`;
  } catch (error: any) {
    handleError({
      error,
      userId: params.userPhoneNumber,
      endpoint: 'tool.registerExpenses',
      message:
        `*Parameters:* ${JSON.stringify(params)} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al registrar el gasto.';
  }
};

export const registerExpensesFreePlan = async (params: {
  userPhoneNumber: string;
  expenses: Array<{
    amount: number;
    categoryKey: string;
    description: string;
    message: string;
    currencyCode: string;
    fromAccountKey: string;
    createdAt?: string; // ISO date
  }>;
  encryptionKey: Uint8Array;
}) => {
  try {
    const { userPhoneNumber, expenses, encryptionKey } = params;

    const expensesCount = await prisma.expense.count({
      where: {
        contact: {
          phone_number: userPhoneNumber
        }
      }
    });

    if (expensesCount >= 10) {
      return `El cliente ha registrado hasta el momento ${expensesCount} gastos. Límite de gastos alcanzado. Puede cambiar al plan premium para registrar más gastos.`;
    }

    const userExpenseCategories = await prisma.expense_category.findMany({
      where: {
        contact: {
          phone_number: userPhoneNumber
        }
      }
    });

    const userAccounts = await prisma.accounts.findMany({
      where: {
        contact: {
          phone_number: userPhoneNumber
        }
      }
    });

    const user = await prisma.contact.update({
      where: {
        phone_number: userPhoneNumber
      },
      data: {
        expenses: {
          createMany: {
            data: expenses.map((expense) => {
              const category = userExpenseCategories.find(
                (category) =>
                  category.key.toLowerCase() ===
                  expense.categoryKey.toLowerCase()
              );

              const fromAccount = userAccounts.find(
                (account) =>
                  account.key.toLowerCase() ===
                  expense.fromAccountKey.toLowerCase()
              );

              if (!category) {
                throw new Error(
                  `Expense category not found: ${expense.categoryKey}`
                );
              }

              if (!fromAccount) {
                throw new Error(`Account not found: ${expense.fromAccountKey}`);
              }

              return {
                amount: encrypt(expense.amount.toString(), encryptionKey),
                description: encrypt(expense.description, encryptionKey),
                message: encrypt(expense.message, encryptionKey),
                category_id: category.id,
                from_account_id: fromAccount.id,
                currency_code: expense.currencyCode,
                created_at: expense.createdAt
                  ? (() => {
                      const date = new Date(expense.createdAt);
                      // If time is midnight (00:00:00), it means only date was provided
                      if (
                        date.getHours() === 0 &&
                        date.getMinutes() === 0 &&
                        date.getSeconds() === 0
                      ) {
                        // Use the date from createdAt but time from current moment
                        const now = new Date();
                        date.setHours(
                          now.getHours(),
                          now.getMinutes(),
                          now.getSeconds()
                        );
                      }
                      return date;
                    })()
                  : new Date()
              };
            })
          }
        },
        accounts: {
          updateMany: expenses.map((expense) => {
            const account = userAccounts.find(
              (account) =>
                account.key.toLowerCase() ===
                expense.fromAccountKey.toLowerCase()
            );

            if (!account) {
              throw new Error(
                `Account not found for key: ${expense.fromAccountKey}`
              );
            }

            // Decrypt current balance, subtract expense amount, and encrypt result
            const currentBalance = parseFloat(
              decrypt(account.balance, encryptionKey)
            );
            const newBalance = currentBalance - expense.amount;

            return {
              where: {
                id: account.id
              },
              data: {
                balance: encrypt(newBalance.toString(), encryptionKey)
              }
            };
          })
        }
      }
    });

    mixpanelServer.track('expense_logged', {
      distinct_id: user.phone_number,
      phone_number: user.phone_number,
      name: user.name,
      favorite_language: user.favorite_language,
      currency: expenses[0].currencyCode,
      datetime: new Date(),
      category: expenses[0].categoryKey,
      mp_country_code: user.country_code,
      country_code: user.country_code
    });
    mixpanelServer.people.increment(
      user.phone_number,
      'expenses',
      expenses.length
    );

    return `Gasto(s) registrado(s) correctamente. Número de gastos: ${expenses.length}`;
  } catch (error: any) {
    handleError({
      error,
      userId: params.userPhoneNumber,
      endpoint: 'tool.registerExpensesFreePlan',
      message:
        `*Parameters:* ${JSON.stringify(params)} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al registrar el gasto.';
  }
};
export const registerIncomes = async (params: {
  userPhoneNumber: string;
  incomes: Array<{
    amount: number;
    categoryKey: string;
    description: string;
    message: string;
    currencyCode: string;
    toAccountKey: string;
    createdAt?: string; // ISO date
  }>;
  encryptionKey: Uint8Array;
}) => {
  try {
    const { userPhoneNumber, incomes, encryptionKey } = params;

    const userIncomeCategories = await prisma.income_category.findMany({
      where: {
        contact: {
          phone_number: userPhoneNumber
        }
      }
    });

    const userAccounts = await prisma.accounts.findMany({
      where: {
        contact: {
          phone_number: userPhoneNumber
        }
      }
    });

    // Check if all income categories exist, if not create them
    const categoryKeysToCreate = Array.from(
      new Set(incomes.map((income) => income.categoryKey))
    ).filter(
      (categoryKey) =>
        !userIncomeCategories.some(
          (category) => category.key.toLowerCase() === categoryKey.toLowerCase()
        )
    );

    // Create missing income categories
    for (const categoryKey of categoryKeysToCreate) {
      const createdCategory = await createIncomeCategoryPrimitive({
        userPhoneNumber,
        name: categoryKey.split('_').join(' ').toLowerCase(),
        key: categoryKey.toUpperCase(),
        description: undefined
      });
      userIncomeCategories.push(createdCategory);
    }

    // Create missing financial accounts
    const accountsToCreate = incomes.filter(
      (income) =>
        !userAccounts.some(
          (account) =>
            account.key.toLowerCase() === income.toAccountKey.toLowerCase() &&
            account.currency_code === income.currencyCode
        )
    );

    // Create accounts for each missing combination of key and currency
    for (const income of accountsToCreate) {
      const accountKey = income.toAccountKey;
      const accountName = accountKey.split('_').join(' ').toLowerCase();

      const { account } = await createFinancialAccountPrimitive({
        userPhoneNumber,
        accountType: 'REGULAR',
        name: accountName,
        key: accountKey.toUpperCase(),
        balance: 0,
        currencyCode: income.currencyCode,
        description: undefined,
        encryptionKey
      });
      userAccounts.push(account);
    }

    // group incomes by accountID
    const incomesByAccount = incomes.reduce((acc, income) => {
      // Create a unique key combining account key and currency
      const accountUniqueKey = `${income.toAccountKey}_${income.currencyCode}`;

      if (!acc[accountUniqueKey]) {
        acc[accountUniqueKey] = [];
      }

      acc[accountUniqueKey].push(income);

      return acc;
    }, {} as Record<string, typeof incomes>);

    const user = await prisma.contact.update({
      where: {
        phone_number: userPhoneNumber
      },
      data: {
        incomes: {
          createMany: {
            data: incomes.map((income) => {
              const category = userIncomeCategories.find(
                (category) =>
                  category.key.toLowerCase() ===
                  income.categoryKey.toLowerCase()
              );

              // Find account matching both key and currency
              const financialAccount = userAccounts.find(
                (account) =>
                  account.key.toLowerCase() ===
                    income.toAccountKey.toLowerCase() &&
                  account.currency_code === income.currencyCode
              );

              if (!financialAccount) {
                throw new Error(
                  `Account not found for key: ${income.toAccountKey} and currency: ${income.currencyCode}`
                );
              }

              return {
                amount: encrypt(income.amount.toString(), encryptionKey),
                description: encrypt(income.description, encryptionKey),
                message: encrypt(income.message, encryptionKey),
                currency_code: income.currencyCode,
                category_id: category.id,
                to_account_id: financialAccount.id,
                created_at: income.createdAt
                  ? new Date(income.createdAt)
                  : new Date()
              };
            })
          }
        },
        accounts: {
          updateMany: Object.entries(incomesByAccount).map(([_, incomes]) => {
            const accountKey = incomes[0].toAccountKey;
            const currencyCode = incomes[0].currencyCode;

            const account = userAccounts.find(
              (account) =>
                account.key.toLowerCase() === accountKey.toLowerCase() &&
                account.currency_code === currencyCode
            );

            if (!account) {
              throw new Error(
                `Account not found for key: ${accountKey} and currency: ${currencyCode}`
              );
            }

            // Decrypt current balance, add new amount, and encrypt result
            const currentBalance = parseFloat(
              decrypt(account.balance, encryptionKey)
            );
            const newAmount = incomes.reduce(
              (acc, income) => acc + income.amount,
              0
            );
            const newBalance = currentBalance + newAmount;

            return {
              where: {
                id: account.id
              },
              data: {
                balance: encrypt(newBalance.toString(), encryptionKey)
              }
            };
          })
        }
      }
    });

    mixpanelServer.track('income_logged', {
      distinct_id: user.phone_number,
      phone_number: user.phone_number,
      name: user.name,
      favorite_language: user.favorite_language,
      currency: incomes[0]?.currencyCode,
      datetime: new Date(),
      category: incomes[0]?.categoryKey,
      mp_country_code: user.country_code,
      country_code: user.country_code
    });
    mixpanelServer.people.increment(
      user.phone_number,
      'incomes',
      incomes.length
    );

    return `Ingreso(s) registrado(s) correctamente. Número de ingresos: ${incomes.length}`;
  } catch (error: any) {
    handleError({
      error,
      userId: params.userPhoneNumber,
      endpoint: 'tool.registerIncomes',
      message:
        `*Parameters:* ${JSON.stringify(params)} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al registrar el ingreso.';
  }
};

export const transferMoneyBetweenAccounts = async (params: {
  userPhoneNumber: string;
  transfers: Array<{
    amount: number;
    description: string;
    message: string;
    fromAccountKey: string;
    toAccountKey: string;
    createdAt?: string; // ISO date
  }>;
  encryptionKey: Uint8Array;
}) => {
  try {
    const { userPhoneNumber, transfers, encryptionKey } = params;

    const userAccounts = await prisma.accounts.findMany({
      where: {
        contact: {
          phone_number: userPhoneNumber
        }
      }
    });

    const user = await prisma.contact.update({
      where: {
        phone_number: userPhoneNumber
      },
      data: {
        transfers: {
          createMany: {
            data: transfers.map((transfer) => {
              const fromAccount = userAccounts.find(
                (account) =>
                  account.key.toLowerCase() ===
                  transfer.fromAccountKey.toLowerCase()
              );

              const toAccount = userAccounts.find(
                (account) =>
                  account.key.toLowerCase() ===
                  transfer.toAccountKey.toLowerCase()
              );

              return {
                amount: encrypt(transfer.amount.toString(), encryptionKey),
                description: encrypt(transfer.description, encryptionKey),
                message: encrypt(transfer.message, encryptionKey),
                from_account_id: fromAccount?.id as string,
                to_account_id: toAccount?.id as string,
                created_at: transfer.createdAt
                  ? new Date(transfer.createdAt)
                  : new Date()
              };
            })
          }
        },
        accounts: {
          updateMany: [
            ...transfers.map((transfer) => {
              const account = userAccounts.find(
                (account) =>
                  account.key.toLowerCase() ===
                  transfer.fromAccountKey.toLowerCase()
              );

              if (!account) {
                throw new Error(
                  `Account not found for key: ${transfer.fromAccountKey}`
                );
              }

              // Decrypt current balance, subtract transfer amount, and encrypt result
              const currentBalance = parseFloat(
                decrypt(account.balance, encryptionKey)
              );
              const newBalance = currentBalance - transfer.amount;

              return {
                where: {
                  id: account.id
                },
                data: {
                  balance: encrypt(newBalance.toString(), encryptionKey)
                }
              };
            }),
            ...transfers.map((transfer) => {
              const account = userAccounts.find(
                (account) =>
                  account.key.toLowerCase() ===
                  transfer.toAccountKey.toLowerCase()
              );

              if (!account) {
                throw new Error(
                  `Account not found for key: ${transfer.toAccountKey}`
                );
              }

              // Decrypt current balance, add transfer amount, and encrypt result
              const currentBalance = parseFloat(
                decrypt(account.balance, encryptionKey)
              );
              const newBalance = currentBalance + transfer.amount;

              return {
                where: {
                  id: account.id
                },
                data: {
                  balance: encrypt(newBalance.toString(), encryptionKey)
                }
              };
            })
          ]
        }
      }
    });

    mixpanelServer.track('transfer_money_logged', {
      distinct_id: user.phone_number,
      phone_number: user.phone_number,
      name: user.name,
      favorite_language: user.favorite_language,
      mp_country_code: user.country_code,
      country_code: user.country_code
    });

    return `Transferencia(s) realizada(s) correctamente. Número de transferencias: ${transfers.length}`;
  } catch (error: any) {
    handleError({
      error,
      userId: params.userPhoneNumber,
      endpoint: 'tool.transferMoneyBetweenAccounts',
      message:
        `*Parameters:* ${JSON.stringify(params)} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al realizar la transferencia.';
  }
};

const createFinancialAccountPrimitive = async (params: {
  userPhoneNumber: string;
  accountType: account_type;
  name: string;
  key: string;
  balance: number;
  currencyCode: string;
  description?: string;
  encryptionKey: Uint8Array;
}) => {
  try {
    const {
      userPhoneNumber,
      accountType,
      name,
      key,
      balance,
      currencyCode,
      description,
      encryptionKey
    } = params;

    // validate if the account already exists by key and currency code
    const existingAccount = await prisma.accounts.findFirst({
      where: {
        contact: {
          phone_number: userPhoneNumber
        },
        key,
        currency_code: currencyCode
      }
    });

    if (existingAccount) {
      return {
        account: existingAccount,
        message: `La cuenta financiera con key ${key} y moneda ${currencyCode} ya existe.`
      };
    }

    const account = await prisma.accounts.create({
      data: {
        contact: {
          connect: {
            phone_number: userPhoneNumber
          }
        },
        account_type: accountType,
        name,
        key,
        balance: encrypt('0', encryptionKey),
        currency_code: currencyCode,
        description
      }
    });

    // search for the deposit category
    const depositCategory = await prisma.income_category.findFirst({
      where: {
        key: 'DEPOSIT',
        contact: {
          phone_number: userPhoneNumber
        }
      }
    });

    if (!depositCategory) {
      throw new Error('Categoría de ingreso no encontrada');
    }

    // create an income for the account
    await prisma.income.create({
      data: {
        to: {
          connect: {
            id: account.id
          }
        },
        category: {
          connect: {
            id: depositCategory.id
          }
        },
        contact: {
          connect: {
            phone_number: userPhoneNumber
          }
        },
        amount: encrypt(balance.toString(), encryptionKey),
        description: encrypt('Depósito inicial', encryptionKey),
        currency_code: currencyCode,
        created_at: new Date()
      }
    });

    return {
      account,
      message: `Cuenta financiera creada correctamente. key de la cuenta: ${account.key}, Nombre de la cuenta: ${account.name}`
    };
  } catch (error: any) {
    throw error; // rethrow error because this is a primitive function and it should be handled by the caller
  }
};

export const createFinancialAccount = async (params: {
  userPhoneNumber: string;
  accountType: account_type;
  name: string;
  key: string;
  balance: number;
  currencyCode: string;
  description?: string;
  encryptionKey: Uint8Array;
}) => {
  try {
    const {
      userPhoneNumber,
      accountType,
      name,
      key,
      balance,
      description,
      currencyCode,
      encryptionKey
    } = params;

    const { message } = await createFinancialAccountPrimitive({
      userPhoneNumber,
      accountType,
      name,
      key,
      balance,
      currencyCode,
      description,
      encryptionKey
    });

    return message;
  } catch (error: any) {
    handleError({
      error,
      userId: params.userPhoneNumber,
      endpoint: 'tool.createFinancialAccount',
      message:
        `*Parameters:* ${JSON.stringify(params)} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al crear la cuenta financiera.';
  }
};

const createExpenseCategoryPrimitive = async (params: {
  userPhoneNumber: string;
  name: string;
  key: string;
  description?: string;
}) => {
  try {
    const { userPhoneNumber, name, key, description } = params;

    // select a random color from valid_colors
    const colorValues = defaultColors;
    const color = colorValues[Math.floor(Math.random() * colorValues.length)];

    const category = await prisma.expense_category.create({
      data: {
        contact: {
          connect: {
            phone_number: userPhoneNumber
          }
        },
        name,
        key,
        description,
        color
      }
    });

    return category;
  } catch (error: any) {
    throw error; // rethrow error because this is a primitive function and it should be handled by the caller
  }
};

export const createExpenseCategory = async (params: {
  userPhoneNumber: string;
  name: string;
  key: string;
  description?: string;
}) => {
  try {
    const { userPhoneNumber, name, key, description } = params;

    const category = await createExpenseCategoryPrimitive({
      userPhoneNumber,
      name,
      key,
      description
    });

    return `Categoría de gasto creada correctamente. key de la categoría: ${category.key}, Nombre de la categoría: ${category.name}`;
  } catch (error: any) {
    handleError({
      error,
      userId: params.userPhoneNumber,
      endpoint: 'tool.createExpenseCategory',
      message:
        `*Parameters:* ${JSON.stringify(params)} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al crear la categoría de gasto.';
  }
};

const createIncomeCategoryPrimitive = async (params: {
  userPhoneNumber: string;
  name: string;
  key: string;
  description?: string;
}) => {
  try {
    const { userPhoneNumber, name, key, description } = params;

    const colorValues = defaultColors;
    const color = colorValues[Math.floor(Math.random() * colorValues.length)];

    const category = await prisma.income_category.create({
      data: {
        contact: {
          connect: {
            phone_number: userPhoneNumber
          }
        },
        name,
        key,
        description,
        color
      }
    });

    return category;
  } catch (error: any) {
    throw error; // rethrow error because this is a primitive function and it should be handled by the caller
  }
};

export const createIncomeCategory = async (params: {
  userPhoneNumber: string;
  name: string;
  key: string;
  description?: string;
}) => {
  try {
    const { userPhoneNumber, name, key, description } = params;

    const category = await createIncomeCategoryPrimitive({
      userPhoneNumber,
      name,
      key,
      description
    });

    return `Categoría de ingreso creada correctamente. key de la categoría: ${category.key}, Nombre de la categoría: ${category.name}`;
  } catch (error: any) {
    handleError({
      error,
      userId: params.userPhoneNumber,
      endpoint: 'tool.createIncomeCategory',
      message:
        `*Parameters:* ${JSON.stringify(params)} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al crear la categoría de ingreso.';
  }
};

export const setBudget = async (params: {
  phoneNumber: string;
  amount: number;
  year: number;
  currencyCode: string;
  month: number;
  encryptionKey: Uint8Array;
}) => {
  try {
    const { phoneNumber, amount, year, currencyCode, month, encryptionKey } =
      params;

    const existingBudget = await prisma.budget.findFirst({
      where: {
        contact: {
          phone_number: phoneNumber
        },
        year,
        month,
        currency: currencyCode
      }
    });

    if (existingBudget) {
      const encryptedAmount = encrypt(amount.toString(), encryptionKey);
      await prisma.budget.update({
        where: {
          id: existingBudget.id
        },
        data: {
          amount: encryptedAmount
        }
      });

      return `Presupuesto actualizado correctamente. Monto: ${amount}, Año: ${year}, Mes: ${month}, Moneda: ${currencyCode}`;
    } else {
      const encryptedAmount = encrypt(amount.toString(), encryptionKey);
      await prisma.budget.create({
        data: {
          contact: {
            connect: {
              phone_number: phoneNumber
            }
          },
          amount: encryptedAmount,
          year,
          currency: currencyCode,
          month
        }
      });

      return `Presupuesto creado correctamente. Monto: ${amount}, Año: ${year}, Mes: ${month}, Moneda: ${currencyCode}`;
    }
  } catch (error: any) {
    handleError({
      error,
      userId: params.phoneNumber,
      endpoint: 'tool.setBudget',
      message:
        `*Parameters:* ${JSON.stringify(params)} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al crear el presupuesto.';
  }
};

export const setExpenseCategoryBudget = async (params: {
  phoneNumber: string;
  categoryKey: string;
  amount: number;
  year: number;
  currencyCode: string;
  month: number;
  encryptionKey: Uint8Array;
}) => {
  try {
    const {
      phoneNumber,
      categoryKey,
      amount,
      year,
      currencyCode,
      month,
      encryptionKey
    } = params;

    const encryptedAmount = encrypt(amount.toString(), encryptionKey);

    const existingBudget = await prisma.budget_per_category.findFirst({
      where: {
        budget: {
          contact: {
            phone_number: phoneNumber
          },
          year,
          month,
          currency: currencyCode
        },
        expense_category: {
          key: {
            mode: 'insensitive',
            equals: categoryKey
          }
        }
      },
      include: {
        expense_category: {
          select: {
            id: true,
            name: true,
            key: true
          }
        }
      }
    });

    if (existingBudget) {
      await prisma.budget_per_category.update({
        where: {
          id: existingBudget.id
        },
        data: {
          amount: encryptedAmount
        }
      });

      return `Presupuesto de categoría de gasto actualizado correctamente. Monto: ${amount}, Año: ${year}, Mes: ${month}, Moneda: ${currencyCode}, Categoría: ${existingBudget.expense_category.name}, Key de la categoría: ${existingBudget.expense_category.key}`;
    } else {
      // find if exists a budget for the given month and year and currency
      let generalBudget = await prisma.budget.findFirst({
        where: {
          contact: {
            phone_number: phoneNumber
          },
          year,
          month,
          currency: currencyCode
        }
      });

      if (!generalBudget) {
        // create a general budget for the given month and year and currency
        const encryptedAmount = encrypt(amount.toString(), encryptionKey);
        generalBudget = await prisma.budget.create({
          data: {
            contact: {
              connect: {
                phone_number: phoneNumber
              }
            },
            amount: encryptedAmount,
            year,
            currency: currencyCode,
            month
          }
        });
      }

      const contact = await prisma.contact.findUnique({
        where: {
          phone_number: phoneNumber
        }
      });

      if (!contact) {
        throw new Error(
          `No se encontró el contacto con el número de teléfono ${phoneNumber}`
        );
      }

      const budget = await prisma.budget_per_category.create({
        data: {
          budget: {
            connect: {
              id: generalBudget.id
            }
          },
          expense_category: {
            connect: {
              contact_id_key: {
                key: categoryKey,
                contact_id: contact.id
              }
            }
          },
          amount: encryptedAmount
        },
        include: {
          expense_category: {
            select: {
              id: true,
              name: true,
              key: true
            }
          }
        }
      });

      return `Presupuesto de categoría de gasto creado correctamente. Monto: ${amount}, Año: ${year}, Mes: ${month}, Moneda: ${currencyCode}, Categoría: ${budget.expense_category.name}, Key de la categoría: ${budget.expense_category.key}`;
    }
  } catch (error: any) {
    handleError({
      error,
      userId: params.phoneNumber,
      endpoint: 'tool.setExpenseCategoryBudget',
      message:
        `*Parameters:* ${JSON.stringify(params)} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al crear el presupuesto de categoría de gasto.';
  }
};

export const getSpending = async (params: {
  userPhoneNumber: string;
  categoryKey?: string;
  currencyCode: string;
  dateFrom: string; // ISO date
  dateTo: string; // ISO date;
  encryptionKey: Uint8Array;
}) => {
  try {
    const {
      userPhoneNumber,
      categoryKey,
      currencyCode,
      dateFrom,
      dateTo,
      encryptionKey
    } = params;

    const spendings = await prisma.expense.findMany({
      where: {
        contact: {
          phone_number: userPhoneNumber
        },
        category: categoryKey
          ? {
              key: {
                mode: 'insensitive',
                equals: categoryKey
              }
            }
          : undefined,
        currency_code: currencyCode,
        created_at: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo)
        }
      },
      select: {
        amount: true
      }
    });

    const totalAmount = spendings.reduce((acc, expense) => {
      const decryptedAmount = Number(decrypt(expense.amount, encryptionKey));
      return acc + decryptedAmount;
    }, 0);

    const user = await prisma.contact.findUnique({
      where: {
        phone_number: userPhoneNumber
      }
    });

    const dayjs = DayjsSingleton.getInstance(user.favorite_locale ?? 'es-PE');

    const formattedDateFrom = user.favorite_timezone
      ? dayjs(dateFrom).tz(user.favorite_timezone).format('DD [de] MMMM YYYY')
      : dayjs(dateFrom).format('DD [de] MMMM YYYY');

    const formattedDateTo = user.favorite_timezone
      ? dayjs(dateTo).tz(user.favorite_timezone).format('DD [de] MMMM YYYY')
      : dayjs(dateTo).format('DD [de] MMMM YYYY');

    return `Se encontraron ${
      spendings.length
    } gastos, con un total de ${totalAmount} ${currencyCode} entre las fechas ${formattedDateFrom} y ${formattedDateTo} ${
      categoryKey ? `para la categoría ${categoryKey}` : ''
    }.`;
  } catch (error: any) {
    handleError({
      error,
      userId: params.userPhoneNumber,
      endpoint: 'tool.getSpending',
      message:
        `*Parameters:* ${JSON.stringify(params)} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al obtener el total de gastos.';
  }
};

export const getIncome = async (params: {
  userPhoneNumber: string;
  categoryKey?: string;
  currencyCode: string;
  dateFrom: string; // ISO date
  dateTo: string; // ISO date;
  encryptionKey: Uint8Array;
}) => {
  try {
    const {
      userPhoneNumber,
      categoryKey,
      currencyCode,
      dateFrom,
      dateTo,
      encryptionKey
    } = params;

    const incomes = await prisma.income.findMany({
      where: {
        contact: {
          phone_number: userPhoneNumber
        },
        category: categoryKey
          ? {
              key: {
                mode: 'insensitive',
                equals: categoryKey
              }
            }
          : undefined,
        currency_code: currencyCode,
        created_at: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo)
        }
      },
      select: {
        amount: true
      }
    });

    const totalAmount = incomes.reduce((acc, income) => {
      const decryptedAmount = Number(decrypt(income.amount, encryptionKey));
      return acc + decryptedAmount;
    }, 0);

    const user = await prisma.contact.findUnique({
      where: {
        phone_number: userPhoneNumber
      }
    });

    const dayjs = DayjsSingleton.getInstance(user.favorite_locale ?? 'es-PE');

    const formattedDateFrom = user.favorite_timezone
      ? dayjs(dateFrom).tz(user.favorite_timezone).format('DD [de] MMMM YYYY')
      : dayjs(dateFrom).format('DD [de] MMMM YYYY');

    const formattedDateTo = user.favorite_timezone
      ? dayjs(dateTo).tz(user.favorite_timezone).format('DD [de] MMMM YYYY')
      : dayjs(dateTo).format('DD [de] MMMM YYYY');

    return `Se encontraron ${
      incomes.length
    } ingresos, con un total de ${totalAmount} ${currencyCode} entre las fechas ${formattedDateFrom} y ${formattedDateTo} ${
      categoryKey ? `para la categoría ${categoryKey}` : ''
    }.`;
  } catch (error: any) {
    handleError({
      error,
      userId: params.userPhoneNumber,
      endpoint: 'tool.getIncome',
      message:
        `*Parameters:* ${JSON.stringify(params)} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al obtener el total de ingresos.';
  }
};

export const getSavings = async (params: {
  phoneNumber: string;
  savingsAccountsKeys: string[];
  encryptionKey: Uint8Array;
}) => {
  try {
    const { phoneNumber, savingsAccountsKeys, encryptionKey } = params;

    const savings = await prisma.accounts.findMany({
      where: {
        contact: {
          phone_number: phoneNumber
        },
        key: {
          in: savingsAccountsKeys
        }
      },
      select: {
        balance: true
      }
    });

    const totalBalance = savings.reduce((acc, account) => {
      const decryptedBalance = Number(decrypt(account.balance, encryptionKey));
      return acc + decryptedBalance;
    }, 0);

    return `Total de ahorros: ${totalBalance}`;
  } catch (error: any) {
    handleError({
      error,
      userId: params.phoneNumber,
      endpoint: 'tool.getSavings',
      message:
        `*Parameters:* ${JSON.stringify(params)} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al obtener el total de ahorros.';
  }
};

export const getTransfers = async (params: {
  userPhoneNumber: string;
  fromAccountKey?: string;
  toAccountKey?: string;
  amountFrom?: number;
  amountTo?: number;
  dateFrom: string; // ISO date
  dateTo: string; // ISO date
  encryptionKey: Uint8Array;
}) => {
  try {
    const {
      userPhoneNumber,
      fromAccountKey,
      toAccountKey,
      dateFrom,
      dateTo,
      amountFrom,
      amountTo,
      encryptionKey
    } = params;

    if (!fromAccountKey && !toAccountKey) {
      return `Debes proporcionar al menos un ID de cuenta de origen o destino.`;
    }

    const userAccounts = await prisma.accounts.findMany({
      where: {
        contact: {
          phone_number: userPhoneNumber
        }
      }
    });

    let fromAccountId: string | undefined = undefined;

    if (fromAccountKey) {
      const fromAccount = userAccounts.find(
        (account) => account.key.toLowerCase() === fromAccountKey.toLowerCase()
      );

      if (!fromAccount) {
        return `No se encontró la cuenta con Key ${fromAccountKey} para el usuario ${userPhoneNumber}`;
      }

      fromAccountId = fromAccount.id;
    }

    let toAccountId: string | undefined = undefined;

    if (toAccountKey) {
      const toAccount = userAccounts.find(
        (account) => account.key.toLowerCase() === toAccountKey.toLowerCase()
      );

      if (!toAccount) {
        return `No se encontró la cuenta con Key ${toAccountKey} para el usuario ${userPhoneNumber}`;
      }

      toAccountId = toAccount.id;
    }

    const transfers = await prisma.transfer.findMany({
      where: {
        contact: {
          phone_number: userPhoneNumber
        },
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        created_at: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo)
        },
        OR: [
          ...(amountFrom ? [{ amount: { gte: amountFrom.toString() } }] : []),
          ...(amountTo ? [{ amount: { lte: amountTo.toString() } }] : [])
        ]
      },
      select: {
        amount: true
      }
    });

    const totalAmount = transfers.reduce((acc, transfer) => {
      const decryptedAmount = Number(decrypt(transfer.amount, encryptionKey));
      return acc + decryptedAmount;
    }, 0);

    return `Total de transferencias: ${totalAmount}`;
  } catch (error: any) {
    handleError({
      error,
      userId: params.userPhoneNumber,
      endpoint: 'tool.getTransfers',
      message:
        `*Parameters:* ${JSON.stringify(params)} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al obtener el total de transferencias.';
  }
};

export const getBudget = async (params: {
  phoneNumber: string;
  currencyCode: string;
  year: number;
  month: number;
  encryptionKey: Uint8Array;
}) => {
  try {
    const { phoneNumber, currencyCode, year, month, encryptionKey } = params;

    const user = await prisma.contact.findUnique({
      where: {
        phone_number: phoneNumber
      },
      select: {
        id: true
      }
    });

    if (!user) {
      return `No se encontró el usuario con el número de teléfono ${phoneNumber}`;
    }

    const budgets = await prisma.budget.findUnique({
      where: {
        contact_id_month_year_currency: {
          contact_id: user.id,
          month,
          year,
          currency: currencyCode
        }
      },
      include: {
        budget_per_category: {
          select: {
            amount: true,
            expense_category_id: true,
            expense_category: {
              select: {
                name: true,
                key: true
              }
            }
          }
        }
      }
    });

    if (!budgets) {
      return `No se encontró presupuesto para el año ${year}, mes ${
        month || 'N/A'
      }, moneda ${currencyCode}`;
    }

    const decryptedBudget = Number(decrypt(budgets.amount, encryptionKey));
    const decryptedCategoryBudgets = budgets.budget_per_category.map(
      (categoryBudget) => ({
        ...categoryBudget,
        amount: Number(decrypt(categoryBudget.amount, encryptionKey))
      })
    );

    return `Presupuesto para el año ${year}, mes ${
      month || 'N/A'
    }, moneda ${currencyCode}: ${decryptedBudget} \n\n y por categoría: \n\n${decryptedCategoryBudgets
      .map(
        (categoryBudget) =>
          `Categoría: ${categoryBudget.expense_category.name}, Key de la categoría: ${categoryBudget.expense_category.key}, Monto: ${categoryBudget.amount}`
      )
      .join('\n')}`;
  } catch (error: any) {
    handleError({
      error,
      userId: params.phoneNumber,
      endpoint: 'tool.getBudget',
      message:
        `*Parameters:* ${JSON.stringify(params)} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al obtener el presupuesto.';
  }
};

export const getBudgetByCategory = async (params: {
  phoneNumber: string;
  categoryKey: string;
  currencyCode: string;
  year: number;
  month: number;
  encryptionKey: Uint8Array;
}) => {
  try {
    const {
      phoneNumber,
      categoryKey,
      currencyCode,
      year,
      month,
      encryptionKey
    } = params;

    const budget = await prisma.budget_per_category.findFirst({
      where: {
        budget: {
          contact: {
            phone_number: phoneNumber
          },
          year,
          currency: currencyCode,
          month
        },
        expense_category: {
          key: {
            mode: 'insensitive',
            equals: categoryKey
          }
        }
      },
      include: {
        expense_category: {
          select: {
            id: true,
            name: true,
            key: true
          }
        }
      }
    });

    if (!budget) {
      return `No se encontró presupuesto para el año ${year}, mes ${
        month || 'N/A'
      }, moneda ${currencyCode} y categoría con key ${categoryKey}`;
    }

    const decryptedAmount = Number(decrypt(budget.amount, encryptionKey));

    return `Monto: ${decryptedAmount}, Código de moneda: ${currencyCode}, Key de categoría: ${budget.expense_category.key}, Nombre de categoría: ${budget.expense_category.name}, Año: ${year}, Mes: ${month}`;
  } catch (error: any) {
    handleError({
      error,
      userId: params.phoneNumber,
      endpoint: 'tool.getBudgetByCategory',
      message:
        `*Parameters:* ${JSON.stringify(params)} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al obtener el presupuesto por categoría.';
  }
};

export const getAccountBalance = async (params: {
  userPhoneNumber: string;
  accountKey: string;
  encryptionKey: Uint8Array;
}) => {
  try {
    const { userPhoneNumber, accountKey, encryptionKey } = params;

    const account = await prisma.accounts.findFirst({
      where: {
        contact: {
          phone_number: userPhoneNumber
        },
        key: accountKey
      },
      select: {
        name: true,
        description: true,
        account_type: true,
        balance: true,
        currency_code: true,
        created_at: true
      }
    });

    if (!account) {
      throw new Error(`Account not found for key: ${accountKey}`);
    }

    return `Nombre de la cuenta: ${account.name}, Descripción: ${
      account.description
    }, Tipo de cuenta: ${account.account_type}, Saldo: ${Number(
      decrypt(account.balance, encryptionKey)
    )}, Código de moneda: ${account.currency_code}, Fecha de creación: ${
      account.created_at
    }`;
  } catch (error: any) {
    handleError({
      error,
      userId: params.userPhoneNumber,
      endpoint: 'tool.getAccountBalance',
      message:
        `*Parameters:* ${JSON.stringify(params)} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al obtener el saldo de la cuenta.';
  }
};

export const findSpendings = async (params: {
  userPhoneNumber: string;
  currencyCode: string;
  categoryKeys?: string[];
  searchQuery?: string;
  amountFrom?: number;
  amountTo?: number;
  dateFrom: string; // ISO date
  dateTo: string; // ISO date;
  encryptionKey: Uint8Array;
}) => {
  try {
    const {
      userPhoneNumber,
      categoryKeys,
      currencyCode,
      dateFrom,
      dateTo,
      amountFrom,
      amountTo,
      searchQuery,
      encryptionKey
    } = params;

    let mappedCategoryIds: string[] | undefined = undefined;

    if (categoryKeys && categoryKeys.length > 0) {
      const userCategories = await prisma.expense_category.findMany({
        where: {
          contact: {
            phone_number: userPhoneNumber
          }
        }
      });

      mappedCategoryIds = categoryKeys
        ?.map((key) => {
          const category = userCategories.find(
            (category) => category.key.toLowerCase() === key.toLowerCase()
          );

          return category?.id;
        })
        .filter(Boolean) as string[] | undefined;
    }

    const spendings = await prisma.expense.findMany({
      where: {
        contact: {
          phone_number: userPhoneNumber
        },
        category: categoryKeys
          ? {
              id: {
                in: mappedCategoryIds
              }
            }
          : undefined,
        currency_code: currencyCode,
        created_at: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo)
        }
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
            name: true,
            key: true
          }
        },
        contact: {
          select: {
            favorite_locale: true,
            favorite_timezone: true
          }
        }
      }
    });

    const dayjs = DayjsSingleton.getInstance(
      spendings[0]?.contact?.favorite_locale ?? 'es-PE'
    );

    // We need to decrypt the amount, description, message in order to make the filters work
    const decryptedSpendings = spendings.map((spending) => ({
      ...spending,
      amount: Number(decrypt(spending.amount, encryptionKey)),
      description: decrypt(spending.description, encryptionKey),
      message: decrypt(spending.message, encryptionKey)
    }));

    // Apply filters after decryption
    let filteredSpendings = decryptedSpendings;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredSpendings = filteredSpendings.filter(
        (spending) =>
          spending.description.toLowerCase().includes(query) ||
          spending.message.toLowerCase().includes(query)
      );
    }

    if (amountFrom !== undefined) {
      filteredSpendings = filteredSpendings.filter(
        (spending) => spending.amount >= amountFrom
      );
    }

    if (amountTo !== undefined) {
      filteredSpendings = filteredSpendings.filter(
        (spending) => spending.amount <= amountTo
      );
    }

    return filteredSpendings
      .map(
        (spending) =>
          `Monto: ${spending.amount}, Descripción: ${
            spending.description
          }, Código de Moneda: ${spending.currency_code}, Categoría: ${
            spending.category.name
          }, Key de Categoría: ${spending.category.key}, Cuenta de Origen: ${
            spending.from ? spending.from.name : 'N/A'
          }, Fecha de Creación: ${dayjs(spending.created_at)
            .tz(spending.contact.favorite_timezone)
            ?.format('DD/MM/YYYY HH:mm')}`
      )
      .join('\n');
  } catch (error: any) {
    handleError({
      error,
      userId: params.userPhoneNumber,
      endpoint: 'tool.findSpendings',
      message:
        `*Parameters:* ${JSON.stringify(params)} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al buscar los gastos.';
  }
};

export const findIncomes = async (params: {
  userPhoneNumber: string;
  currencyCode: string;
  categoryKeys?: string[];
  searchQuery?: string;
  amountFrom?: number;
  amountTo?: number;
  dateFrom: string; // ISO date
  dateTo: string; // ISO date
  encryptionKey: Uint8Array;
}) => {
  try {
    const {
      userPhoneNumber,
      categoryKeys,
      currencyCode,
      dateFrom,
      dateTo,
      amountFrom,
      amountTo,
      searchQuery,
      encryptionKey
    } = params;

    let mappedCategoryIds: string[] | undefined = undefined;

    if (categoryKeys && categoryKeys.length > 0) {
      const userCategories = await prisma.income_category.findMany({
        where: {
          contact: {
            phone_number: userPhoneNumber
          }
        }
      });

      mappedCategoryIds = categoryKeys
        ?.map((key) => {
          const category = userCategories.find(
            (category) => category.key.toLowerCase() === key.toLowerCase()
          );

          return category?.id;
        })
        .filter(Boolean) as string[] | undefined;
    }

    const incomes = await prisma.income.findMany({
      where: {
        contact: {
          phone_number: userPhoneNumber
        },
        category: categoryKeys
          ? {
              id: {
                in: mappedCategoryIds
              }
            }
          : undefined,
        currency_code: currencyCode,
        created_at: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo)
        }
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
            name: true,
            key: true
          }
        },
        contact: {
          select: {
            favorite_locale: true,
            favorite_timezone: true
          }
        }
      }
    });

    const dayjs = DayjsSingleton.getInstance(
      incomes[0]?.contact?.favorite_locale ?? 'es-PE'
    );

    // Decrypt the data
    const decryptedIncomes = incomes.map((income) => ({
      ...income,
      amount: Number(decrypt(income.amount, encryptionKey)),
      description: decrypt(income.description, encryptionKey),
      message: decrypt(income.message, encryptionKey)
    }));

    // Apply filters after decryption
    let filteredIncomes = decryptedIncomes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredIncomes = filteredIncomes.filter(
        (income) =>
          income.description.toLowerCase().includes(query) ||
          income.message.toLowerCase().includes(query)
      );
    }

    if (amountFrom !== undefined) {
      filteredIncomes = filteredIncomes.filter(
        (income) => income.amount >= amountFrom
      );
    }

    if (amountTo !== undefined) {
      filteredIncomes = filteredIncomes.filter(
        (income) => income.amount <= amountTo
      );
    }

    return filteredIncomes
      .map(
        (income) =>
          `Monto: ${income.amount}, Descripción: ${
            income.description
          }, Código de Moneda: ${income.currency_code}, Categoría: ${
            income.category ? income.category.name : 'N/A'
          }, Key de Categoría: ${
            income.category ? income.category.key : 'N/A'
          }, Cuenta de Destino: ${
            income.to ? income.to.name : 'N/A'
          }, Fecha de Creación: ${dayjs(income.created_at)
            .tz(income.contact.favorite_timezone)
            ?.format('DD/MM/YYYY HH:mm')}`
      )
      .join('\n');
  } catch (error: any) {
    handleError({
      error,
      userId: params.userPhoneNumber,
      endpoint: 'tool.findIncomes',
      message:
        `*Parameters:* ${JSON.stringify(params)} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al buscar los ingresos.';
  }
};

export const findTransfers = async (params: {
  userPhoneNumber: string;
  fromAccountKey?: string;
  toAccountKey?: string;
  amountFrom?: number;
  amountTo?: number;
  dateFrom: string; // ISO date
  dateTo: string; // ISO date
  encryptionKey: Uint8Array;
}) => {
  try {
    const {
      userPhoneNumber,
      fromAccountKey,
      toAccountKey,
      dateFrom,
      dateTo,
      amountFrom,
      amountTo,
      encryptionKey
    } = params;

    if (!fromAccountKey && !toAccountKey) {
      return `Debes proporcionar al menos un Key de cuenta de origen o destino.`;
    }

    const userAccounts = await prisma.accounts.findMany({
      where: {
        contact: {
          phone_number: userPhoneNumber
        }
      }
    });

    let fromAccountId: string | undefined = undefined;

    if (fromAccountKey) {
      const fromAccount = userAccounts.find(
        (account) => account.key.toLowerCase() === fromAccountKey.toLowerCase()
      );

      if (!fromAccount) {
        return `No se encontró la cuenta con Key ${fromAccountKey} para el usuario ${userPhoneNumber}`;
      }

      fromAccountId = fromAccount.id;
    }

    let toAccountId: string | undefined = undefined;

    if (toAccountKey) {
      const toAccount = userAccounts.find(
        (account) => account.key.toLowerCase() === toAccountKey.toLowerCase()
      );

      if (!toAccount) {
        return `No se encontró la cuenta con Key ${toAccountKey} para el usuario ${userPhoneNumber}`;
      }

      toAccountId = toAccount.id;
    }

    const transfers = await prisma.transfer.findMany({
      where: {
        contact: {
          phone_number: userPhoneNumber
        },
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        created_at: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo)
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
      }
    });

    // Decrypt the data
    const decryptedTransfers = transfers.map((transfer) => ({
      ...transfer,
      amount: Number(decrypt(transfer.amount, encryptionKey)),
      description: decrypt(transfer.description, encryptionKey),
      message: decrypt(transfer.message, encryptionKey)
    }));

    // Apply filters after decryption
    let filteredTransfers = decryptedTransfers;

    if (amountFrom !== undefined) {
      filteredTransfers = filteredTransfers.filter(
        (transfer) => transfer.amount >= amountFrom
      );
    }

    if (amountTo !== undefined) {
      filteredTransfers = filteredTransfers.filter(
        (transfer) => transfer.amount <= amountTo
      );
    }

    return filteredTransfers
      .map(
        (transfer) =>
          `ID: ${transfer.id}, Monto: ${transfer.amount}, Descripción: ${
            transfer.description
          }, Mensaje: ${transfer.message}, Cuenta de Origen: ${
            transfer.from ? transfer.from.name : 'N/A'
          }, Cuenta de Destino: ${
            transfer.to ? transfer.to.name : 'N/A'
          }, Fecha de Creación: ${transfer.created_at}`
      )
      .join('\n');
  } catch (error: any) {
    handleError({
      error,
      userId: params.userPhoneNumber,
      endpoint: 'tool.findTransfers',
      message:
        `*Parameters:* ${JSON.stringify(params)} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al buscar las transferencias.';
  }
};

export const getCustomerBillingPortalLink = async (params: {
  phoneNumber: string;
}) => {
  try {
    const { phoneNumber } = params;

    const customer = await prisma.contact.findUnique({
      where: {
        phone_number: phoneNumber
      },
      include: {
        subscription: true
      }
    });

    if (!customer) {
      return 'No se encontró el cliente con el número de teléfono proporcionado.';
    }

    if (!customer.subscription) {
      return 'El cliente no tiene una suscripción activa.';
    }

    const subscription = await lemon.get(
      `/v1/subscriptions/${customer.subscription.subscription_id}`
    );

    if (!subscription.data) {
      return 'Ocurrió un error al obtener el link del portal de pagos. Es necesario contactar al equipo de soporte.';
    }

    return subscription.data.data.attributes.urls.customer_portal;
  } catch (error: any) {
    handleError({
      error,
      userId: params.phoneNumber,
      endpoint: 'tool.getCustomerBillingPortalLink',
      message:
        `*Parameters:* ${JSON.stringify(params)} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al obtener el link del portal de pagos. Es necesario contactar al equipo de soporte.';
  }
};

export const getCheckoutPaymentLink = async (params: {
  phoneNumber: string;
}) => {
  try {
    const { phoneNumber } = params;

    const customer = await prisma.contact.findUnique({
      where: {
        phone_number: phoneNumber
      }
    });

    // notificar a soporte que el usuario quiere iniciar su periodo de prueba
    await sendTemplate({
      to: env.WHATSAPP_ADMIN_NUMBER,
      templateName: 'admin_soporte_feedback_notificacion',
      params: [
        phoneNumber,
        'El usuario recibió el link de pago para iniciar su periodo de prueba.'
      ]
    });

    mixpanelServer.track('checkout_payment_link_requested', {
      distinct_id: phoneNumber,
      fecha_hora: new Date(),
      canal: 'whatsapp',
      mp_country_code: customer?.country_code ?? '',
      country_code: customer?.country_code ?? ''
    });

    return `${customCheckoutLink}?user=${phoneNumber}&cc=${
      customer?.country_code ?? ''
    }`;
  } catch (error: any) {
    handleError({
      error,
      userId: params.phoneNumber,
      endpoint: 'tool.getCheckoutPaymentLink',
      message:
        `*Parameters:* ${JSON.stringify(params)} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al obtener el link de pago. Es necesario contactar al equipo de soporte.';
  }
};

export const createTransactionTags = async (params: {
  phoneNumber: string;
  tags: string[];
}) => {
  const { phoneNumber, tags } = params;

  try {
    // Validate maximum number of tags
    if (tags.length > 5) {
      return 'No se pueden crear más de 5 etiquetas a la vez.';
    }

    const user = await prisma.contact.findUnique({
      where: {
        phone_number: phoneNumber
      }
    });

    if (!user) {
      return 'No se encontró el usuario con el número de teléfono proporcionado.';
    }

    // Get existing tags to check for duplicates
    const existingTags = await prisma.transaction_tag.findMany({
      where: {
        contact_id: user.id
      },
      select: {
        name: true
      }
    });
    const existingTagNames = existingTags.map((tag) => tag.name.toLowerCase());

    // Process and validate tags
    const processedTags = new Map<
      string,
      {
        original: string;
        status: 'valid' | 'invalid' | 'duplicate';
        reason?: string;
      }
    >();

    // First pass: process and validate each tag
    for (const tag of tags) {
      const processed = tag
        .toLowerCase()
        .replace(/[\s-]+/g, '_') // Replace spaces and hyphens with underscore
        .trim();

      // Check minimum length
      if (processed.length < 2) {
        processedTags.set(tag, {
          original: tag,
          status: 'invalid',
          reason: 'debe tener al menos 2 caracteres'
        });
        continue;
      }

      // Check for invalid characters (only letters, accented letters, and underscores allowed)
      if (!/^[a-záéíóúüñà-ÿ_]+$/i.test(processed)) {
        processedTags.set(tag, {
          original: tag,
          status: 'invalid',
          reason: 'solo puede contener letras y guiones bajos'
        });
        continue;
      }

      // Check for duplicates in input array
      if (
        Array.from(processedTags.values()).some(
          (t) => t.status === 'valid' && t.original.toLowerCase() === processed
        )
      ) {
        processedTags.set(tag, {
          original: tag,
          status: 'duplicate',
          reason: 'es duplicada en el array de entrada'
        });
        continue;
      }

      // Check for duplicates in database
      if (existingTagNames.includes(processed)) {
        processedTags.set(tag, {
          original: tag,
          status: 'duplicate',
          reason: 'ya existe en la base de datos'
        });
        continue;
      }

      processedTags.set(tag, {
        original: tag,
        status: 'valid'
      });
    }

    // Create valid tags
    const validTags = Array.from(processedTags.values())
      .filter((t) => t.status === 'valid')
      .map((t) => ({
        name: t.original
          .toLowerCase()
          .replace(/[\s-]+/g, '_')
          .trim()
      }));

    if (validTags.length > 0) {
      await prisma.transaction_tag.createMany({
        data: validTags.map((t) => ({
          name: t.name,
          contact_id: user.id
        }))
      });
    }

    // Prepare response message
    const created = validTags.map((t) => t.name);
    const duplicates = Array.from(processedTags.values())
      .filter((t) => t.status === 'duplicate')
      .map((t) => ({ tag: t.original, reason: t.reason }));
    const rejected = Array.from(processedTags.values())
      .filter((t) => t.status === 'invalid')
      .map((t) => ({ tag: t.original, reason: t.reason }));

    // Build formatted message
    const messageParts = [];

    if (created.length > 0) {
      messageParts.push(
        created.length === 1
          ? `La etiqueta "${created[0]}" fue creada`
          : `Las etiquetas ${created
              .map((t) => `"${t}"`)
              .join(', ')} fueron creadas`
      );
    }

    if (duplicates.length > 0) {
      messageParts.push(
        duplicates.length === 1
          ? `La etiqueta "${duplicates[0].tag}" es duplicada (${duplicates[0].reason})`
          : `Las etiquetas ${duplicates
              .map((d) => `"${d.tag}"`)
              .join(', ')} son duplicadas (${duplicates[0].reason})`
      );
    }

    if (rejected.length > 0) {
      messageParts.push(
        rejected.length === 1
          ? `La etiqueta "${rejected[0].tag}" fue rechazada (${rejected[0].reason})`
          : `Las etiquetas ${rejected
              .map((r) => `"${r.tag}"`)
              .join(', ')} fueron rechazadas (${rejected[0].reason})`
      );
    }

    /* details: {
        created: created.length > 0 ? created : [],
        duplicates: duplicates.length > 0 ? duplicates : [],
        rejected: rejected.length > 0 ? rejected : []
      } */

    return messageParts.join('\n');
  } catch (error: any) {
    handleError({
      error,
      userId: params.phoneNumber,
      endpoint: 'tool.createTransactionTags',
      message:
        `*Parameters:* ${JSON.stringify(params)} \n` +
        `*Error:* ${error.message} \n`
    });

    return 'Ocurrió un error al crear las etiquetas de transacción. Es necesario contactar al equipo de soporte.';
  }
};

export enum available_tools {
  getCustomerBillingPortalLink = 'getCustomerBillingPortalLink',
  getCheckoutPaymentLink = 'getCheckoutPaymentLink',
  validateRegisteredExpenses = 'validateRegisteredExpenses',
  callForCustomerSupport = 'callForCustomerSupport',
  saveUserFeedback = 'saveUserFeedback',
  saveUserProfileInsights = 'saveUserProfileInsights',
  registerExpenses = 'registerExpenses',
  registerExpensesFreePlan = 'registerExpensesFreePlan',
  registerIncomes = 'registerIncomes',
  transferMoneyBetweenAccounts = 'transferMoneyBetweenAccounts',
  createFinancialAccount = 'createFinancialAccount',
  createExpenseCategory = 'createExpenseCategory',
  createIncomeCategory = 'createIncomeCategory',
  setBudget = 'setBudget',
  setExpenseCategoryBudget = 'setExpenseCategoryBudget',
  getSpending = 'getSpending',
  getIncome = 'getIncome',
  getSavings = 'getSavings',
  getTransfers = 'getTransfers',
  getBudget = 'getBudget',
  getBudgetByCategory = 'getBudgetByCategory',
  getAccountBalance = 'getAccountBalance',
  findSpendings = 'findSpendings',
  findIncomes = 'findIncomes',
  findTransfers = 'findTransfers',
  createTransactionTags = 'createTransactionTags'
}

export const toolToFunction = {
  getCustomerBillingPortalLink: getCustomerBillingPortalLink,
  getCheckoutPaymentLink: getCheckoutPaymentLink,
  callForCustomerSupport: callForCustomerSupport,
  saveUserFeedback: saveUserFeedback,
  saveUserProfileInsights: saveUserProfileInsights,
  registerExpenses: registerExpenses,
  registerExpensesFreePlan: registerExpensesFreePlan,
  registerIncomes: registerIncomes,
  transferMoneyBetweenAccounts: transferMoneyBetweenAccounts,
  createFinancialAccount: createFinancialAccount,
  createExpenseCategory: createExpenseCategory,
  createIncomeCategory: createIncomeCategory,
  setBudget: setBudget,
  setExpenseCategoryBudget: setExpenseCategoryBudget,
  getSpending: getSpending,
  getIncome: getIncome,
  getSavings: getSavings,
  getTransfers: getTransfers,
  getBudget: getBudget,
  getBudgetByCategory: getBudgetByCategory,
  getAccountBalance: getAccountBalance,
  findSpendings: findSpendings,
  findIncomes: findIncomes,
  findTransfers: findTransfers,
  createTransactionTags: createTransactionTags
};

export const tools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: available_tools.callForCustomerSupport,
      description:
        'Enviar mensaje a Slack para que un agente de soporte se comunique con el cliente, cuando se ejecuta la función el AI chatbot se desactiva. El horario de atención es de lunes a viernes de 9:00 a.m.- 6:00 p.m. MX',
      parameters: {
        type: 'object',
        properties: {
          phoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          },
          context: {
            type: 'string',
            description: 'Información adicional para el agente de soporte.'
          }
        },
        required: ['phoneNumber']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.saveUserFeedback,
      description:
        'Guardar la retroalimentación u opinión del usuario sobre su experiencia con Holacasa(proceso, chatbot, etc).',
      parameters: {
        type: 'object',
        properties: {
          feedback: {
            type: 'string',
            description: 'Retroalimentación del usuario.'
          },
          phoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          }
        },
        required: ['feedback', 'phoneNumber']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.saveUserProfileInsights,
      description:
        'Guardar información sobre lo que se descubrió haciendo el mom test al usuario, útil para mejorar la experiencia del usuario.',
      parameters: {
        type: 'object',
        properties: {
          insights: {
            type: 'string',
            description:
              'Información sobre lo que se descubrió haciendo el mom test al usuario.'
          },
          phoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          }
        },
        required: ['insights', 'phoneNumber']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.getCustomerBillingPortalLink,
      description:
        'Obtener el link del portal de pagos de la suscripción del cliente.',
      parameters: {
        type: 'object',
        properties: {
          phoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          }
        },
        required: ['phoneNumber']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.getCheckoutPaymentLink,
      description:
        'Obtener el link de pago para que el cliente pueda iniciar su suscripción.',
      parameters: {
        type: 'object',
        properties: {
          phoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          }
        },
        required: ['phoneNumber']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.registerExpenses,
      description:
        'Registrar gastos del usuario y actualizar el saldo de la cuenta en la que se realizó el gasto.',
      parameters: {
        type: 'object',
        properties: {
          userPhoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          },
          expenses: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                amount: {
                  type: 'number',
                  description: 'Monto del gasto.'
                },
                categoryKey: {
                  type: 'string',
                  description:
                    'Key facilmente identificable de la categoría de gasto, por ejemplo ALIMENTACION.'
                },
                description: {
                  type: 'string',
                  description: 'Descripción del gasto interpretado por la AI'
                },
                message: {
                  type: 'string',
                  description:
                    'Mensaje que envió el usuario al realizar el gasto.'
                },
                currencyCode: {
                  type: 'string',
                  description: 'Código de la moneda del gasto.'
                },
                fromAccountKey: {
                  type: 'string',
                  description:
                    'Key facilmente identificable de la cuenta financiera, por ejemplo BANCO_INTERBANK'
                },
                createdAt: {
                  type: 'string',
                  description:
                    'Fecha de creación del gasto. SOLO debe proporcionarse cuando el usuario menciona explícitamente una fecha u hora. Si el usuario no menciona fecha u hora, NO incluir este campo y la función usará la fecha y hora actual.'
                }
              },
              required: [
                'amount',
                'categoryKey',
                'description',
                'message',
                'currencyCode',
                'fromAccountKey'
              ]
            }
          }
        },
        required: ['userPhoneNumber', 'expenses']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.registerExpensesFreePlan,
      description:
        'Registrar gastos del usuario y actualizar el saldo de la cuenta en la que se realizó el gasto y se hace la validación de los 10 gastos permitidos en el plan gratuito.',
      parameters: {
        type: 'object',
        properties: {
          userPhoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          },
          expenses: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                amount: {
                  type: 'number',
                  description: 'Monto del gasto.'
                },
                categoryKey: {
                  type: 'string',
                  description:
                    'Key facilmente identificable de la categoría de gasto, por ejemplo ALIMENTACION.'
                },
                description: {
                  type: 'string',
                  description: 'Descripción del gasto interpretado por la AI'
                },
                message: {
                  type: 'string',
                  description:
                    'Mensaje que envió el usuario al realizar el gasto.'
                },
                currencyCode: {
                  type: 'string',
                  description: 'Código de la moneda del gasto.'
                },
                fromAccountKey: {
                  type: 'string',
                  description:
                    'Key facilmente identificable de la cuenta financiera, por ejemplo BANCO_INTERBANK'
                },
                createdAt: {
                  type: 'string',
                  description:
                    'Fecha de creación del gasto. SOLO debe proporcionarse cuando el usuario menciona explícitamente una fecha u hora. Si el usuario no menciona fecha u hora, NO incluir este campo y la función usará la fecha y hora actual.'
                }
              },
              required: [
                'amount',
                'categoryKey',
                'description',
                'message',
                'currencyCode',
                'fromAccountKey'
              ]
            }
          }
        },
        required: ['userPhoneNumber', 'expenses']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.registerIncomes,
      description:
        'Registrar ingresos del usuario y actualizar el saldo de la cuenta en la que se realizó el ingreso.',
      parameters: {
        type: 'object',
        properties: {
          userPhoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          },
          incomes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                amount: {
                  type: 'number',
                  description: 'Monto del ingreso.'
                },
                categoryKey: {
                  type: 'string',
                  description:
                    'Key facilmente identificable de la categoría de ingreso, por ejemplo SALARIO.'
                },
                description: {
                  type: 'string',
                  description: 'Descripción del ingreso interpretado por la AI'
                },
                message: {
                  type: 'string',
                  description: 'Mensaje del ingreso enviado por el usuario.'
                },
                currencyCode: {
                  type: 'string',
                  description:
                    'Código de la moneda del ingreso. Tomar por defecto el currency code preferido del usuario. A menos que se especifique otra moneda.'
                },
                toAccountKey: {
                  type: 'string',
                  description:
                    'Key facilmente identificable de la cuenta financiera, por ejemplo BANCO_INTERBANK'
                },
                createdAt: {
                  type: 'string',
                  description:
                    'Fecha de creación del ingreso. SOLO debe proporcionarse cuando el usuario menciona explícitamente una fecha u hora. Si el usuario no menciona fecha u hora, NO incluir este campo y la función usará la fecha y hora actual.'
                }
              },
              required: [
                'amount',
                'categoryKey',
                'description',
                'message',
                'currencyCode',
                'toAccountKey'
              ]
            }
          }
        },
        required: ['userPhoneNumber', 'incomes']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.transferMoneyBetweenAccounts,
      description:
        'Transferir dinero entre cuentas financieras del usuario y actualizar el saldo de las cuentas. Solo se puede transferir dinero entre cuentas de la misma moneda.',
      parameters: {
        type: 'object',
        properties: {
          userPhoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          },
          transfers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                amount: {
                  type: 'number',
                  description: 'Monto de la transferencia.'
                },
                description: {
                  type: 'string',
                  description:
                    'Descripción de la transferencia interpretada por la AI.'
                },
                message: {
                  type: 'string',
                  description:
                    'Mensaje de la transferencia enviado por el usuario.'
                },
                fromAccountKey: {
                  type: 'string',
                  description:
                    'Key facilmente identificable de la cuenta de origen de la transferencia. Por ejemplo BANCO_INTERBANK.'
                },
                toAccountKey: {
                  type: 'string',
                  description:
                    'Key facilmente identificable de la cuenta de destino de la transferencia. Por ejemplo BANCO_BCP.'
                },
                createdAt: {
                  type: 'string',
                  description:
                    'Fecha de creación de la transferencia. SOLO debe proporcionarse cuando el usuario menciona explícitamente una fecha u hora. Si el usuario no menciona fecha u hora, NO incluir este campo y la función usará la fecha y hora actual.'
                }
              },
              required: [
                'amount',
                'description',
                'message',
                'fromAccountKey',
                'toAccountKey'
              ]
            }
          }
        },
        required: ['userPhoneNumber', 'transfers']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.createFinancialAccount,
      description: 'Crear una cuenta financiera para el usuario.',
      parameters: {
        type: 'object',
        properties: {
          userPhoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          },
          accountType: {
            type: 'string',
            enum: ['REGULAR', 'SAVINGS', 'DEBT'],
            description: 'Tipo de cuenta financiera.'
          },
          name: {
            type: 'string',
            description: 'Nombre de la cuenta financiera.'
          },
          key: {
            type: 'string',
            description:
              'Identificador fácil de la cuenta financiera en formato uppercase_underscore, por ejemplo BANCO_INTERBANK.'
          },
          balance: {
            type: 'number',
            description: 'Saldo inicial de la cuenta financiera.'
          },
          currencyCode: {
            type: 'string',
            description: 'Código de la moneda de la cuenta financiera.'
          },
          description: {
            type: 'string',
            description: 'Descripción de la cuenta financiera.'
          }
        },
        required: [
          'userPhoneNumber',
          'accountType',
          'name',
          'key',
          'balance',
          'currencyCode'
        ]
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.createExpenseCategory,
      description: 'Crear una categoría de gasto para el usuario.',
      parameters: {
        type: 'object',
        properties: {
          userPhoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          },
          name: {
            type: 'string',
            description: 'Nombre de la categoría de gasto.'
          },
          key: {
            type: 'string',
            description:
              'Identificador fácil de la categoría de gasto en formato uppercase_underscore, por ejemplo ALIMENTACION.'
          },
          description: {
            type: 'string',
            description:
              'Descripción de la categoría de gasto. Esto ayuda a la AI saber clasificar los gastos.'
          }
        },
        required: ['userPhoneNumber', 'name', 'key']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.createIncomeCategory,
      description: 'Crear una categoría de ingreso para el usuario.',
      parameters: {
        type: 'object',
        properties: {
          userPhoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          },
          name: {
            type: 'string',
            description: 'Nombre de la categoría de ingreso.'
          },
          key: {
            type: 'string',
            description:
              'Identificador fácil de la categoría de ingreso en formato uppercase_underscore, por ejemplo SALARIO.'
          },
          description: {
            type: 'string',
            description: 'Descripción de la categoría de ingreso.'
          }
        },
        required: ['userPhoneNumber', 'name', 'key']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.setBudget,
      description:
        'Establecer el presupuesto para el usuario. Puede ser presupuesto para todo un año o para un mes y año específico.',
      parameters: {
        type: 'object',
        properties: {
          phoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          },
          amount: {
            type: 'number',
            description: 'Monto del presupuesto.'
          },
          year: {
            type: 'number',
            description: 'Año del presupuesto.'
          },
          currencyCode: {
            type: 'string',
            description: 'Código de la moneda del presupuesto.'
          },
          month: {
            type: 'number',
            description: 'Mes del presupuesto. 0 es Enero y 11 es Diciembre.'
          }
        },
        required: ['phoneNumber', 'amount', 'year', 'month', 'currencyCode']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.setExpenseCategoryBudget,
      description:
        'Establecer el presupuesto para una categoría de gasto del usuario. Puede ser presupuesto para todo un año o para un mes y año específico.',
      parameters: {
        type: 'object',
        properties: {
          phoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          },
          categoryKey: {
            type: 'string',
            description:
              'Key facilmente identificable de la categoría de gasto, por ejemplo ALIMENTACION.'
          },
          amount: {
            type: 'number',
            description: 'Monto del presupuesto.'
          },
          year: {
            type: 'number',
            description: 'Año del presupuesto.'
          },
          currencyCode: {
            type: 'string',
            description: 'Código de la moneda del presupuesto.'
          },
          month: {
            type: 'number',
            description: 'Mes del presupuesto. 0 es Enero y 11 es Diciembre.'
          }
        },
        required: [
          'phoneNumber',
          'categoryKey',
          'amount',
          'year',
          'month',
          'currencyCode'
        ]
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.getSpending,
      description:
        'Sumar el total de gastos del usuario para un rango de fechas, en una moneda específica. Se puede filtrar por categoría. Por defecto toma los últimos 30 días.',
      parameters: {
        type: 'object',
        properties: {
          categoryKey: {
            type: 'string',
            description:
              'Key facilmente identificable de la categoría de gasto. ejemplo ALIMENTACION.'
          },
          currencyCode: {
            type: 'string',
            description: 'Código de la moneda de los gastos.'
          },
          dateFrom: {
            type: 'string',
            description:
              'Fecha de inicio a tomar en cuenta para los gastos. ISO date por ejemplo 2023-10-05T14:48:00.000Z.'
          },
          dateTo: {
            type: 'string',
            description:
              'Fecha de fin a tomar en cuenta para los gastos en ISO date, por ejemplo 2023-10-05T14:48:00.000Z'
          }
        },
        required: ['currencyCode', 'dateFrom', 'dateTo']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.getIncome,
      description:
        'Sumar el total de ingresos del usuario para un rango de fechas, en una moneda específica. Se puede filtrar por categoría. Por defecto toma los últimos 30 días.',
      parameters: {
        type: 'object',
        properties: {
          userPhoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          },
          categoryKey: {
            type: 'string',
            description:
              'Key facilmente identificable de la categoría de ingreso. ejemplo SALARIO.'
          },
          currencyCode: {
            type: 'string',
            description: 'Código de la moneda de los ingresos.'
          },
          dateFrom: {
            type: 'string',
            description:
              'Fecha de inicio para calcular los ingresos. ISO date por ejemplo 2023-10-05T14:48:00.000Z. Por defecto toma los últimos 30 días.'
          },
          dateTo: {
            type: 'string',
            description:
              'Fecha de fin para calcular los ingresos. ISO date por ejemplo 2023-10-05T14:48:00.000Z. Por defecto toma los últimos 30 días.'
          }
        },
        required: ['currencyCode', 'dateFrom', 'dateTo']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.getSavings,
      description:
        'Obtener la suma de ahorros del usuario en un rango de fechas.',
      parameters: {
        type: 'object',
        properties: {
          phoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          },
          savingsAccountsKeys: {
            type: 'array',
            items: {
              type: 'string'
            },
            description:
              'Keys facilmente identificables de las cuentas de ahorro, por ejemplo AHORRO_BCP.'
          }
        },
        required: ['phoneNumber', 'savingsAccountsKeys']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.getTransfers,
      description:
        'Obtener la suma de transferencias del usuario entre 2 cuentas y en un rango de fechas.',
      parameters: {
        type: 'object',
        properties: {
          userPhoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          },
          fromAccountKey: {
            type: 'string',
            description:
              'Key facilmente identificable de la cuenta de origen. ejemplo BANCO_INTERBANK.'
          },
          toAccountKey: {
            type: 'string',
            description:
              'Key facilmente identificable de la cuenta de destino. ejemplo BANCO_BCP.'
          },
          amountFrom: {
            type: 'number',
            description: 'Monto mínimo de las transferencias.'
          },
          amountTo: {
            type: 'number',
            description: 'Monto máximo de las transferencias.'
          },
          dateFrom: {
            type: 'string',
            description:
              'Fecha de inicio para sumar las transferencias, ISO date por ejemplo 2023-10-05T14:48:00.000Z'
          },
          dateTo: {
            type: 'string',
            description:
              'Fecha de fin para sumar las transferencias, ISO date por ejemplo 2023-10-05T14:48:00.000Z'
          }
        },
        required: ['userPhoneNumber', 'dateFrom', 'dateTo']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.getBudget,
      description: 'Obtener el presupuesto del usuario.',
      parameters: {
        type: 'object',
        properties: {
          phoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          },
          currencyCode: {
            type: 'string',
            description:
              'Código de la moneda del presupuesto, por defecto el currency code preferido del usuario.'
          },
          year: {
            type: 'number',
            description: 'Año del presupuesto.'
          },
          month: {
            type: 'number',
            description: 'Mes del presupuesto.'
          }
        },
        required: ['phoneNumber', 'currencyCode', 'year', 'month']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.getBudgetByCategory,
      description:
        'Obtener el presupuesto de una categoría de gasto del usuario.',
      parameters: {
        type: 'object',
        properties: {
          phoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          },
          categoryKey: {
            type: 'string',
            description:
              'Key facilmente identificable de la categoría de gasto. ejemplo ALIMENTACION.'
          },
          currencyCode: {
            type: 'string',
            description: 'Código de la moneda del presupuesto.'
          },
          year: {
            type: 'number',
            description: 'Año del presupuesto.'
          },
          month: {
            type: 'number',
            description: 'Mes del presupuesto.'
          }
        },
        required: [
          'phoneNumber',
          'categoryKey',
          'currencyCode',
          'year',
          'month'
        ]
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.getAccountBalance,
      description: 'Obtener el saldo de una cuenta financiera del usuario.',
      parameters: {
        type: 'object',
        properties: {
          userPhoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          },
          accountKey: {
            type: 'string',
            description:
              'Key facilmente identificable de la cuenta financiera. ejemplo BANCO_INTERBANK.'
          },
          encryptionKey: {
            type: 'Uint8Array',
            description: 'Llave de encriptación para desencriptar los montos.'
          }
        },
        required: ['userPhoneNumber', 'accountKey', 'encryptionKey']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.findSpendings,
      description:
        'Buscar gastos del usuario, se puede filtrar por: categoría, texto, monto, fecha en una moneda específica. Por defecto toma los últimos 30 días.',
      parameters: {
        type: 'object',
        properties: {
          userPhoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          },
          currencyCode: {
            type: 'string',
            description:
              'Código de la moneda de los gastos, por defecto el currency code preferido del usuario.'
          },
          categoryKeys: {
            type: 'array',
            items: {
              type: 'string'
            },
            description:
              'Keys facilmente identificables de las categorías de gasto. ejemplo ALIMENTACION.'
          },
          searchQuery: {
            type: 'string',
            description: 'Consulta de búsqueda.'
          },
          amountFrom: {
            type: 'number',
            description: 'Monto mínimo de los gastos.'
          },
          amountTo: {
            type: 'number',
            description: 'Monto máximo de los gastos.'
          },
          dateFrom: {
            type: 'string',
            description: 'Fecha de inicio para buscar los gastos.'
          },
          dateTo: {
            type: 'string',
            description: 'Fecha de fin para buscar los gastos.'
          }
        },
        required: ['currencyCode', 'dateFrom', 'dateTo']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.findIncomes,
      description:
        'Buscar ingresos del usuario, se puede filtrar por: categoría, texto, monto, fecha en una moneda específica. Por defecto toma los últimos 30 días.',
      parameters: {
        type: 'object',
        properties: {
          userPhoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          },
          currencyCode: {
            type: 'string',
            description: 'Código de la moneda de los ingresos.'
          },
          categoryKeys: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Keys de las categorías de ingreso. ejemplo SALARIO.'
          },
          searchQuery: {
            type: 'string',
            description: 'Consulta de búsqueda.'
          },
          amountFrom: {
            type: 'number',
            description: 'Monto mínimo de los ingresos.'
          },
          amountTo: {
            type: 'number',
            description: 'Monto máximo de los ingresos.'
          },
          dateFrom: {
            type: 'string',
            description: 'Fecha de inicio para buscar los ingresos.'
          },
          dateTo: {
            type: 'string',
            description: 'Fecha de fin para buscar los ingresos.'
          }
        },
        required: ['currencyCode', 'dateFrom', 'dateTo']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.findTransfers,
      description:
        'Buscar transferencias entre cuentas del usuario. Puede proporcionar el ID de la cuenta de origen o destino. Si se proporciona ambos se buscan las transferencias entre esas cuentas.',
      parameters: {
        type: 'object',
        properties: {
          userPhoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          },
          fromAccountKey: {
            type: 'string',
            description:
              'Key facilmente identificable de la cuenta de origen. ejemplo BANCO_INTERBANK.'
          },
          toAccountKey: {
            type: 'string',
            description:
              'Key facilmente identificable de la cuenta de destino. ejemplo BANCO_BCP.'
          },
          amountFrom: {
            type: 'number',
            description: 'Monto mínimo de las transferencias.'
          },
          amountTo: {
            type: 'number',
            description: 'Monto máximo de las transferencias.'
          },
          dateFrom: {
            type: 'string',
            description: 'Fecha de inicio para buscar las transferencias.'
          },
          dateTo: {
            type: 'string',
            description: 'Fecha de fin para buscar las transferencias.'
          }
        },
        required: ['userPhoneNumber', 'dateFrom', 'dateTo']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: available_tools.createTransactionTags,
      description: 'Crear etiquetas de transacción para el usuario.',
      parameters: {
        type: 'object',
        properties: {
          userPhoneNumber: {
            type: 'string',
            description: 'Número de teléfono del cliente.'
          },
          tags: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Etiquetas de transacción a crear.'
          }
        },
        required: ['tags']
      }
    }
  }
];

/**
 * Helper function to sync expenses to all active Google Sheets connections
 */
async function syncExpensesToGoogleSheets(
  userPhoneNumber: string,
  expenses: expense[],
  encryptionKey: Uint8Array
) {
  try {
    // Get user's active Google Sheets connections
    const activeConnections = await prisma.google_sheets_connection.findMany({
      where: {
        contact: {
          phone_number: userPhoneNumber
        },
        status: 'active'
      },
      include: {
        contact: {
          select: {
            favorite_timezone: true,
            favorite_locale: true
          }
        }
      }
    });

    if (activeConnections.length === 0) {
      return; // No active connections
    }

    // Get category and account data for all expenses at once
    const categoryIds = [...new Set(expenses.map((e) => e.category_id))];
    const accountIds = [...new Set(expenses.map((e) => e.from_account_id))];

    const [categories, accounts] = await Promise.all([
      prisma.expense_category.findMany({
        where: { id: { in: categoryIds } }
      }),
      prisma.accounts.findMany({
        where: { id: { in: accountIds } }
      })
    ]);

    // Create lookup maps for better performance
    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const accountMap = new Map(accounts.map((a) => [a.id, a]));

    const contact = activeConnections[0].contact;
    const userTimezone = contact.favorite_timezone || 'UTC';
    const dayjs = DayjsSingleton.getInstance(
      contact.favorite_locale,
      userTimezone
    );

    // Prepare all expense data
    const expensesData = expenses
      .map((expense) => {
        // Decrypt expense data
        const decryptedAmount = parseFloat(
          decrypt(expense.amount, encryptionKey)
        );
        const decryptedDescription = decrypt(
          expense.description,
          encryptionKey
        );

        // Get category and account from maps
        const category = categoryMap.get(expense.category_id);
        const account = accountMap.get(expense.from_account_id);

        if (!category || !account) {
          return null; // Will be filtered out
        }

        // Format date based on user's timezone
        const expenseDate = dayjs(expense.created_at)
          .tz(userTimezone)
          .format('YYYY-MM-DD');

        return {
          date: expenseDate,
          amount: decryptedAmount,
          description: decryptedDescription,
          category: category.name
        };
      })
      .filter(Boolean); // Remove null entries

    if (expensesData.length === 0) {
      return; // No valid expenses to sync
    }

    // Sync to each active connection using batch processing
    const syncResults = await Promise.allSettled(
      activeConnections.map(async (connection) => {
        try {
          const result =
            await googleSheetsService.syncMultipleExpensesToConnection(
              connection.id,
              expensesData,
              encryptionKey
            );
          return {
            connectionId: connection.id,
            success: true,
            syncedCount: result.syncedCount
          };
        } catch (connectionError) {
          console.error(
            `Failed to sync to connection ${connection.id}:`,
            connectionError
          );
          return {
            connectionId: connection.id,
            success: false,
            error: connectionError
          };
        }
      })
    );

    // Log sync results
    syncResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const { connectionId, success, syncedCount } = result.value;
        if (success) {
          console.log(
            `Successfully synced ${syncedCount} expenses to connection ${connectionId}`
          );
        } else {
          console.error(
            `Failed to sync expenses to connection ${connectionId}`
          );
        }
      } else {
        console.error(
          `Sync promise rejected for connection ${activeConnections[index].id}:`,
          result.reason
        );
      }
    });
  } catch (error) {
    console.error('Error in syncExpensesToGoogleSheets:', error);
    throw error;
  }
}
