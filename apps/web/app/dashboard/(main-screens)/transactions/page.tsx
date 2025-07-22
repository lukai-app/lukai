'use client';

import { useMemo, useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, LayoutList, Search, Table2Icon, Trash2 } from 'lucide-react';
import TransactionsList from './_components/transactions-list';
import { CalendarDateRangePicker } from '@/components/ui/date-range-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { DateRange } from 'react-day-picker';
import {
  useTransactions,
  Transaction,
} from '@/app/dashboard/_hooks/use-transactions';
import { useAppContext } from '@/app/dashboard/_context/app-context';
import { useSession } from '@/app/_components/session-provider';
import { parseAsIsoDateTime, useQueryState } from 'nuqs';
import DayjsSingleton from '@/lib/helpers/Dayjs';
import { useMutation } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  cancelTransactionDeletionFunction,
  queueTransactionDeletionFunction,
} from '@/app/dashboard/(main-screens)/transactions/request';

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

const getGroupLabel = (date: Date, now: Date): string => {
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

export default function TransactionsPage() {
  const { currency } = useAppContext();
  const { session } = useSession();

  const [searchQuery, setSearchQuery] = useQueryState('q', {
    defaultValue: '',
  });
  const [selectedCategory, setSelectedCategory] = useQueryState('category', {
    defaultValue: 'all',
  });
  const [selectedType, setSelectedType] = useQueryState('type', {
    defaultValue: 'all',
  });
  const [dateFrom, setDateFrom] = useQueryState(
    'from',
    parseAsIsoDateTime.withDefault(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    )
  );
  const [dateTo, setDateTo] = useQueryState(
    'to',
    parseAsIsoDateTime.withDefault(
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    )
  );
  const [selectedView, setSelectedView] = useQueryState('view', {
    defaultValue: 'list',
  });

  const dateRange = useMemo<DateRange | undefined>(() => {
    if (!dateFrom && !dateTo) return undefined;
    return {
      from: dateFrom ?? undefined,
      to: dateTo ?? undefined,
    };
  }, [dateFrom, dateTo]);

  const { data, isLoading, error } = useTransactions({
    startDate: dateFrom ?? undefined,
    endDate: dateTo ?? undefined,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    type: undefined,
    currency,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (data) {
      setTransactions(data);
    }
  }, [data]);

  const filteredTransactions = useMemo(() => {
    return (
      transactions
        ?.filter((transaction) => {
          return (
            (selectedCategory === 'all' ||
              transaction.category_id === selectedCategory) &&
            (selectedType === 'all' || transaction.type === selectedType)
          );
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
  }, [transactions, searchQuery, selectedCategory, selectedType]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    return groupTransactionsBySmartDate(filteredTransactions);
  }, [filteredTransactions]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(session?.user.favorite_locale || 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Transacciones</h1>

      <div className="flex items-center gap-2 w-full mb-8">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-4 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search transactions..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value || null)}
          />
        </div>
        <CalendarDateRangePicker
          date={dateRange}
          setDate={(range) => {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
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
          className="shrink-0"
        />

        <Select
          value={selectedCategory}
          onValueChange={(value) => setSelectedCategory(value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Category" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {selectedType === 'all' || selectedType === 'outgoing'
              ? session?.user?.expense_categories?.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))
              : session?.user?.income_categories?.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedType}
          onValueChange={(value) => setSelectedType(value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Transaction Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="incoming">Income</SelectItem>
            <SelectItem value="outgoing">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Tabs
          value={selectedView}
          onValueChange={(value) => setSelectedView(value)}
        >
          <TabsList>
            <TabsTrigger value="list">
              <LayoutList className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="table">
              <Table2Icon className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : (
        <>
          {selectedView === 'list' ? (
            <>
              {sortGroupedTransactions(groupedTransactions).map(
                ([date, dateTransactions]) => (
                  <div key={date} className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-muted-foreground text-sm">{date}</h2>
                      <span className="text-sm text-muted-foreground font-medium">
                        {formatCurrency(
                          dateTransactions.reduce(
                            (sum, t) => sum + t.amount,
                            0
                          ),
                          currency
                        )}
                      </span>
                    </div>

                    <div className="space-y-0">
                      {dateTransactions.map((transaction) => (
                        <TransactionItem
                          key={transaction.id}
                          transaction={transaction}
                          setTransactions={setTransactions}
                        />
                      ))}
                    </div>
                  </div>
                )
              )}
            </>
          ) : (
            <TransactionsList
              transactions={filteredTransactions}
              locale={session?.user.favorite_locale || 'en-US'}
            />
          )}
        </>
      )}
    </div>
  );
}

const TransactionItem = ({
  transaction,
  setTransactions,
}: {
  transaction: Transaction;
  setTransactions: Dispatch<SetStateAction<Transaction[]>>;
}) => {
  const { session } = useSession();
  const { currency } = useAppContext();

  const { mutateAsync: queueTransactionDeletion } = useMutation({
    mutationFn: queueTransactionDeletionFunction,
  });

  const { mutate: cancelTransactionDeletion } = useMutation({
    mutationFn: cancelTransactionDeletionFunction,
  });

  const handleDelete = () => {
    toast.promise(
      queueTransactionDeletion({
        transactionId: transaction.id,
        token: session?.token || '',
      }),
      {
        loading: 'Eliminando transacción...',
        success: (response) => {
          return {
            message: `Transacción "${transaction.title}" eliminada`,
            action: {
              label: 'Deshacer',
              onClick: () => {
                cancelTransactionDeletion({
                  undoToken: response.undo_token,
                  token: session?.token || '',
                });
                setTransactions((prev: Transaction[]) => [
                  ...prev,
                  transaction,
                ]);
              },
            },
            duration: 4000,
          };
        },
        error: 'Error al eliminar transacción',
      }
    );

    // Optimistically remove the transaction
    setTransactions((prev: Transaction[]) =>
      prev.filter((t: Transaction) => t.id !== transaction.id)
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(session?.user.favorite_locale || 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const dayjs = DayjsSingleton.getInstance(
    session?.user.favorite_locale || 'en-US'
  );

  return (
    <div
      key={transaction.id}
      className="flex items-center justify-between group rounded-md relative -mx-3 py-2 px-3 hover:bg-muted"
    >
      <div className="flex flex-col items-start flex-1 min-w-0 mr-4">
        <h3 className="text-base font-medium truncate w-full">
          {transaction.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {dayjs(transaction.date).format('DD [de] MMMM')}
        </p>
      </div>

      <div className="hidden group-hover:flex items-center justify-end w-[20%]">
        <TooltipProvider delayDuration={100} skipDelayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleDelete}
                className={cn(
                  'p-2 rounded-full transition-colors',
                  'text-muted-foreground hover:text-[#EB5757] hover:bg-[#313131]'
                )}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="border-0 bg-[#313131]">
              <p>Eliminar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <span className="text-base text-right w-[15%] whitespace-nowrap">
        {formatCurrency(transaction.amount, currency)}
      </span>
    </div>
  );
};
