'use client';

import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  year: number;
  className?: string;
}

export const MonthSelector: React.FC<MonthSelectorProps> = (props) => {
  const { selectedMonth, setSelectedMonth, year, className } = props;

  const months = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
  };

  const handlePrevMonth = () => {
    setSelectedMonth(selectedMonth - 1);
  };

  const handleNextMonth = () => {
    setSelectedMonth(selectedMonth + 1);
  };

  return (
    <div
      className={cn(
        'overflow-x-auto overflow-hidden flex items-center gap-2',
        className
      )}
    >
      <button
        className="p-2 rounded-full hover:bg-gray-800"
        onClick={handlePrevMonth}
        disabled={selectedMonth === 0}
      >
        <ChevronLeft className="w-5 h-5 text-gray-400" />
      </button>
      <div className="grid grid-cols-12 items-center gap-16 overflow-hidden overflow-x-auto">
        {months.map((monthString, index) => (
          <button
            key={monthString}
            className={`px-4 h-[52px] w-[52px] py-2 flex flex-col items-center justify-center rounded-lg ${
              selectedMonth === index
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:bg-gray-800/50'
            }`}
            onClick={() => handleMonthChange(index)}
          >
            <div className="text-sm font-medium">{monthString}</div>
            <div className="text-xs">{year}</div>
          </button>
        ))}
      </div>
      <button
        className="p-2 rounded-full hover:bg-gray-800"
        onClick={handleNextMonth}
        disabled={selectedMonth === 11}
      >
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </button>
    </div>
  );
};
