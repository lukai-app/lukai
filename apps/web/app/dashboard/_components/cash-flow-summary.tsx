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
    <div
      className={cn(
        'bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-slate-300">Net this month</h3>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-sm">CASH FLOW</span>
          <TrendingUp className="w-4 h-4" />
        </div>
      </div>

      {/* Net Amount */}
      <div className="mb-6">
        <div className="text-4xl font-bold text-green-400 mb-2">
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
        <div
          className={cn(
            'grid gap-6',
            showIncome && showSpend ? 'grid-cols-2' : 'grid-cols-1'
          )}
        >
          {showIncome && (
            <Progress
              value={incomePercentage}
              className="h-3 bg-slate-700"
              progressClassName="bg-blue-400"
            />
          )}
          {showSpend && (
            <Progress
              value={spendPercentage}
              className="h-3 bg-slate-700"
              progressClassName="bg-blue-300"
            />
          )}
        </div>

        {/* Labels and amounts row */}
        <div
          className={cn(
            'grid gap-6',
            showIncome && showSpend ? 'grid-cols-2' : 'grid-cols-1'
          )}
        >
          {showIncome && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-sm text-slate-300">Income</span>
              </div>
              <span className="text-lg font-semibold text-green-400">
                {formatCompactCurrency(income)}
              </span>
            </div>
          )}
          {showSpend && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                <span className="text-sm text-slate-300">Spend</span>
              </div>
              <span className="text-lg font-semibold text-slate-300">
                {formatCompactCurrency(spend)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
