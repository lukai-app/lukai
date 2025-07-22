'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { env } from '@/env';
import { importKey, decrypt, decryptNumber } from '@/lib/utils/encryption';
import { useSession } from '@/app/_components/session-provider';

interface BaseTransaction {
  id: string;
  amount: string;
  description?: string;
  message?: string;
  currency_code: string;
  created_at: string;
  updated_at: string;
  type: 'income' | 'expense';
  category: {
    id: string;
    key: string;
    name: string;
    color: string;
    image_id?: string;
  };
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  category_id: string;
  timestamp: string;
  date: Date;
  status: 'completed';
  description?: string;
  account: string;
  currency_code: string;
  tags: {
    id: string;
    name: string;
  }[];
  base_data: Income | Expense;
}

export interface Income extends BaseTransaction {
  type: 'income';
  to_account: {
    id: string;
    name: string;
    account_type: 'REGULAR' | 'SAVINGS' | 'DEBT';
    currency_code: string;
  };
}

export interface Expense extends BaseTransaction {
  type: 'expense';
  from_account: {
    id: string;
    name: string;
    account_type: 'REGULAR' | 'SAVINGS' | 'DEBT';
    currency_code: string;
  };
  tags: {
    id: string;
    name: string;
  }[];
}

export interface TransactionsResponse {
  expenses: Expense[];
  incomes: Income[];
}

interface GetTransactionsParams {
  startDate: Date;
  endDate: Date;
  category?: string;
  type?: 'income' | 'expense';
  currency: string;
  token: string;
}

