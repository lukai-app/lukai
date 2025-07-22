import { account_type } from '@/types';

export interface AccountBalanceSnapshot {
  id: string;
  accountName: string;
  account_type: account_type;
  balance: number;
  startingBalance: number;
}

export interface JournalEntry {
  id: string;
  type: 'income' | 'expense' | 'transfer' | 'balance';
  accountFrom: {
    id: string;
    name: string;
  } | null;
  accountTo: {
    id: string;
    name: string;
  } | null;
  amount: number;
  description?: string;
  created_at: string;
  category: {
    id: string;
    name: string;
  };
}

export interface DecryptedAccountingData {
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  cashFlow: number;
  accumulatedCash: number;
  accountBalances: AccountBalanceSnapshot[];
  journalEntries: JournalEntry[];
}
