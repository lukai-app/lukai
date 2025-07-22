import { Card, CardContent } from '@/components/ui/card';
import { Gauge } from '@/components/ui/gauge';

interface HighestExpenseCategoryProps {
  category: string;
  amount: number;
  percentage: number;
  currency: string;
  locale: string;
}

export const HighestExpenseCategory: React.FC<HighestExpenseCategoryProps> = (
  props
) => {
  const { category, amount, percentage, currency, locale } = props;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">
            Categoría con mayor gasto
          </p>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">{category}</h3>
              <p className="text-xl font-bold">{formatCurrency(amount)}</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Gauge value={percentage} size="medium" showValue={true} />
              <div>
                <p className="text-sm text-center font-medium text-muted-foreground">
                  % del total de tus gastos
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
