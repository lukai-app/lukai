import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { useSession } from '@/components/auth/ctx';
import { decrypt, decryptNumber, importKey } from '@/lib/encryption';

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

interface UseTransactionsParams {
  startDate: Date;
  endDate: Date;
  category?: string;
  type?: 'income' | 'expense';
  currency: string;
}

async function getTransactions(
  params: UseTransactionsParams & { token: string }
) {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/v1/transactions?` +
      new URLSearchParams({
        startDate: params.startDate.toISOString(),
        endDate: params.endDate.toISOString(),
        ...(params.category && { category: params.category }),
        ...(params.type && { type: params.type }),
        currency: params.currency,
      }),
    {
      headers: {
        Authorization: `Bearer ${params.token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }

  return response.json();
}

export function useTransactions(params: UseTransactionsParams) {
  const { session } = useSession();
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [transformedData, setTransformedData] = useState<Transaction[]>([]);
  const [isTransforming, setIsTransforming] = useState(false);

  // Fetch raw data
  const {
    data: rawData,
    isLoading: isRawLoading,
    error,
  } = useQuery<TransactionsResponse>({
    queryKey: ['transactions', params],
    queryFn: () => getTransactions({ ...params, token: session?.token ?? '' }),
    enabled: !!session?.token,
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
        ) => {
          const decryptedAmount = await decryptNumber(
            transaction.amount,
            cryptoKey
          );
          const decryptedDescription = transaction.description
            ? await decrypt(transaction.description, cryptoKey)
            : transaction.description;
          const decryptedMessage = transaction.message
            ? await decrypt(transaction.message, cryptoKey)
            : transaction.message;

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
        };

        const transformedIncomes = await Promise.all(
          rawData.incomes.map(transformTransaction)
        );
        const transformedExpenses = await Promise.all(
          rawData.expenses.map(transformTransaction)
        );

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
