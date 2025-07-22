'use client';

import { env } from '@/env';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/app/_components/session-provider';
import { account_type } from '@/types';

interface RawAccountBalanceSnapshot {
  id: string;
  account_id: string;
  balance: string; // Encrypted
  account: {
    name: string;
    account_type: account_type;
  };
  startingBalance: string | null;
}

interface RawJournalEntry {
  id: string;
  amount: string; // encrypted
  type: 'income' | 'expense' | 'transfer';
  accountFrom: {
    id: string;
    name: string;
  } | null;
  accountTo: {
    id: string;
    name: string;
  } | null;
  description?: string; // encrypted
  created_at: string;
  category: {
    id: string;
    name: string;
  };
}

export interface HistoricalAccountingData {
  id: string;
  year: number;
  month: number;
  currency_code: string;
  total_income: string; // Encrypted
  total_expense: string; // Encrypted
  total_savings: string; // Encrypted
  cash_flow: string; // Encrypted
  accumulated_cash: string; // Encrypted
  account_balance_snapshots: RawAccountBalanceSnapshot[];
  journal_entries: RawJournalEntry[];
}

interface GetAccountingParams {
  year: number;
  month: number;
  currency: string;
  token: string;
}

const getAccountingData = async (params: GetAccountingParams) => {
  const searchParams = new URLSearchParams();
  searchParams.set('year', params.year.toString());
  searchParams.set('month', params.month.toString());
  searchParams.set('currency', params.currency);

  const response = await fetch(
    `${
      env.NEXT_PUBLIC_API_URL
    }/v1/accounting/historical?${searchParams.toString()}`,
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
    throw new Error('Failed to fetch accounting data');
  }

  return response.json() as Promise<HistoricalAccountingData>;
};

export function useHistoricalAccounting(params: {
  year: number;
  month: number;
  currency: string;
}) {
  const { session } = useSession();

  return useQuery<HistoricalAccountingData>({
    queryKey: ['accounting-historical', params],
    queryFn: () =>
      getAccountingData({ ...params, token: session?.token ?? '' }),
    enabled: !!session,
  });
}
