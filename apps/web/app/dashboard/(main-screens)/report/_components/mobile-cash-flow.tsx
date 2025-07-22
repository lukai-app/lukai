import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DayjsSingleton from '@/lib/helpers/Dayjs';

interface CashFlowProps {
  data: Array<{
    month: string;
    income: number;
    expenses: number;
    fixed: number;
    flow: number;
    accumulated: number;
  }>;
  currency: string;
  locale: string;
  year: number;
}

export const MobileCashFlow: React.FC<CashFlowProps> = (props) => {
  const { data, currency, locale } = props;
  const dayjs = DayjsSingleton.getInstance(locale);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="px-4">
      <p className="text-muted-foreground mb-1 text-sm">flujo de caja</p>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-10 bg-[#05060A]"></TableHead>
              {data.map((row) => (
                <TableHead key={row.month} className="text-right">
                  {dayjs().month(Number(row.month)).format('MMM')}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="sticky left-0 z-10 bg-[#05060A]">
                ingresos
              </TableCell>
              {data.map((row) => (
                <TableCell key={row.month} className="text-right">
                  {row.income ? formatCurrency(row.income) : '-'}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="sticky left-0 z-10 bg-[#05060A]">
                gastos
              </TableCell>
              {data.map((row) => (
                <TableCell key={row.month} className="text-right">
                  {row.expenses ? formatCurrency(row.expenses) : '-'}
                </TableCell>
              ))}
            </TableRow>
            {/* <TableRow>
                <TableCell>Fijos</TableCell>
                {data.map((row) => (
                  <TableCell key={row.month} className="text-right">
                    {row.fixed ? formatCurrency(row.fixed) : '-'}
                  </TableCell>
                ))}
              </TableRow> */}
            <TableRow>
              <TableCell className="sticky left-0 z-10 bg-[#05060A]">
                flujo de caja
              </TableCell>
              {data.map((row) => (
                <TableCell
                  key={row.month}
                  className={`text-right whitespace-nowrap ${
                    row.flow < 0 ? 'text-red-500' : 'text-green-500'
                  }`}
                >
                  {row.flow ? formatCurrency(row.flow) : '-'}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="sticky left-0 z-10 bg-[#05060A]">
                flujo acumulado
              </TableCell>
              {data.map((row) => (
                <TableCell
                  key={row.month}
                  className="text-right whitespace-nowrap font-medium"
                >
                  {row.accumulated ? formatCurrency(row.accumulated) : '-'}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
