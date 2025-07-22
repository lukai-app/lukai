'use client';

import React, { useMemo, useState } from 'react';

import DayjsSingleton from '@/lib/helpers/Dayjs';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AccountBalanceSnapshot,
  DecryptedAccountingData,
  JournalEntry,
} from '../types';
import { useSession } from '@/app/_components/session-provider';
import { cn } from '@/lib/utils';

interface BooksProps {
  decryptedData: DecryptedAccountingData | null;
  isLoading: boolean;
  error: Error | null;
  currency: string;
  month: number;
  year: number;
}

export const MobileBooks: React.FC<BooksProps> = ({
  decryptedData,
  isLoading,
  error,
  currency,
  month,
  year,
}) => {
  const { session } = useSession();
  const [selectedTab, setSelectedTab] = useState<
    'journal' | 'ledger' | 'profit-loss' | 'balance'
  >('journal');

  return (
    <div className="flex-1 p-4 flex flex-col h-full">
      <Tabs
        className="w-full flex flex-col"
        value={selectedTab}
        onValueChange={(value) =>
          setSelectedTab(
            value as 'journal' | 'ledger' | 'profit-loss' | 'balance'
          )
        }
      >
        <TabsList className="grid w-full grid-cols-2 mb-4 grid-rows-2 h-20">
          <TabsTrigger value="journal">libro diario</TabsTrigger>
          <TabsTrigger value="ledger">libro mayor</TabsTrigger>
          <TabsTrigger value="profit-loss">estado de resultados</TabsTrigger>
          <TabsTrigger value="balance">balance general</TabsTrigger>
          {/* <TabsTrigger value="cashflow">flujo de caja</TabsTrigger> */}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : decryptedData ? (
        selectedTab === 'journal' ? (
          <JournalBook
            data={decryptedData}
            currency={currency}
            locale={session?.user.favorite_locale || 'en-US'}
          />
        ) : selectedTab === 'ledger' ? (
          <LedgerBook
            data={decryptedData}
            currency={currency}
            locale={session?.user.favorite_locale || 'en-US'}
          />
        ) : selectedTab === 'profit-loss' ? (
          <ProfitLossBook
            data={decryptedData}
            currency={currency}
            locale={session?.user.favorite_locale || 'en-US'}
          />
        ) : selectedTab === 'balance' ? (
          <BalanceSheetBook
            data={decryptedData}
            currency={currency}
            locale={session?.user.favorite_locale || 'en-US'}
          />
        ) : null
      ) : null}
    </div>
  );
};

interface WithCreatedAt {
  created_at: string | Date;
}

interface GroupedByDate<T extends WithCreatedAt> {
  [key: string]: T[];
}

const groupByDate = <T extends WithCreatedAt>(
  items: T[],
  locale: string
): GroupedByDate<T> => {
  const groups: GroupedByDate<T> = {};
  const dayjs = DayjsSingleton.getInstance(locale);

  for (const item of items) {
    const date = new Date(item.created_at);
    const label = dayjs(date).format('DD [de] MMMM');

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(item);
  }

  return groups;
};

const sortGroupedByDate = <T extends WithCreatedAt>(
  grouped: GroupedByDate<T>
): [string, T[]][] => {
  return Object.entries(grouped).sort(([labelA], [labelB]) => {
    // review the created_at date of the first entry in the group
    const dateA = new Date(grouped[labelA][0].created_at);
    const dateB = new Date(grouped[labelB][0].created_at);

    if (dateA.getTime() !== dateB.getTime()) {
      return dateB.getTime() - dateA.getTime();
    }

    return labelB.localeCompare(labelA);
  });
};

