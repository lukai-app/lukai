import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

export const CashFlow: React.FC<CashFlowProps> = (props) => {
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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">flujo de caja</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              {data.map((row) => (
                <TableHead key={row.month} className="text-right">
                  {dayjs().month(Number(row.month)).format('MMM')}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Ingresos</TableCell>
              {data.map((row) => (
                <TableCell key={row.month} className="text-right">
                  {row.income ? formatCurrency(row.income) : '-'}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>Gastos</TableCell>
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
              <TableCell>Flujo de Caja</TableCell>
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
              <TableCell>Flujo Acumulado</TableCell>
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
