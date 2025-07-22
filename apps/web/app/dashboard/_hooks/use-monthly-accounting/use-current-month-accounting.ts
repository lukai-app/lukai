import { useSession } from '@/app/_components/session-provider';
import { env } from '@/env';
import { account_type } from '@/types';
import { useQuery } from '@tanstack/react-query';

export interface RawCurrentMonthData {
  transactions: Array<{
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
  }>;
  accounts: Array<{
    id: string;
    name: string;
    account_type: account_type;
    currentBalance: string; // encrypted
    startingBalance: string | null; // encrypted
  }>;
}

interface GetCurrentMonthAccountingParams {
  currency: string;
  token: string;
}
const getCurrentMonthAccountingData = async (
  params: GetCurrentMonthAccountingParams
) => {
  const searchParams = new URLSearchParams();
  searchParams.set('currency', params.currency);

  const response = await fetch(
    `${
      env.NEXT_PUBLIC_API_URL
    }/v1/accounting/current?${searchParams.toString()}`,
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

  return response.json() as Promise<RawCurrentMonthData>;
};

export function useCurrentMonthAccounting({ currency }: { currency: string }) {
  const { session } = useSession();

  return useQuery<RawCurrentMonthData>({
    queryKey: ['accounting-current', { currency }],
    queryFn: () =>
      getCurrentMonthAccountingData({ currency, token: session?.token ?? '' }),
    enabled: !!session,
  });
}
