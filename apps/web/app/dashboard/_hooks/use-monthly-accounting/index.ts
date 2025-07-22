import { useMemo, useState, useEffect } from 'react';
import { decryptNumber, decrypt } from '@/lib/utils/encryption';

import {
  useHistoricalAccounting,
  HistoricalAccountingData,
} from './use-historical-accounting';
import {
  useCurrentMonthAccounting,
  RawCurrentMonthData,
} from './use-current-month-accounting';
import { DecryptedAccountingData } from '../../(main-screens)/books/types';

export function useMonthlyAccounting({
  year,
  month,
  currency,
  cryptoKey,
}: {
  year: number;
  month: number;
  currency: string;
  cryptoKey: CryptoKey | null;
}) {
  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return year === now.getFullYear() && month === now.getMonth();
  }, [year, month]);

  // Use appropriate hook based on whether it's current month
  const currentMonth = useCurrentMonthAccounting({ currency });
  const historicalMonth = useHistoricalAccounting({ year, month, currency });

  const {
    data: rawData,
    isLoading: isRawLoading,
    error,
  } = isCurrentMonth ? currentMonth : historicalMonth;

  // State for transformed data
  const [transformedData, setTransformedData] =
    useState<DecryptedAccountingData | null>(null);
  const [isTransforming, setIsTransforming] = useState(false);

  // Transform data when raw data changes
  useEffect(() => {
    const transformData = async () => {
      if (!rawData || !cryptoKey) {
        setTransformedData(null);
        return;
      }

      setIsTransforming(true);
      try {
        if (isCurrentMonth) {
          const result = await transformCurrentMonthData(
            rawData as RawCurrentMonthData,
            cryptoKey
          );
          setTransformedData(result);
        } else {
          const result = await transformHistoricalData(
            rawData as HistoricalAccountingData,
            cryptoKey
          );
          setTransformedData(result);
        }
      } catch (err) {
        console.error('Error transforming data:', err);
        setTransformedData(null);
      } finally {
        setIsTransforming(false);
      }
    };

    transformData();
  }, [rawData, isCurrentMonth, cryptoKey]);

  return {
    data: transformedData,
    isLoading: isRawLoading || isTransforming,
    error,
    isCurrentMonth,
  };
}

// Transform current month raw data to match UI expectations
export async function transformCurrentMonthData(
  data: RawCurrentMonthData,
  cryptoKey: CryptoKey
): Promise<DecryptedAccountingData> {
  // Decrypt transaction amounts
  const decryptedTransactions = await Promise.all(
    data.transactions.map(async (t) => ({
      ...t,
      amount: (await decryptNumber(t.amount, cryptoKey)) ?? 0,
      description: t.description
        ? await decrypt(t.description, cryptoKey)
        : undefined,
    }))
  );

  // Decrypt account balances
  const decryptedAccounts = await Promise.all(
    data.accounts.map(async (account) => ({
      ...account,
      currentBalance:
        (await decryptNumber(account.currentBalance, cryptoKey)) ?? 0,
      startingBalance: account.startingBalance
        ? (await decryptNumber(account.startingBalance, cryptoKey)) ?? 0
        : 0,
    }))
  );

  // Calculate totals from decrypted transactions
  const totalIncome = decryptedTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = decryptedTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Transform transactions into journal entries
  const journalEntries = decryptedTransactions.map((t) => ({
    id: t.id,
    type: t.type,
    accountFrom: t.accountFrom,
    accountTo: t.accountTo,
    amount: t.amount,
    description: t.description,
    created_at: t.created_at,
    category: t.category,
  }));

  // Transform account balances
  const accountBalances = decryptedAccounts.map((account) => ({
    id: account.id,
    accountName: account.name,
    account_type: account.account_type,
    balance: account.currentBalance,
    startingBalance: account.startingBalance,
  }));

  return {
    totalIncome,
    totalExpense,
    totalSavings: totalIncome - totalExpense,
    cashFlow: totalIncome - totalExpense,
    accumulatedCash: accountBalances.reduce((sum, acc) => sum + acc.balance, 0),
    accountBalances,
    journalEntries,
  };
}

// Transform and decrypt historical data
export async function transformHistoricalData(
  data: HistoricalAccountingData,
  cryptoKey: CryptoKey
): Promise<DecryptedAccountingData> {
  if (!data || !cryptoKey) {
    throw new Error('Data or cryptoKey is missing');
  }

  const [totalIncome, totalExpense, totalSavings, cashFlow, accumulatedCash] =
    await Promise.all([
      decryptNumber(data.total_income, cryptoKey),
      decryptNumber(data.total_expense, cryptoKey),
      decryptNumber(data.total_savings, cryptoKey),
      decryptNumber(data.cash_flow, cryptoKey),
      decryptNumber(data.accumulated_cash, cryptoKey),
    ]);

  const accountBalances = await Promise.all(
    data.account_balance_snapshots.map(async (snapshot) => ({
      id: snapshot.id,
      accountName: snapshot.account.name,
      account_type: snapshot.account.account_type,
      balance: (await decryptNumber(snapshot.balance, cryptoKey)) ?? 0,
      startingBalance: snapshot.startingBalance
        ? (await decryptNumber(snapshot.startingBalance, cryptoKey)) ?? 0
        : 0,
    }))
  );

  const journalEntries = await Promise.all(
    data.journal_entries.map(async (entry) => ({
      ...entry,
      amount: (await decryptNumber(entry.amount, cryptoKey)) ?? 0,
      description: entry.description
        ? await decrypt(entry.description, cryptoKey)
        : undefined,
    }))
  );

  return {
    totalIncome: totalIncome ?? 0,
    totalExpense: totalExpense ?? 0,
    totalSavings: totalSavings ?? 0,
    cashFlow: cashFlow ?? 0,
    accumulatedCash: accumulatedCash ?? 0,
    accountBalances,
    journalEntries,
  };
}
