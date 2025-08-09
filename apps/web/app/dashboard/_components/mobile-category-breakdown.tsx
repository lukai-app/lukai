'use client';

import { Progress } from '@/components/ui/progress';

interface CategoryBreakdownItem {
  id: string;
  category: string;
  amount: number;
  color: string;
  budget?: number | null;
  image_url?: string | null;
}

interface CategoryBreakdownProps {
  data: Array<CategoryBreakdownItem>;
  onSelectCategory: (id: string) => void;
  selectedTab: 'expense' | 'income';
  currency: string;
  locale: string;
}

export const MobileCategoryBreakdown: React.FC<CategoryBreakdownProps> = (
  props
) => {
  const {
    data: chartData,
    onSelectCategory,
    selectedTab,
    currency,
    locale,
  } = props;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="w-full">
      <div className="space-y-3">
        {chartData
          .slice()
          .sort((a, b) => b.amount - a.amount)
          .map((item) => {
            const hasBudget = item.budget !== undefined && item.budget !== null;
            const percentage =
              hasBudget && item.budget! > 0
                ? Math.min(
                    Math.round((item.amount / (item.budget as number)) * 100),
                    100
                  )
                : 100;

            const barColor =
              selectedTab === 'expense'
                ? percentage >= 100
                  ? 'bg-red-500'
                  : percentage >= 75
                    ? 'bg-[#F29D38]'
                    : 'bg-[#2EB88A]'
                : 'bg-blue-400';

            return (
              <button
                key={item.id}
                className="w-full rounded-lg hover:-translate-y-1 transition-all duration-300 text-left"
                onClick={() => onSelectCategory(item.id)}
              >
                <div className="flex items-center gap-3">
                  {/* Left: Image or dot + name */}
                  <div className="flex items-center gap-2 min-w-0 w-[45%]">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.category}
                        className="w-5 h-5 rounded-md object-cover"
                      />
                    ) : (
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                    <span className="truncate text-slate-200 text-base">
                      {item.category}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="shrink-0 w-[110px] text-right font-semibold text-slate-200">
                    {formatCurrency(item.amount)}
                  </div>

                  {/* Progress */}
                  <div className="flex-1 min-w-[30%]">
                    <div className="relative">
                      <Progress
                        value={100}
                        className="h-2 bg-slate-700"
                        progressClassName={barColor}
                      />
                      <div
                        className={`absolute inset-y-0 left-0 h-2 rounded-full ${barColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
};
