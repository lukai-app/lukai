'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface BudgetProgressProps {
  currency: string;
  locale: string;
  budgetUsed: number;
  budgetTotal: number;
  className?: string;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = (props) => {
  const { currency, locale, budgetTotal, budgetUsed, className } = props;

  const percentageUsed = useMemo(() => {
    return budgetTotal > 0
      ? Math.round((budgetUsed / budgetTotal) * 100 * 100) / 100
      : 0;
  }, [budgetUsed, budgetTotal]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">Presupuesto Total</p>
          <p className="text-2xl font-bold">{formatCurrency(budgetTotal)}</p>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-sm font-medium">Utilizado</p>
          <p className="text-2xl font-bold">{formatCurrency(budgetUsed)}</p>
        </div>
      </div>
      <Progress value={percentageUsed} className="h-3" />
      <p className="text-sm text-muted-foreground text-center">
        {percentageUsed}% del presupuesto utilizado
      </p>
    </div>
  );
};
