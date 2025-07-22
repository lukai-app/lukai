import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DayjsSingleton from '@/lib/helpers/Dayjs';

interface RecentTransactionsProps {
  data: Array<{
    id: string;
    date: string;
    description: string;
    category: string;
    amount: number;
  }>;
  currency: string;
  locale: string;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = (
  props
) => {
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
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead>Descripción</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead className="text-right">Monto</TableHead>
          <TableHead className="text-right">Fecha</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{transaction.description}</TableCell>
            <TableCell>{transaction.category}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(transaction.amount)}
            </TableCell>
            <TableCell className="text-right">
              {dayjs(transaction.date).format('ddd DD, MMM YYYY')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
