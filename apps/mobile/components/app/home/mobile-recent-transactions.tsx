'use client';

import { View } from 'react-native';

import DayjsSingleton from '@/lib/Dayjs';
import { Text } from '@/components/ui/text';

interface MobileRecentTransactionsProps {
  locale: string;
  recentTransactions: {
    id: string;
    date: string;
    description: string;
    category: string;
    amount: number;
  }[];
  currency: string;
}

export const MobileRecentTransactions: React.FC<
  MobileRecentTransactionsProps
> = ({ locale, recentTransactions, currency }) => {
  const dayjs = DayjsSingleton.getInstance(locale);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <View className="w-full">
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontFamily: 'Nunito_600SemiBold',
            color: 'white',
          }}
        >
          transacciones recientes
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {recentTransactions.map((transaction) => (
          <View
            key={transaction.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View>
                <Text
                  style={{
                    color: 'white',
                    fontFamily: 'Nunito_500Medium',
                  }}
                >
                  {transaction.description}
                </Text>
                <Text
                  style={{
                    color: '#9CA3AF',
                    fontSize: 14,
                    fontFamily: 'Nunito_400Regular',
                  }}
                >
                  {dayjs(transaction.date).format('DD [de] MMMM')}
                </Text>
              </View>
            </View>
            <Text
              style={{
                color: 'white',
                fontFamily: 'Nunito_500Medium',
              }}
            >
              {formatCurrency(transaction.amount, currency)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