function JournalBook({
  data,
  currency,
  locale,
}: {
  data: DecryptedAccountingData;
  currency: string;
  locale: string;
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const groupedJournalEntries = useMemo(
    () => groupByDate(data.journalEntries, locale),
    [data.journalEntries]
  );

  return (
    <div className="flex-1 relative flex flex-col">
      <div className="overflow-y-auto flex-1">
        <Table>
          <TableHeader className="sticky top-0 bg-[#05060A] border-0 border-gray-800">
            <TableRow className="!border-0 hover:bg-transparent">
              <TableHead className="w-[60%] border-0 bg-[#05060A]">
                movimiento
              </TableHead>
              <TableHead className="w-[20%] text-right border-0 bg-[#05060A]">
                debe
              </TableHead>
              <TableHead className="w-[20%] text-right border-0 bg-[#05060A]">
                haber
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="overflow-y-auto">
            {sortGroupedByDate(groupedJournalEntries)
              .reverse()
              .map(([label, entries], index) => (
                <React.Fragment key={label}>
                  {index !== 0 && (
                    <TableRow className="h-2 border-0 hover:bg-transparent">
                      <TableCell colSpan={3}></TableCell>
                    </TableRow>
                  )}
                  <TableRow className="border-0">
                    <TableCell
                      className="max-w-0 py-2 px-2 rounded-t-sm bg-[#1a1a1a] hover:bg-[#1a1a1a]"
                      colSpan={3}
                    >
                      <p className="text-sm font-medium text-muted-foreground truncate">
                        {label}
                      </p>
                    </TableCell>
                  </TableRow>
                  {entries.map((entry) => (
                    <React.Fragment key={entry.id}>
                      <TableRow className="border-0 hover:bg-transparent">
                        <TableCell className="max-w-0 p-2">
                          <div className="w-full">
                            <p className="text-sm truncate">
                              {entry.type === 'transfer'
                                ? entry.accountFrom?.name
                                : entry.description
                                    ?.replace('Gasto en', '')
                                    .trim()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm whitespace-nowrap p-2">
                          {entry.type === 'expense'
                            ? formatCurrency(entry.amount)
                            : ''}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right text-sm whitespace-nowrap p-2'
                          )}
                        >
                          {entry.type === 'transfer' || entry.type === 'income'
                            ? formatCurrency(entry.amount)
                            : ''}
                        </TableCell>
                      </TableRow>
                      <TableRow className="border-b border-gray-800 hover:bg-transparent">
                        <TableCell className="max-w-0 p-2">
                          <div className="w-full">
                            <p className="text-sm truncate">
                              {entry.type === 'transfer' ||
                              entry.type === 'income'
                                ? entry.accountTo?.name
                                : entry.accountFrom?.name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right text-sm whitespace-nowrap p-2',
                            entry.type === 'income' && 'text-lettuce'
                          )}
                        >
                          {entry.type === 'transfer' || entry.type === 'income'
                            ? formatCurrency(entry.amount)
                            : ''}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right text-sm whitespace-nowrap p-2',
                            entry.type === 'expense' && 'text-yc'
                          )}
                        >
                          {entry.type === 'expense'
                            ? formatCurrency(entry.amount)
                            : ''}
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex z-10 fixed w-[calc(100%-2rem)] bottom-20 justify-between items-center py-2 px-3 rounded-lg bg-[#1a1a1a] mt-4">
        <h2 className="text-sm">total</h2>
        <div className="grid grid-cols-2 gap-2 w-40 text-right">
          <span className="text-sm text-muted-foreground font-medium">
            {formatCurrency(
              data.journalEntries.reduce((sum, t) => sum + t.amount, 0)
            )}
          </span>
          <span className="text-sm text-muted-foreground font-medium">
            {formatCurrency(
              data.journalEntries.reduce((sum, t) => sum + t.amount, 0)
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

/* UI inspo for the balance sheet
<div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col bg-[#1a1a1a] p-4 rounded-lg h-fit">
          <p className="text-sm text-muted-foreground">activos</p>
          <p className="text-xl font-medium">
            {formatCurrency(data.accumulatedCash)}
          </p>

          <Separator className="my-2 bg-muted-foreground/50" />

          <div className="flex flex-col gap-2">
            {data.accountBalances.map((acc) => (
              <div
                key={acc.accountName}
                className="flex justify-between text-xs text-gray-400"
              >
                <span>{acc.accountName}</span>
                <span>{formatCurrency(acc.balance)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col bg-[#1a1a1a] p-4 rounded-lg h-fit">
          <p className="text-sm text-muted-foreground">
            resultado del ejercicio
          </p>
          <p className="text-xl font-medium">{formatCurrency(data.cashFlow)}</p>
        </div>
      </div> */

function LedgerBook({
  data,
  currency,
  locale,
}: {
  data: DecryptedAccountingData;
  currency: string;
  locale: string;
}) {
  const [selectedAccount, setSelectedAccount] = useState(
    data.accountBalances[0]?.id
  );

  const account = useMemo(
    () => data.accountBalances.find((acc) => acc.id === selectedAccount),
    [data.accountBalances, selectedAccount]
  );

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Tabs
          value={selectedAccount}
          onValueChange={setSelectedAccount}
          className="w-full"
        >
          <TabsList className="w-full">
            {data.accountBalances.map((account) => (
              <TabsTrigger
                key={account.id}
                value={account.id}
                className="flex-1"
              >
                {account.accountName}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {account ? (
        <LedgerAccountCard
          account={account}
          entries={data.journalEntries.filter(
            (entry) =>
              entry.accountFrom?.id === selectedAccount ||
              entry.accountTo?.id === selectedAccount
          )}
          currency={currency}
          locale={locale}
        />
      ) : null}
    </>
  );
}

function LedgerAccountCard({
  account,
  entries,
  currency,
  locale,
}: {
  account: AccountBalanceSnapshot;
  entries: JournalEntry[];
  currency: string;
  locale: string;
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totalDebit = entries.reduce(
    (sum, entry) =>
      sum +
      (entry.type === 'transfer'
        ? entry.accountTo?.id === account.id
          ? entry.amount
          : 0
        : entry.type === 'income'
        ? entry.amount
        : 0),
    0
  );
  const totalCredit = entries.reduce(
    (sum, entry) =>
      sum +
      (entry.type === 'transfer'
        ? entry.accountFrom?.id === account.id
          ? entry.amount
          : 0
        : entry.type === 'expense'
        ? entry.amount
        : 0),
    0
  );

  const groupedEntries = useMemo(() => {
    const allEntries = entries.sort((a, b) => {
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    return groupByDate(
      allEntries.map((entry, index) => ({
        ...entry,
        balance: allEntries
          .slice(0, index + 1)
          .reduce(
            (sum, e) =>
              sum +
              (e.type === 'income'
                ? e.amount
                : e.type === 'expense'
                ? -e.amount
                : e.type === 'transfer'
                ? e.accountFrom?.id === account.id
                  ? -e.amount
                  : e.amount
                : 0),
            account.startingBalance
          ),
      })),
      locale
    );
  }, [entries]);

  return (
    <div className="flex-1 relative flex flex-col">
      <div className="flex z-10 fixed w-[calc(100%-2rem)] bottom-20 justify-between items-center py-2 px-3 rounded-lg bg-[#1a1a1a] mt-4">
        <h2 className="text-sm">saldo</h2>
        <div className="grid grid-cols-2 gap-2 w-40 text-right">
          <span className="text-sm text-muted-foreground font-medium"></span>
          <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
            {formatCurrency(account.startingBalance + totalDebit - totalCredit)}{' '}
          </span>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-[#05060A] border-0 border-gray-800">
          <TableRow className="!border-0 hover:bg-transparent">
            <TableHead className="w-[60%] h-10 border-0 bg-[#05060A]">
              descripción
            </TableHead>
            <TableHead className="w-[20%] h-10 border-0 bg-[#05060A] text-right">
              monto
            </TableHead>
            <TableHead className="w-[20%] h-10 border-0 bg-[#05060A] text-right">
              saldo
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Starting balance */}
          <TableRow className="border-0">
            <TableCell
              className="max-w-0 py-2 px-2 rounded-sm bg-[#1a1a1a] hover:bg-[#1a1a1a]"
              colSpan={3}
            >
              <div className="flex gap-2 justify-between items-center">
                <p className="text-sm font-medium text-muted-foreground truncate">
                  saldo inicial
                </p>
                <p className="text-muted-foreground">
                  {formatCurrency(account.startingBalance)}
                </p>
              </div>
            </TableCell>
          </TableRow>
          <TableRow className="h-2 border-0 hover:bg-transparent">
            <TableCell colSpan={3} className="p-2"></TableCell>
          </TableRow>
          {sortGroupedByDate(groupedEntries)
            .reverse()
            .map(([label, entries], index) => (
              <React.Fragment key={label}>
                {index !== 0 && (
                  <TableRow className="h-2 border-0 hover:bg-transparent">
                    <TableCell colSpan={3}></TableCell>
                  </TableRow>
                )}
                <TableRow className="border-0">
                  <TableCell
                    className="max-w-0 py-2 px-2 rounded-t-sm bg-[#1a1a1a] hover:bg-[#1a1a1a]"
                    colSpan={3}
                  >
                    <p className="text-sm font-medium text-muted-foreground truncate">
                      {label}
                    </p>
                  </TableCell>
                </TableRow>
                {entries.map((entry, index) => (
                  <TableRow
                    key={entry.id}
                    className="border-b border-gray-800 hover:bg-transparent"
                  >
                    <TableCell className="max-w-0 p-2">
                      <p className="text-sm truncate">
                        {entry.description
                          ?.replace('Gasto en', '')
                          .replace('Ingreso en', '')
                          .trim()}
                      </p>
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right text-sm whitespace-nowrap p-2',
                        entry.type === 'transfer' &&
                          entry.accountFrom?.id === account.id &&
                          'text-yc',
                        entry.type === 'transfer' &&
                          entry.accountTo?.id === account.id &&
                          'text-lettuce',
                        entry.type === 'income' && 'text-lettuce',
                        entry.type === 'expense' && 'text-yc'
                      )}
                    >
                      {entry.type === 'transfer'
                        ? entry.accountFrom?.id === account.id
                          ? `-${formatCurrency(entry.amount)}`
                          : `+${formatCurrency(entry.amount)}`
                        : entry.type === 'income'
                        ? `+${formatCurrency(entry.amount)}`
                        : `-${formatCurrency(entry.amount)}`}
                    </TableCell>
                    <TableCell className="text-right text-sm whitespace-nowrap p-2">
                      {formatCurrency(entry.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ProfitLossBook({
  data,
  currency,
  locale,
}: {
  data: DecryptedAccountingData;
  currency: string;
  locale: string;
}) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Group entries by type and category
  const categorizedEntries = useMemo(() => {
    const incomeByCategory = new Map<
      string,
      { total: number; entries: JournalEntry[] }
    >();
    const expensesByCategory = new Map<
      string,
      { total: number; entries: JournalEntry[] }
    >();

    data.journalEntries.forEach((entry) => {
      if (entry.type === 'income') {
        const current = incomeByCategory.get(entry.category.name) || {
          total: 0,
          entries: [],
        };
        incomeByCategory.set(entry.category.name, {
          total: current.total + entry.amount,
          entries: [...current.entries, entry],
        });
      } else if (entry.type === 'expense') {
        const current = expensesByCategory.get(entry.category.name) || {
          total: 0,
          entries: [],
        };
        expensesByCategory.set(entry.category.name, {
          total: current.total + entry.amount,
          entries: [...current.entries, entry],
        });
      }
    });

    return {
      income: Array.from(incomeByCategory.entries())
        .map(([name, data]) => ({
          name,
          amount: data.total,
          entries: data.entries.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          ),
        }))
        .sort((a, b) => b.amount - a.amount),
      expenses: Array.from(expensesByCategory.entries())
        .map(([name, data]) => ({
          name,
          amount: data.total,
          entries: data.entries.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          ),
        }))
        .sort((a, b) => b.amount - a.amount),
    };
  }, [data.journalEntries]);

  const totalIncome = categorizedEntries.income.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const totalExpenses = categorizedEntries.expenses.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const netResult = totalIncome - totalExpenses;

  const dayjs = DayjsSingleton.getInstance(locale);

  return (
    <div className="flex-1 relative flex flex-col">
      <Table>
        <TableHeader className="bg-[#05060A] border-0 border-gray-800">
          <TableRow className="!border-0 hover:bg-transparent">
            <TableHead className="w-[60%] h-10 border-0 bg-[#05060A]">
              categoría
            </TableHead>
            <TableHead className="w-[40%] h-10 border-0 bg-[#05060A] text-right">
              monto
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Income Section */}
          <TableRow className="border-0">
            <TableCell
              className="max-w-0 py-2 px-2 rounded-t-sm bg-[#1a1a1a] hover:bg-[#1a1a1a]"
              colSpan={2}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  ingresos
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
            </TableCell>
          </TableRow>
          {categorizedEntries.income.map((item) => (
            <React.Fragment key={item.name}>
              <TableRow
                className="border-b border-gray-800 hover:bg-transparent cursor-pointer"
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === item.name ? null : item.name
                  )
                }
              >
                <TableCell className="max-w-0 p-2">
                  <div className="flex items-center gap-1">
                    <p className="text-sm truncate">{item.name}</p>
                    <span className="text-xs text-muted-foreground">
                      ({item.entries.length})
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm whitespace-nowrap p-2">
                  {formatCurrency(item.amount)}
                </TableCell>
              </TableRow>
              {expandedCategory === item.name && (
                <>
                  {item.entries.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className="border-b border-gray-800 hover:bg-transparent bg-[#0a0a0a]"
                    >
                      <TableCell className="max-w-0 p-2 pl-6">
                        <div className="flex flex-col">
                          <p className="text-sm truncate text-muted-foreground">
                            {entry.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {dayjs(entry.created_at).format('DD [de] MMMM')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm whitespace-nowrap p-2 text-muted-foreground">
                        {formatCurrency(entry.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </React.Fragment>
          ))}

          {/* Spacing */}
          <TableRow className="h-4 border-0 hover:bg-transparent">
            <TableCell colSpan={2}></TableCell>
          </TableRow>

          {/* Expenses Section */}
          <TableRow className="border-0">
            <TableCell
              className="max-w-0 py-2 px-2 rounded-t-sm bg-[#1a1a1a] hover:bg-[#1a1a1a]"
              colSpan={2}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  gastos
                </p>
                <p className="text-sm text-muted-foreground">
                  {`(${formatCurrency(totalExpenses)})`}
                </p>
              </div>
            </TableCell>
          </TableRow>
          {categorizedEntries.expenses.map((item) => (
            <React.Fragment key={item.name}>
              <TableRow
                className="border-b border-gray-800 hover:bg-transparent cursor-pointer"
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === item.name ? null : item.name
                  )
                }
              >
                <TableCell className="max-w-0 p-2">
                  <div className="flex items-center gap-1">
                    <p className="text-sm truncate">{item.name}</p>
                    <span className="text-xs text-muted-foreground">
                      ({item.entries.length})
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm whitespace-nowrap p-2">
                  {`(${formatCurrency(item.amount)})`}
                </TableCell>
              </TableRow>
              {expandedCategory === item.name && (
                <>
                  {item.entries.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className="border-b border-gray-800 hover:bg-transparent bg-[#0a0a0a]"
                    >
                      <TableCell className="max-w-0 p-2 pl-6">
                        <div className="flex flex-col">
                          <p className="text-sm truncate text-muted-foreground">
                            {entry.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {dayjs(entry.created_at).format('DD [de] MMMM')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm whitespace-nowrap p-2 text-muted-foreground">
                        {`(${formatCurrency(entry.amount)})`}
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      {/* Net Result */}
      <div className="flex z-10 fixed w-[calc(100%-2rem)] bottom-20 justify-between items-center py-2 px-3 rounded-lg bg-[#1a1a1a] mt-4">
        <h2 className="text-sm">resultado neto</h2>
        <span className="text-sm font-medium text-muted-foreground">
          {netResult < 0
            ? `(${formatCurrency(Math.abs(netResult))})`
            : formatCurrency(netResult)}
        </span>
      </div>
    </div>
  );
}

function BalanceSheetBook({
  data,
  currency,
  locale,
}: {
  data: DecryptedAccountingData;
  currency: string;
  locale: string;
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate totals and group accounts
  const {
    currentAssets,
    savingsAssets,
    liabilities,
    totalCurrentAssets,
    totalSavingsAssets,
    totalAssets,
    totalLiabilities,
    startingEquity,
    retainedEarnings,
    totalEquity,
  } = useMemo(() => {
    // Helper function to calculate account balance
    const calculateAccountBalance = (
      account: AccountBalanceSnapshot,
      isLiability: boolean
    ) => {
      if (!account?.id) return account.startingBalance;

      const accountTransactions = data.journalEntries.filter(
        (entry) =>
          entry.accountFrom?.id === account.id ||
          entry.accountTo?.id === account.id
      );

      let totalDebits = 0;
      let totalCredits = 0;

      for (const entry of accountTransactions) {
        switch (entry.type) {
          case 'transfer':
            if (entry.accountFrom?.id === account.id) {
              totalCredits += entry.amount;
            } else if (entry.accountTo?.id === account.id) {
              totalDebits += entry.amount;
            }
            break;

          case 'income':
            if (entry.accountTo?.id === account.id) {
              totalDebits += entry.amount;
            }
            break;

          case 'expense':
            if (entry.accountFrom?.id === account.id) {
              totalCredits += entry.amount;
            }
            break;
        }
      }

      return isLiability
        ? account.startingBalance + (totalCredits - totalDebits)
        : account.startingBalance + (totalDebits - totalCredits);
    };

    const currentAssets = data.accountBalances
      .filter((acc) => acc.account_type === 'REGULAR')
      .map((acc) => ({
        ...acc,
        currentBalance: calculateAccountBalance(acc, false),
      }));

    const savingsAssets = data.accountBalances
      .filter((acc) => acc.account_type === 'SAVINGS')
      .map((acc) => ({
        ...acc,
        currentBalance: calculateAccountBalance(acc, false),
      }));

    const liabilities = data.accountBalances
      .filter((acc) => acc.account_type === 'DEBT')
      .map((acc) => ({
        ...acc,
        currentBalance: calculateAccountBalance(acc, true),
      }));

    const totalCurrentAssets = currentAssets.reduce(
      (sum, acc) => sum + acc.currentBalance,
      0
    );
    const totalSavingsAssets = savingsAssets.reduce(
      (sum, acc) => sum + acc.currentBalance,
      0
    );
    const totalAssets = totalCurrentAssets + totalSavingsAssets;

    const totalLiabilities = liabilities.reduce(
      (sum, acc) => sum + acc.currentBalance,
      0
    );

    // Calculate starting equity (sum of all starting balances)
    const startingEquity = data.accountBalances.reduce(
      (sum, acc) => sum + acc.startingBalance,
      0
    );

    // Calculate retained earnings (income - expenses)
    const totalIncome = data.journalEntries
      .filter((entry) => entry.type === 'income')
      .reduce((sum, entry) => sum + entry.amount, 0);
    const totalExpenses = data.journalEntries
      .filter((entry) => entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0);
    const retainedEarnings = totalIncome - totalExpenses;

    const totalEquity = startingEquity + retainedEarnings;

    return {
      currentAssets,
      savingsAssets,
      liabilities,
      totalCurrentAssets,
      totalSavingsAssets,
      totalAssets,
      totalLiabilities,
      startingEquity,
      retainedEarnings,
      totalEquity,
    };
  }, [data.accountBalances, data.journalEntries]);

  return (
    <div className="flex-1 relative flex flex-col">
      <Table>
        <TableHeader className="bg-[#05060A] border-0 border-gray-800">
          <TableRow className="!border-0 hover:bg-transparent">
            <TableHead className="w-[60%] h-10 border-0 bg-[#05060A]">
              cuenta
            </TableHead>
            <TableHead className="w-[40%] h-10 border-0 bg-[#05060A] text-right">
              monto
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Assets Section */}
          <TableRow className="border-0">
            <TableCell
              className="max-w-0 py-2 px-2 rounded-t-sm bg-[#1a1a1a] hover:bg-[#1a1a1a]"
              colSpan={2}
            >
              <p className="text-sm font-medium text-muted-foreground">
                activos
              </p>
            </TableCell>
          </TableRow>

          {/* Current Assets */}
          <TableRow className="border-0 hover:bg-transparent">
            <TableCell
              className="max-w-0 py-2 px-2 pl-4 hover:bg-transparent"
              colSpan={2}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  activos corrientes
                </p>
                <p className="text-sm text-muted-foreground">
                  {totalCurrentAssets < 0
                    ? `(${formatCurrency(Math.abs(totalCurrentAssets))})`
                    : formatCurrency(totalCurrentAssets)}{' '}
                </p>
              </div>
            </TableCell>
          </TableRow>
          {currentAssets.map((account) => (
            <TableRow
              key={account.id}
              className="border-b border-gray-800 hover:bg-transparent"
            >
              <TableCell className="max-w-0 p-2 pl-6">
                <p className="text-sm truncate">{account.accountName}</p>
              </TableCell>
              <TableCell className="text-right text-sm whitespace-nowrap p-2">
                {account.currentBalance < 0
                  ? `(${formatCurrency(Math.abs(account.currentBalance))})`
                  : formatCurrency(account.currentBalance)}
              </TableCell>
            </TableRow>
          ))}

          {/* Savings/Fixed Assets */}
          <TableRow className="border-0 hover:bg-transparent">
            <TableCell
              className="max-w-0 py-2 px-2 pl-4 hover:bg-transparent"
              colSpan={2}
            >
              <p className="text-sm text-muted-foreground">ahorros</p>
            </TableCell>
          </TableRow>
          {savingsAssets.map((account) => (
            <TableRow
              key={account.id}
              className="border-b border-gray-800 hover:bg-transparent"
            >
              <TableCell className="max-w-0 p-2 pl-6">
                <p className="text-sm truncate">{account.accountName}</p>
              </TableCell>
              <TableCell className="text-right text-sm whitespace-nowrap p-2">
                {account.currentBalance < 0
                  ? `(${formatCurrency(Math.abs(account.currentBalance))})`
                  : formatCurrency(account.currentBalance)}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="border-b border-gray-800 hover:bg-transparent">
            <TableCell className="max-w-0 p-2 pl-4">
              <p className="text-sm font-medium">total ahorros</p>
            </TableCell>
            <TableCell className="text-right text-sm whitespace-nowrap p-2 font-medium">
              {totalSavingsAssets < 0
                ? `(${formatCurrency(Math.abs(totalSavingsAssets))})`
                : formatCurrency(totalSavingsAssets)}
            </TableCell>
          </TableRow>

          {/* Total Assets */}
          <TableRow className="border-b border-gray-800 hover:bg-[#1a1a1a] bg-[#1a1a1a]">
            <TableCell className="max-w-0 p-2">
              <p className="text-sm font-medium">total activos</p>
            </TableCell>
            <TableCell className="text-right text-sm whitespace-nowrap p-2 font-medium">
              {totalAssets < 0
                ? `(${formatCurrency(Math.abs(totalAssets))})`
                : formatCurrency(totalAssets)}
            </TableCell>
          </TableRow>

          {/* Spacing */}
          <TableRow className="h-4 border-0 hover:bg-transparent">
            <TableCell colSpan={2}></TableCell>
          </TableRow>

          {/* Liabilities Section */}
          <TableRow className="border-0">
            <TableCell
              className="max-w-0 py-2 px-2 rounded-t-sm bg-[#1a1a1a] hover:bg-[#1a1a1a]"
              colSpan={2}
            >
              <p className="text-sm font-medium text-muted-foreground">
                pasivos
              </p>
            </TableCell>
          </TableRow>
          {liabilities.map((account) => (
            <TableRow
              key={account.id}
              className="border-b border-gray-800 hover:bg-transparent"
            >
              <TableCell className="max-w-0 p-2">
                <p className="text-sm truncate">{account.accountName}</p>
              </TableCell>
              <TableCell className="text-right text-sm whitespace-nowrap p-2">
                {`(${formatCurrency(account.currentBalance)})`}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="border-b border-gray-800 hover:bg-[#1a1a1a] bg-[#1a1a1a]">
            <TableCell className="max-w-0 p-2">
              <p className="text-sm font-medium">total pasivos</p>
            </TableCell>
            <TableCell className="text-right text-sm whitespace-nowrap p-2 font-medium">
              {`(${formatCurrency(totalLiabilities)})`}
            </TableCell>
          </TableRow>

          {/* Spacing */}
          <TableRow className="h-4 border-0 hover:bg-transparent">
            <TableCell colSpan={2}></TableCell>
          </TableRow>

          {/* Equity Section */}
          <TableRow className="border-0">
            <TableCell
              className="max-w-0 py-2 px-2 rounded-t-sm bg-[#1a1a1a] hover:bg-[#1a1a1a]"
              colSpan={2}
            >
              <p className="text-sm font-medium text-muted-foreground">
                patrimonio
              </p>
            </TableCell>
          </TableRow>
          <TableRow className="border-b border-gray-800 hover:bg-transparent">
            <TableCell className="max-w-0 p-2">
              <p className="text-sm truncate">patrimonio inicial</p>
            </TableCell>
            <TableCell className="text-right text-sm whitespace-nowrap p-2">
              {startingEquity < 0
                ? `(${formatCurrency(Math.abs(startingEquity))})`
                : formatCurrency(startingEquity)}
            </TableCell>
          </TableRow>
          <TableRow className="border-b border-gray-800 hover:bg-transparent">
            <TableCell className="max-w-0 p-2">
              <p className="text-sm truncate">resultado del periodo</p>
            </TableCell>
            <TableCell className="text-right text-sm whitespace-nowrap p-2">
              {retainedEarnings < 0
                ? `(${formatCurrency(Math.abs(retainedEarnings))})`
                : formatCurrency(retainedEarnings)}
            </TableCell>
          </TableRow>
          <TableRow className="border-b border-gray-800 hover:bg-[#1a1a1a] bg-[#1a1a1a]">
            <TableCell className="max-w-0 p-2">
              <p className="text-sm font-medium">total patrimonio</p>
            </TableCell>
            <TableCell className="text-right text-sm whitespace-nowrap p-2 font-medium">
              {totalEquity < 0
                ? `(${formatCurrency(Math.abs(totalEquity))})`
                : formatCurrency(totalEquity)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {/* Total Liabilities + Equity */}
      <div className="flex z-10 fixed w-[calc(100%-2rem)] bottom-20 justify-between items-center py-2 px-3 rounded-lg bg-[#1a1a1a] mt-4">
        <h2 className="text-sm">pasivos + patrimonio</h2>
        <span className="text-sm font-medium">
          {formatCurrency(totalLiabilities + totalEquity)}
        </span>
      </div>
    </div>
  );
}
