'use client';
import { Text } from '@/components/ui/text';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useWeeklyCashFlow } from '../_hooks/use-weekly-cashflow';
import { useAppContext } from '@/app/dashboard/_context/app-context';
import { useSession } from '@/app/_components/session-provider';
import { MonthSelector } from '@/app/dashboard/_components/month-selector';

interface Week {
  id: string;
  weekNumber: number;
  dateRange: string;
  startDate: Date;
  endDate: Date;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  weekId: string;
  created_at: string;
  category?: string;
}

interface Category {
  id: string;
  name: string;
  items: Transaction[];
}

interface CategorySectionProps {
  category: Category;
  weeks: Week[];
  currency: string;
  locale: string;
}

export default function CashflowPage() {
  const { session } = useSession();
  const { currency, month, setMonth, year } = useAppContext();
  const { data: cashFlowData, isLoading, error } = useWeeklyCashFlow();

  return (
    <div className="flex flex-col min-h-screen">
      <Text variant="h2" className="mt-10 mb-5">
        Flujo de caja
      </Text>

      <MonthSelector
        selectedMonth={month}
        setSelectedMonth={setMonth}
        year={year}
      />

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="py-8 text-center">Cargando datos...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">{error.message}</div>
        ) : cashFlowData ? (
          <Table className="border-collapse">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/6">Total</TableHead>
                <TableHead className="w-1/3">Categoría</TableHead>
                {cashFlowData.weeks.map((week) => (
                  <TableHead key={week.id} className="w-1/6 whitespace-nowrap">
                    <div>{week.dateRange}</div>
                    <div className="text-sm font-normal">
                      Semana {week.weekNumber}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            {/* <TableBody>
              <CategorySection
                category={
                  cashFlowData.categories.find((c) => c.name === 'Ingresos')!
                }
                weeks={cashFlowData.weeks}
                currency={currency}
                locale={session?.user.favorite_locale || 'es-PE'}
              />

              {cashFlowData.categories
                .filter((c) => c.name !== 'Ingresos')
                .map((category) => (
                  <CategorySection
                    key={category.id}
                    category={category}
                    weeks={cashFlowData.weeks}
                    currency={currency}
                    locale={session?.user.favorite_locale || 'es-PE'}
                  />
                ))}

              <TableRow>
                <TableCell className="text-right">
                  {formatCurrency({
                    value: calculateTotalBalance(cashFlowData.categories),
                    locale: session?.user.favorite_locale || 'es-PE',
                    currency: currency,
                  })}
                </TableCell>
                <TableCell>Balance Total</TableCell>
                {cashFlowData.weeks.map((week) => (
                  <TableCell key={week.id} className="text-right">
                    {formatCurrency({
                      value: calculateWeekBalance(
                        cashFlowData.categories,
                        week.id
                      ),
                      locale: session?.user.favorite_locale || 'es-PE',
                      currency: currency,
                    })}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody> */}
          </Table>
        ) : null}
      </div>
    </div>
  );
}

function CategorySection({
  category,
  weeks,
  currency,
  locale,
}: CategorySectionProps) {
  const categoryTotal = category.items.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return (
    <>
      {/* Category header */}
      <TableRow>
        <TableCell className="text-right">
          {formatCurrency({
            value: categoryTotal,
            locale: locale,
            currency: currency,
          })}
        </TableCell>
        <TableCell>{category.name}</TableCell>
        {weeks.map((week) => {
          const weekTotal = category.items
            .filter((item) => item.weekId === week.id)
            .reduce((sum, item) => sum + item.amount, 0);
          return (
            <TableCell key={week.id} className="text-right">
              {formatCurrency({
                value: weekTotal,
                locale: locale,
                currency: currency,
              })}
            </TableCell>
          );
        })}
      </TableRow>

      {/* Individual transactions */}
      {category.items.map((item) => (
        <TableRow key={item.id}>
          <TableCell className="text-right">
            {formatCurrency({
              value: item.amount,
              locale: locale,
              currency: currency,
            })}
          </TableCell>
          <TableCell className="pl-12">{item.description}</TableCell>
          {weeks.map((week) => (
            <TableCell key={week.id} className="text-right">
              {item.weekId === week.id
                ? formatCurrency({
                    value: item.amount,
                    locale: locale,
                    currency: currency,
                  })
                : formatCurrency({
                    value: 0,
                    locale: locale,
                    currency: currency,
                  })}
            </TableCell>
          ))}
        </TableRow>
      ))}

      {/* Spacer row */}
      <TableRow>
        <TableCell className="h-2" colSpan={2 + weeks.length}></TableCell>
      </TableRow>
    </>
  );
}

const formatCurrency = ({
  value,
  locale,
  currency,
}: {
  value: number;
  locale: string;
  currency: string;
}) => {
  return new Intl.NumberFormat(locale ?? 'es-PE', {
    style: 'currency',
    currency: currency ?? 'PEN',
  }).format(value);
};

function calculateTotalBalance(categories: Category[]): number {
  const income =
    categories
      .find((c) => c.name === 'Ingresos')
      ?.items.reduce((sum, item) => sum + item.amount, 0) || 0;
  const expenses = categories
    .filter((c) => c.name !== 'Ingresos')
    .reduce(
      (sum, category) =>
        sum + category.items.reduce((catSum, item) => catSum + item.amount, 0),
      0
    );
  return income - expenses;
}

function calculateWeekBalance(categories: Category[], weekId: string): number {
  const income =
    categories
      .find((c) => c.name === 'Ingresos')
      ?.items.filter((item) => item.weekId === weekId)
      .reduce((sum, item) => sum + item.amount, 0) || 0;

  const expenses = categories
    .filter((c) => c.name !== 'Ingresos')
    .reduce(
      (sum, category) =>
        sum +
        category.items
          .filter((item) => item.weekId === weekId)
          .reduce((catSum, item) => catSum + item.amount, 0),
      0
    );

  return income - expenses;
}
