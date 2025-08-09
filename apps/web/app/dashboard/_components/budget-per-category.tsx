import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
interface BudgetPerCategoryProps {
  data: Array<{
    id: string;
    category: string;
    amount: number;
    color: string;
    budget: number | null;
    image_url: string | null;
  }>;
  currency: string;
  locale: string;
  className?: string;
  onSelectCategory: (id: string) => void;
}

export const BudgetPerCategory = ({
  data,
  currency,
  locale,
  className,
  onSelectCategory,
}: BudgetPerCategoryProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Filter categories with budget and sort by spend desc
  const categoriesWithBudget = data
    .filter((category) => category.budget !== null)
    .sort((a, b) => b.amount - a.amount);

  if (categoriesWithBudget.length === 0) {
    return null;
  }

  return (
    <div className={cn('rounded-2xl p-6 border border-[#2A2A2A]', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-200">Top categories</h3>
        <a
          href="/dashboard/categories"
          className="text-sm text-blue-400 hover:underline flex items-center gap-1"
        >
          VIEW ALL <span aria-hidden>↗</span>
        </a>
      </div>

      <div className="space-y-3">
        {categoriesWithBudget.map((category) => {
          const budget = category.budget!;
          const spent = category.amount;
          const percentage = Math.min(Math.round((spent / budget) * 100), 100);

          const barColor =
            percentage >= 100
              ? 'bg-red-500'
              : percentage >= 75
                ? 'bg-[#F29D38]'
                : 'bg-[#2EB88A]';

          return (
            <button
              key={category.id}
              className="w-full hover:bg-slate-900/40 rounded-lg p-2 text-left"
              onClick={() => onSelectCategory(category.id)}
            >
              <div className="flex items-center gap-4">
                {/* Category */}
                <div className="flex items-center gap-3 min-w-0 w-[260px]">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.category}
                      className="w-8 h-8 rounded-md object-cover"
                    />
                  ) : (
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                  <span className="truncate text-slate-200">
                    {category.category}
                  </span>
                </div>

                {/* Spent */}
                <div className="shrink-0 w-[100px] text-right font-semibold text-slate-200">
                  {formatCurrency(spent)}
                </div>

                {/* Progress */}
                <div className="flex-1">
                  <Progress
                    value={percentage}
                    className="h-2 bg-slate-700"
                    progressClassName={barColor}
                  />
                </div>

                {/* Budget */}
                <div className="shrink-0 w-[100px] text-right text-slate-400">
                  {formatCurrency(budget)}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
