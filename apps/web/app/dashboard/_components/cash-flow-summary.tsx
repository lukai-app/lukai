'use client';

import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';

interface CashFlowSummaryProps {
  netAmount: number;
  income: number;
  spend: number;
  previousPeriodAmount?: number;
  previousPeriodLabel?: string;
  currency: string;
  locale: string;
  className?: string;
}

export const CashFlowSummary: React.FC<CashFlowSummaryProps> = ({
  netAmount,
  income,
  spend,
  previousPeriodAmount,
  previousPeriodLabel,
  currency,
  locale,
  className,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatCompactCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      notation: 'compact',
    }).format(value);
  };

  // Calculate percentage change
  const percentageChange = previousPeriodAmount
    ? ((netAmount - previousPeriodAmount) / Math.abs(previousPeriodAmount)) *
      100
    : 0;

  const isPositiveChange = percentageChange >= 0;

  // Calculate progress bar values based on the larger amount
  const maxAmount = Math.max(income, spend);
  const incomePercentage = maxAmount > 0 ? (income / maxAmount) * 100 : 0;
  const spendPercentage = maxAmount > 0 ? (spend / maxAmount) * 100 : 0;

  // Determine which bars to show
  const showIncome = income > 0;
  const showSpend = spend > 0;

  return (
    <div className={cn('rounded-2xl p-6 border border-[#2A2A2A]', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-slate-300">
          tus gastos vs ingresos
        </h3>
      </div>

      {/* Net Amount */}
      <div className="mb-6">
        <div className="text-4xl font-bold mb-2">
          {formatCompactCurrency(netAmount)}
        </div>

        {/* Comparison with previous period */}
        {previousPeriodAmount !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <div
              className={cn(
                'px-2 py-1 rounded-md flex items-center gap-1',
                isPositiveChange
                  ? 'bg-green-900/30 text-green-400'
                  : 'bg-red-900/30 text-red-400'
              )}
            >
              <span className={isPositiveChange ? '↗' : '↘'}>
                {isPositiveChange ? '+' : ''}
                {percentageChange.toFixed(2)}%
              </span>
            </div>
            <span className="text-slate-400">
              vs {formatCurrency(previousPeriodAmount)}{' '}
              {previousPeriodLabel || 'previous period'}
            </span>
          </div>
        )}
      </div>

      {/* Progress Bars */}
      <div className="space-y-4">
        {/* Progress bars row */}
        <div className={cn('flex gap-2')}>
          {showIncome && (
            <Progress
              value={100}
              className={cn('h-3 bg-slate-700')}
              style={{
                width: `${incomePercentage}%`,
              }}
              progressClassName="bg-[#2EB88A]"
            />
          )}
          {showSpend && (
            <Progress
              value={100}
              className={cn('h-3 bg-slate-700')}
              style={{
                width: `${spendPercentage}%`,
              }}
              progressClassName="bg-[#F37212]"
            />
          )}
        </div>

        {/* Labels and amounts row */}
        <div className={cn('flex gap-6')}>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-slate-300">Income</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-positive" />
              <span className="font-semibold text-positive">
                {formatCompactCurrency(income)}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-slate-300">Spend</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yc" />
              <span className="font-semibold">
                {formatCompactCurrency(spend)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
