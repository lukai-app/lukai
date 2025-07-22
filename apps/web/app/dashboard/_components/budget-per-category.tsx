import { Gauge } from '@/components/ui/gauge';
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

  // Filter categories with budget
  const categoriesWithBudget = data.filter(
    (category) => category.budget !== null
  );

  if (categoriesWithBudget.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-wrap gap-4',
        categoriesWithBudget.length > 2 ? 'justify-between' : '',
        className
      )}
    >
      {categoriesWithBudget.map((category) => {
        const budget = category.budget!;
        const spent = category.amount;
        const remaining = budget - spent;
        const percentage = Math.min(Math.round((spent / budget) * 100), 100);

        // Color logic based on percentage
        let circleClassName = 'text-[hsla(131,41%,46%,1)]'; // Green for < 75%
        if (percentage >= 100) {
          circleClassName = 'text-red-500'; // Red for over budget
        } else if (percentage >= 75) {
          circleClassName = 'text-yellow-500'; // Yellow for >= 75%
        }

        return (
          <button
            key={category.id}
            className="flex flex-col items-center justify-center gap-2"
            onClick={() => onSelectCategory(category.id)}
          >
            <Gauge
              value={percentage}
              size="medium"
              showValue={false}
              circleClassName={circleClassName}
              backgroundClassName="text-[#333]"
              children={
                <div className="absolute flex opacity-0 animate-gauge_fadeIn">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.category}
                      className="w-5 h-5"
                    />
                  ) : (
                    <p className="text-xs">{category.category}</p>
                  )}
                </div>
              }
            />
            <div className="text-xs text-center">
              {remaining < 0 ? (
                <span className="">
                  {formatCurrency(Math.abs(remaining))} <br />
                  sobregiro
                </span>
              ) : (
                <span className="">
                  {formatCurrency(remaining)} <br />
                  restante
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
