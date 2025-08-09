'use client';

import DayjsSingleton from '@/lib/helpers/Dayjs';
import { useAppContext } from '@/app/dashboard/_context/app-context';
import { useSession } from '@/app/_components/session-provider';
import { getGroupLabel } from './transactions-modal';
import { cn } from '@/lib/utils';

interface MobileRecentTransactionsProps {
  locale: string;
  recentTransactions: {
    id: string;
    date: string;
    description: string;
    category: string;
    amount: number;
  }[];
  onViewAll?: () => void;
  incomeIds?: string[];
}

export const MobileRecentTransactions: React.FC<
  MobileRecentTransactionsProps
> = ({ locale, recentTransactions, onViewAll, incomeIds }) => {
  const dayjs = DayjsSingleton.getInstance(locale);
  const { currency } = useAppContext();
  const { session } = useSession();
  const incomeIdSet = new Set(incomeIds ?? []);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Group transactions using same rules as the modal and order by most recent group
  const groups = (() => {
    const map = new Map<
      string,
      { items: typeof recentTransactions; maxTs: number }
    >();
    const now = new Date();
    for (const t of recentTransactions) {
      const dateObj = new Date(t.date);
      const label = getGroupLabel(dateObj, now);
      const current = map.get(label) ?? { items: [], maxTs: 0 };
      current.items.push(t);
      current.maxTs = Math.max(current.maxTs, dateObj.getTime());
      map.set(label, current);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1].maxTs - a[1].maxTs)
      .map(([label, value]) => ({ label, ...value }));
  })();

  const categoryColor = (label: string) => {
    // Deterministic color selection based on label
    const palette = [
      'bg-teal-800/60 text-teal-200',
      'bg-green-800/50 text-green-200',
      'bg-blue-800/50 text-blue-200',
      'bg-purple-800/50 text-purple-200',
      'bg-rose-800/50 text-rose-200',
      'bg-amber-800/50 text-amber-200',
      'bg-sky-800/50 text-sky-200',
      'bg-lime-800/50 text-lime-200',
    ];
    let hash = 0;
    for (let i = 0; i < label.length; i++)
      hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
    return palette[hash % palette.length];
  };

  const getCategoryEmoji = (label: string) => {
    const key = label.toLowerCase();
    switch (key) {
      case 'transport':
      case 'transportation':
        return '🚌';
      case 'car':
      case 'auto':
        return '🚗';
      case 'entertainment':
        return '🎟️';
      case 'food':
      case 'restaurants':
        return '🍽️';
      case 'groceries':
        return '🛒';
      case 'shopping':
        return '🛍️';
      case 'travel':
        return '✈️';
      case 'housing':
      case 'rent':
        return '🏠';
      case 'insurance':
        return '🛡️';
      default:
        return '🏷️';
    }
  };

  const getCategoryImageUrl = (label: string): string | null => {
    const name = label.trim().toLowerCase();
    const expense = session?.user.expense_categories.find(
      (c) => c.label.trim().toLowerCase() === name
    )?.image_url;
    if (expense) return expense;
    const income = session?.user.income_categories.find(
      (c) => c.label.trim().toLowerCase() === name
    )?.image_url;
    return income ?? null;
  };

  const totalCount = recentTransactions.length;

  return (
    <div className={cn('rounded-2xl p-6 border border-[#2A2A2A]')}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-slate-300">
          transacciones recientes
        </h3>
        <button
          type="button"
          className="text-sm text-slate-400 hover:text-slate-200"
          onClick={onViewAll}
        >
          ver todas
        </button>
      </div>

      {/* Groups */}
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="text-xs font-semibold tracking-wide text-slate-400 mb-3">
              {group.label.toUpperCase()}
            </div>
            <div className="space-y-5">
              {group.items.map((transaction) => (
                <div
                  key={transaction.id}
                  className="grid grid-cols-[minmax(0,1fr)_120px_96px] items-center gap-3"
                >
                  {/* Description (col 1) */}
                  <div className="text-base font-medium truncate min-w-0">
                    {transaction.description}
                  </div>

                  {/* Category badge (col 2) */}
                  <div className="shrink-0 w-[120px] overflow-hidden">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-1 font-semibold whitespace-nowrap',
                        'text-[10px] uppercase tracking-wide',
                        categoryColor(transaction.category)
                      )}
                    >
                      {(() => {
                        const url = getCategoryImageUrl(transaction.category);
                        if (url) {
                          return (
                            <img
                              src={url}
                              alt={transaction.category}
                              className="mr-1 w-3.5 h-3.5 rounded-[4px] object-cover"
                            />
                          );
                        }
                        return (
                          <span className="mr-1 text-[12px] leading-none">
                            {getCategoryEmoji(transaction.category)}
                          </span>
                        );
                      })()}
                      {transaction.category}
                    </span>
                  </div>

                  {/* Amount (col 3) */}
                  <div
                    className={cn(
                      'text-base font-medium text-right w-[96px]',
                      incomeIdSet.has(transaction.id) && 'text-positive'
                    )}
                  >
                    {formatCurrency(transaction.amount, currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
