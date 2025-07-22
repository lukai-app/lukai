'use client';

import DayjsSingleton from '@/lib/helpers/Dayjs';
import { useAppContext } from '@/app/dashboard/_context/app-context';

interface MobileRecentTransactionsProps {
  locale: string;
  recentTransactions: {
    id: string;
    date: string;
    description: string;
    category: string;
    amount: number;
  }[];
}

export const MobileRecentTransactions: React.FC<
  MobileRecentTransactionsProps
> = ({ locale, recentTransactions }) => {
  const dayjs = DayjsSingleton.getInstance(locale);
  const { currency } = useAppContext();

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">
          transacciones recientes
        </h2>
      </div>

      <div className="space-y-4">
        {recentTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <div>
                <h3 className="text-white font-medium">
                  {transaction.description}
                </h3>
                <p className="text-zinc-400 text-sm">
                  {dayjs(transaction.date).format('DD [de] MMMM')}
                </p>
              </div>
            </div>
            <span className="text-white font-medium">
              {formatCurrency(transaction.amount, currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
