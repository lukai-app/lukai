import { useSession } from '@/app/_components/session-provider';
import { useAppContext } from '@/app/dashboard/_context/app-context';
import { useMonthlyAccounting } from '../use-monthly-accounting';
import { importKey } from '@/lib/utils/encryption';
import { useState, useEffect } from 'react';
import { lastDayOfMonth, startOfMonth, eachWeekOfInterval } from 'date-fns';
import DayjsSingleton from '@/lib/helpers/Dayjs';

interface Week {
  id: string;
  weekNumber: number;
  dateRange: string;
  startDate: Date;
  endDate: Date;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  weekId: string;
  created_at: string;
  account: string;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  items: Transaction[];
}

interface CashFlowData {
  weeks: Week[];
  categories: Category[];
}

export function useWeeklyCashFlow() {
  const { session } = useSession();
  const { year, month, currency } = useAppContext();
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const dayjs = DayjsSingleton.getInstance(
    session?.user.favorite_locale || 'es-PE'
  );

  const {
    data: decryptedData,
    isLoading,
    error,
  } = useMonthlyAccounting({ year, month, currency, cryptoKey });

  useEffect(() => {
    if (session?.encryptionKey) {
      importKey(session.encryptionKey).then(setCryptoKey);
    }
  }, [session?.encryptionKey]);

  const getAllWeeksInMonth = (year: number, month: number): Week[] => {
    const firstDay = startOfMonth(new Date(year, month, 1));
    const lastDay = lastDayOfMonth(new Date(year, month, 1));

    const weekDates = eachWeekOfInterval(
      { start: firstDay, end: lastDay },
      { weekStartsOn: 1 }
    );

    return weekDates.map((weekStart, index) => {
      // For each week start, calculate the end date (Sunday)
      let weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      // If week end is beyond the month, adjust it to last day of month
      if (weekEnd > lastDay) {
        weekEnd = lastDay;
      }

      // if week start is before the first day of the month, adjust it to the first day of the month
      if (weekStart < firstDay) {
        weekStart = firstDay;
      }

      return {
        id: weekStart.toISOString().split('T')[0],
        weekNumber: index + 1,
        dateRange: `${dayjs(weekStart).format('DD MMMM')} - ${dayjs(
          weekEnd
        ).format('DD MMMM')}`,
        startDate: weekStart,
        endDate: weekEnd,
      };
    });
  };

  const getWeekIdForDate = (date: Date): string => {
    const currentDate = new Date(date);
    const firstDay = startOfMonth(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    );
    const weeks = getAllWeeksInMonth(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );

    // Find the week that contains this date
    const week = weeks.find((w) => {
      const start = new Date(w.startDate);
      const end = new Date(w.endDate);
      return currentDate >= start && currentDate <= end;
    });

    return week?.id || firstDay.toISOString().split('T')[0];
  };

  const transformToWeeklyData = (): CashFlowData | null => {
    if (!decryptedData) return null;

    const weeks = getAllWeeksInMonth(year, month);

    // Create income category with individual transactions
    const incomeTransactions = decryptedData.journalEntries
      .filter((entry) => entry.amount > 0)
      .map((entry) => ({
        id: entry.id,
        description: entry.description ?? '',
        amount: entry.amount,
        weekId: getWeekIdForDate(new Date(entry.created_at)),
        created_at: entry.created_at,
        account: entry.accountTo?.name ?? '',
        category: entry.category,
      }));

    // Group expense transactions by category
    const expensesByCategory = new Map<string, Transaction[]>();
    decryptedData.journalEntries
      .filter((entry) => entry.amount > 0)
      .forEach((entry) => {
        const categoryName = entry.category || 'Sin categoría';
        if (!expensesByCategory.has(entry.category.name)) {
          expensesByCategory.set(entry.category.name, []);
        }
        expensesByCategory.get(entry.category.name)!.push({
          id: entry.id,
          description: entry.description ?? '',
          amount: entry.amount,
          weekId: getWeekIdForDate(new Date(entry.created_at)),
          created_at: entry.created_at,
          account: entry.accountFrom?.name ?? '',
          category: entry.category,
        });
      });

    // Create categories array starting with income
    const categories: Category[] = [
      {
        id: 'income',
        name: 'Ingresos',
        items: incomeTransactions,
      },
    ];

    // Add expense categories that have transactions
    expensesByCategory.forEach((transactions, categoryName) => {
      categories.push({
        id: `expense-${categoryName.toLowerCase().replace(/\s+/g, '-')}`,
        name: categoryName,
        items: transactions,
      });
    });

    return {
      weeks,
      categories,
    };
  };

  return {
    data: transformToWeeklyData(),
    isLoading: isLoading || !cryptoKey || !decryptedData,
    error,
  };
}
