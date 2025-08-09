'use client';

import { useEffect, useMemo, useState } from 'react';
import { X, Search, ChevronDown, XIcon, Coins } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { parseAsIsoDateTime } from 'nuqs';
import { useSession } from '@/app/_components/session-provider';
import { useAppContext } from '@/app/dashboard/_context/app-context';
import { decrypt } from '@/lib/utils/encryption';
import { Expense } from '@/app/dashboard/_hooks/use-transactions';
import { Income } from '@/app/dashboard/_hooks/use-transactions';
import { decryptNumber } from '@/lib/utils/encryption';
import { useTransactions } from '@/app/dashboard/_hooks/use-transactions';
import { importKey } from '@/lib/utils/encryption';
import { DateRange } from 'react-day-picker';
import {
  isToday,
  isYesterday,
  differenceInCalendarDays,
  isThisWeek,
  isThisMonth,
  getDay,
  format,
  startOfWeek,
  endOfWeek,
  subWeeks,
  isWithinInterval,
} from 'date-fns';
import { es } from 'date-fns/locale';

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarDateRangePicker } from '@/components/ui/date-range-picker';
import DayjsSingleton from '@/lib/helpers/Dayjs';
import { MobileCategorySelector } from './mobile-category-selector';
import { MobileTagSelector } from './mobile-tag-selector';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  timestamp: string;
  date: Date;
  status: 'completed';
  description?: string;
  account: string;
  currency_code: string;
}

function isLastWeek(
  date: Date,
  options: { weekStartsOn?: number } = {}
): boolean {
  const { weekStartsOn = 0 } = options; // 0 = Domingo, 1 = Lunes

  const start = startOfWeek(subWeeks(new Date(), 1), {
    weekStartsOn: weekStartsOn as any,
  });
  const end = endOfWeek(subWeeks(new Date(), 1), {
    weekStartsOn: weekStartsOn as any,
  });

  return isWithinInterval(date, { start, end });
}

interface GroupedTransactions {
  [key: string]: Transaction[];
}

interface TransactionModalProps {
  openTransactionsModal: boolean;
  setOpenTransactionsModal: (open: boolean) => void;
  selectedTabDefault: 'expense' | 'income';
  locale: string;
  dateFrom: Date;
  dateTo: Date;
  setDateFrom: (date: Date) => void;
  setDateTo: (date: Date) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  showButton?: boolean;
}

export const getGroupLabel = (date: Date, now: Date): string => {
  const daysDiff = differenceInCalendarDays(now, date);

  if (isToday(date)) return 'Hoy';
  if (isYesterday(date)) return 'Ayer';
  if (daysDiff <= 3) return `Hace ${daysDiff} días`;

  // Solo mostramos "Fin de semana pasado" si hoy es lunes
  const isTodayMonday = getDay(now) === 1;
  const isFinDeSemanaPasado =
    isTodayMonday &&
    isLastWeek(date, { weekStartsOn: 1 }) &&
    (getDay(date) === 6 || getDay(date) === 0); // sábado o domingo

  if (isFinDeSemanaPasado) return 'Fin de semana pasado';

  if (isThisWeek(date, { weekStartsOn: 1 })) return 'Esta semana';
  if (isLastWeek(date, { weekStartsOn: 1 })) return 'La semana pasada';

  if (isThisMonth(date)) return 'Este mes';

  return format(date, 'MMMM yyyy', { locale: es }); // Ej: "Febrero 2025"
};

const groupTransactionsBySmartDate = (
  transactions: Transaction[]
): GroupedTransactions => {
  const now = new Date();

  const groups: GroupedTransactions = {};

  for (const transaction of transactions) {
    const date = new Date(transaction.date);
    const label = getGroupLabel(date, now);

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(transaction);
  }

  return groups;
};

const ORDER_PRIORITY = [
  'Hoy',
  'Ayer',
  'Hace 2 días',
  'Hace 3 días',
  'Fin de semana pasado',
  'Esta semana',
  'La semana pasada',
  'Este mes',
];

const sortGroupedTransactions = (grouped: Record<string, Transaction[]>) => {
  const entries = Object.entries(grouped);

  return entries.sort(([labelA], [labelB]) => {
    const indexA = ORDER_PRIORITY.indexOf(labelA);
    const indexB = ORDER_PRIORITY.indexOf(labelB);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    // Si no están en la lista de prioridad, ordenar por fecha descendente del mes
    return new Date(labelB).getTime() - new Date(labelA).getTime();
  });
};

