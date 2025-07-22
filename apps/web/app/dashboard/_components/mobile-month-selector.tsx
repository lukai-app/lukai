'use client';
import { useMemo, useState } from 'react';
import { useAppContext } from '@/app/dashboard/_context/app-context';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import DayjsSingleton from '@/lib/helpers/Dayjs';
import { ChevronDownIcon } from 'lucide-react';
import { useAnalytics } from '@/app/dashboard/_hooks/use-analytics';

interface MobileMonthSelectorProps {
  locale: string;
  selectedTab: 'expense' | 'income';
  showAmount?: boolean;
  className?: string;
}

const months = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

export const MobileMonthSelector: React.FC<MobileMonthSelectorProps> = (
  props
) => {
  const { locale, selectedTab, showAmount = true, className } = props;
  const [isOpen, setIsOpen] = useState(false);

  const { year, month, setMonth, setYear, currency } = useAppContext();
  const { data } = useAnalytics({
    year,
    currency,
    month,
  });

  const dayjs = DayjsSingleton.getInstance(locale);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale ?? 'es-PE', {
      style: 'currency',
      currency: currency ?? 'PEN',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const displayText = useMemo(() => {
    const isCurrentMonth =
      month === new Date().getMonth() && year === new Date().getFullYear();

    return isCurrentMonth
      ? 'este mes'
      : `${dayjs().year(year).month(month).format('MMMM')} ${year}`;
  }, [month, year, dayjs]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className={className}>
          {displayText} <ChevronDownIcon className="w-4 h-4 ml-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#05060A] border">
        <DialogHeader>
          <DialogTitle className="text-left text-3xl font-bold">
            mes
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto mt-6 mb-4">
          <div className="flex space-x-3">
            {[2025].map((year) => (
              <button
                key={year}
                onClick={() => setYear(year)} // Reset month selection when changing year
                className={`
                rounded-full bg-[#1a1a1a] px-6 py-3 text-xl font-semibold whitespace-nowrap
                ${year === 2025 ? 'bg-[#333333]' : ''}
              `}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-3xl mb-4 p-6 max-w-md">
          <div className="grid grid-cols-3 gap-8">
            {months.map((monthString, index) => (
              <button
                key={monthString}
                onClick={() => {
                  setMonth(index);
                  setIsOpen(false);
                }}
                className={`
                py-6 rounded-xl text-xl text-center transition-colors
                ${
                  month === index
                    ? `font-bold ${
                        selectedTab === 'expense' ? 'bg-yc-700' : 'bg-lemon-950'
                      }`
                    : 'font-medium'
                }
              `}
              >
                {monthString}
                {showAmount && (
                  <p className="text-sm px-2 font-normal text-muted-foreground text-center">
                    {data?.yearData.annualSummary.find(
                      (summary) => summary.month === index
                    )?.[selectedTab === 'expense' ? 'expense' : 'income']
                      ? formatCurrency(
                          data?.yearData.annualSummary.find(
                            (summary) => summary.month === index
                          )?.[
                            selectedTab === 'expense' ? 'expense' : 'income'
                          ] ?? 0
                        )
                      : ''}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