const getTransactions = async (params: GetTransactionsParams) => {
  const searchParams = new URLSearchParams();
  if (params.startDate)
    searchParams.set('startDate', params.startDate.toISOString());
  if (params.endDate) searchParams.set('endDate', params.endDate.toISOString());
  if (params.category) searchParams.set('category', params.category);
  if (params.type) searchParams.set('type', params.type);
  searchParams.set('currency', params.currency);

  const response = await fetch(
    `${env.NEXT_PUBLIC_API_URL}/v1/transactions?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.NEXT_PUBLIC_API_KEY,
        Authorization: `Bearer ${params.token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }

  return response.json() as Promise<TransactionsResponse>;
};

export function useTransactions(params: {
  startDate: Date;
  endDate: Date;
  category?: string;
  type?: 'income' | 'expense';
  currency: string;
}) {
  const { session } = useSession();
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [transformedData, setTransformedData] = useState<Transaction[]>([]);
  const [isTransforming, setIsTransforming] = useState(false);

  const {
    data: rawData,
    isLoading: isRawLoading,
    error,
  } = useQuery<TransactionsResponse>({
    queryKey: ['transactions', params],
    queryFn: () => getTransactions({ ...params, token: session?.token ?? '' }),
    enabled: !!session,
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnMount: false,
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
        setTransformedData([]);
        return;
      }

      setIsTransforming(true);
      try {
        const transformTransaction = async (
          transaction:
            | (typeof rawData.incomes)[0]
            | (typeof rawData.expenses)[0]
        ): Promise<Transaction | null> => {
          try {
            console.log(
              `🔄 Processing transaction: ${transaction.id.slice(0, 8)} (${
                transaction.type
              })`
            );

            const decryptedAmount = await decryptNumber(
              transaction.amount,
              cryptoKey
            );

            // Handle potentially unencrypted description
            let decryptedDescription = transaction.description;
            if (transaction.description) {
              try {
                decryptedDescription = await decrypt(
                  transaction.description,
                  cryptoKey
                );
              } catch (decryptError) {
                console.warn(
                  `⚠️ Failed to decrypt description for transaction ${transaction.id.slice(
                    0,
                    8
                  )}, using as-is:`,
                  {
                    originalDescription: transaction.description,
                    error:
                      decryptError instanceof Error
                        ? decryptError.message
                        : String(decryptError),
                  }
                );
                // Keep the original description if decryption fails
                decryptedDescription = transaction.description;
              }
            }

            // Handle potentially unencrypted message
            let decryptedMessage = transaction.message;
            if (transaction.message) {
              try {
                decryptedMessage = await decrypt(
                  transaction.message,
                  cryptoKey
                );
              } catch (decryptError) {
                console.warn(
                  `⚠️ Failed to decrypt message for transaction ${transaction.id.slice(
                    0,
                    8
                  )}, using as-is:`,
                  {
                    originalMessage: transaction.message,
                    error:
                      decryptError instanceof Error
                        ? decryptError.message
                        : String(decryptError),
                  }
                );
                // Keep the original message if decryption fails
                decryptedMessage = transaction.message;
              }
            }

            return {
              id: transaction.id,
              title:
                decryptedDescription ||
                (transaction.type === 'income' ? 'Ingreso' : 'Gasto'),
              amount: decryptedAmount ?? 0,
              type: transaction.type,
              category: transaction.category.name,
              category_id: transaction.category.id,
              timestamp: new Date(transaction.created_at).toLocaleString(),
              date: new Date(transaction.created_at),
              status: 'completed' as const,
              description: decryptedDescription,
              account:
                transaction.type === 'income'
                  ? (transaction as any).to_account.name
                  : (transaction as any).from_account.name,
              currency_code: transaction.currency_code,
              base_data: transaction,
              tags:
                transaction.type === 'income' ? ([] as any) : transaction.tags,
            } as Transaction;
          } catch (error) {
            console.error(`❌ Failed to transform transaction:`, {
              id: transaction.id,
              type: transaction.type,
              amount: transaction.amount,
              description: transaction.description,
              message: transaction.message,
              created_at: transaction.created_at,
              category: transaction.category,
              account:
                transaction.type === 'income'
                  ? (transaction as any).to_account
                  : (transaction as any).from_account,
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            });
            return null;
          }
        };

        // Use Promise.allSettled to handle individual failures gracefully
        const [incomeResults, expenseResults] = await Promise.all([
          Promise.allSettled(rawData.incomes.map(transformTransaction)),
          Promise.allSettled(rawData.expenses.map(transformTransaction)),
        ]);

        // Extract successful transformations and log any failures
        const transformedIncomes = incomeResults
          .filter(
            (result): result is PromiseFulfilledResult<Transaction | null> =>
              result.status === 'fulfilled' && result.value !== null
          )
          .map((result) => result.value as Transaction);

        const transformedExpenses = expenseResults
          .filter(
            (result): result is PromiseFulfilledResult<Transaction | null> =>
              result.status === 'fulfilled' && result.value !== null
          )
          .map((result) => result.value as Transaction);

        // Log any Promise.allSettled rejections (shouldn't happen with our current setup, but good to know)
        const failedIncomes = incomeResults.filter(
          (result) => result.status === 'rejected'
        );
        const failedExpenses = expenseResults.filter(
          (result) => result.status === 'rejected'
        );

        if (failedIncomes.length > 0) {
          console.error(
            `❌ ${failedIncomes.length} income transactions failed at Promise level:`,
            failedIncomes
          );
        }
        if (failedExpenses.length > 0) {
          console.error(
            `❌ ${failedExpenses.length} expense transactions failed at Promise level:`,
            failedExpenses
          );
        }

        setTransformedData(
          [...transformedIncomes, ...transformedExpenses].sort(
            (a, b) => b.date.getTime() - a.date.getTime()
          )
        );
      } catch (err) {
        console.error('Error transforming transactions:', err);
        setTransformedData([]);
      } finally {
        setIsTransforming(false);
      }
    };

    transformData();
  }, [rawData, cryptoKey]);

  return {
    data: transformedData,
    isLoading: isRawLoading || isTransforming || !cryptoKey,
    error,
  };
}