export const TransactionModal: React.FC<TransactionModalProps> = ({
  openTransactionsModal,
  setOpenTransactionsModal,
  locale,
  selectedTabDefault,
  dateFrom,
  dateTo,
  setDateFrom,
  setDateTo,
  selectedCategory,
  setSelectedCategory,
  selectedTag,
  setSelectedTag,
  showButton = true,
}) => {
  const { currency, month, year } = useAppContext();
  const dayjs = DayjsSingleton.getInstance(locale);

  const [searchQuery, setSearchQuery] = useQueryState('q', {
    defaultValue: '',
  });

  const [selectedTab, setSelectedTab] = useState(selectedTabDefault);

  const dateRange = useMemo<DateRange | undefined>(() => {
    if (!dateFrom && !dateTo) return undefined;
    return {
      from: dateFrom ?? undefined,
      to: dateTo ?? undefined,
    };
  }, [dateFrom, dateTo]);

  useEffect(() => {
    setSelectedTab(selectedTabDefault);
  }, [selectedTabDefault]);

  const {
    data: transactions,
    isLoading,
    error,
  } = useTransactions({
    startDate: dateFrom ?? undefined,
    endDate: dateTo ?? undefined,
    currency,
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const filteredTransactions = useMemo(() => {
    return (
      transactions
        ?.filter((transaction) => {
          return (
            (selectedCategory === 'all' ||
              transaction.category_id === selectedCategory) &&
            transaction.type === selectedTab
          );
        })
        .filter((transaction) => {
          if (selectedTag === 'all') return true;
          return transaction.tags.some((tag) => tag.id === selectedTag);
        })
        .filter((transaction) => {
          if (!searchQuery) return true;
          const searchTerms = searchQuery.toLowerCase();
          return (
            transaction.title.toLowerCase().includes(searchTerms) ||
            transaction.description?.toLowerCase().includes(searchTerms) ||
            transaction.account.toLowerCase().includes(searchTerms) ||
            transaction.category.toLowerCase().includes(searchTerms)
          );
        }) || []
    );
  }, [transactions, searchQuery, selectedCategory, selectedTab, selectedTag]);

  // Group transactions by month
  const groupedTransactions =
    groupTransactionsBySmartDate(filteredTransactions);

  // Calculate total for the month
  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );
  }, [filteredTransactions]);

  return (
    <Sheet
      open={openTransactionsModal}
      onOpenChange={(open) => {
        setOpenTransactionsModal(open);
        if (!open) {
          // reset filters
          setSearchQuery('');
          setSelectedCategory('all');
          setSelectedTag('all');
          setSelectedTab(selectedTabDefault);
          setDateFrom(
            dayjs().year(year).month(month).day(1).startOf('month').toDate()
          );
          setDateTo(
            dayjs().year(year).month(month).day(1).endOf('month').toDate()
          );
        }
      }}
    >
      {showButton ? (
        <SheetTrigger asChild>
          <button className="w-full mt-4 py-3 bg-zinc-800 rounded-lg text-white font-medium">
            ver todas las transacciones
          </button>
        </SheetTrigger>
      ) : null}
      <SheetContent
        className=" bg-[#05060A] w-full max-w-full border-none"
        closeButton={false}
      >
        {/* Header with close button */}
        <div className="mb-4 flex gap-3 items-center">
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="font-bold shrink-0">
              <XIcon className="h-5 w-5" />
            </Button>
          </SheetClose>
          <div className="flex flex-col">
            <SheetTitle className="text-left text-2xl font-bold">
              transacciones
            </SheetTitle>
            <span className="text-xl font-bold text-muted-foreground">
              {formatCurrency(totalAmount, currency)}
            </span>
          </div>
        </div>

        {/* Search and filters */}
        <div className="space-y-4">
          <div className="relative flex items-center w-full">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 absolute left-4" />
            <Input
              type="search"
              placeholder="buscar transacciones"
              className="pl-10 h-14 w-full rounded-lg text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value || null)}
            />
          </div>

          {/* Filter buttons */}
          <div className="flex gap-2 pb-2 flex-wrap">
            <CalendarDateRangePicker
              date={dateRange}
              setDate={(range) => {
                const now = new Date();
                const startOfMonth = new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  1
                );
                const endOfMonth = new Date(
                  now.getFullYear(),
                  now.getMonth() + 1,
                  0
                );

                if (range?.from) {
                  setDateFrom(range.from);
                } else {
                  setDateFrom(startOfMonth);
                }
                if (range?.to) {
                  setDateTo(range.to);
                } else {
                  setDateTo(endOfMonth);
                }
              }}
              hideClearButton={true}
              variant="modal"
            />
            <MobileCategorySelector
              selectedTab={selectedTab}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              mode="id"
            />
            <MobileTagSelector
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
            />

            <Tabs
              value={selectedTab}
              onClick={() => {
                // is like a toggle
                if (selectedTab === 'expense') {
                  setSelectedTab('income');
                } else {
                  setSelectedTab('expense');
                }
              }}
              className="mb-3"
            >
              <TabsList className="!h-9">
                <TabsTrigger
                  value="expense"
                  className="data-[state=active]:bg-yc-600 py-1"
                >
                  -
                </TabsTrigger>
                <TabsTrigger
                  value="income"
                  className="data-[state=active]:bg-lemon-950 py-1"
                >
                  +
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Rest of the modal content remains the same */}
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error.message}</div>
        ) : (
          <div className="flex-1 max-h-full no-scrollbar overflow-y-auto overflow-x-hidden mt-4 pb-48">
            {sortGroupedTransactions(groupedTransactions).map(
              ([date, dateTransactions]) => (
                <div key={date} className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-muted-foreground text-sm">{date}</h2>
                    <span className="text-sm text-muted-foreground font-medium">
                      {formatCurrency(
                        dateTransactions.reduce((sum, t) => sum + t.amount, 0),
                        currency
                      )}
                    </span>
                  </div>

                  <div className="space-y-6">
                    {dateTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          {/* <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mr-4">
                          <span className="text-2xl">{transaction.icon}</span>
                        </div> */}

                          <div>
                            <h3 className="text-base font-medium">
                              {transaction.title}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {dayjs(transaction.date).format('DD [de] MMMM')}
                            </p>
                          </div>
                        </div>

                        <div className="">
                          <span className="text-base">
                            {formatCurrency(transaction.amount, currency)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
