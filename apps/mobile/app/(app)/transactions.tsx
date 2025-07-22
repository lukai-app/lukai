'use client';

import { useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { XIcon, SearchIcon, ChevronDownIcon } from 'lucide-react-native';
import DayjsSingleton from '@/lib/Dayjs';

import { Text } from '@/components/ui/text';
import { useSession } from '@/components/auth/ctx';
import { useAppContext } from '@/components/app/app-context';
import { useTransactions } from '@/hooks/use-transactions';
import { SheetManager } from 'react-native-actions-sheet';
import { DateRange } from '@/components/app/home/mobile-date-range-picker-sheet';

function groupTransactionsBySmartDate(transactions: any[]) {
  const groups: { [key: string]: any[] } = {};

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const now = new Date();
    const daysDiff = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    let groupKey;
    if (daysDiff === 0) {
      groupKey = 'hoy';
    } else if (daysDiff === 1) {
      groupKey = 'ayer';
    } else if (daysDiff <= 7) {
      groupKey = 'esta semana';
    } else if (daysDiff <= 30) {
      groupKey = 'este mes';
    } else {
      groupKey = 'anteriormente';
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(transaction);
  });

  return groups;
}

// searchParams: {
//   tab: 'expense' | 'income',
//   category: string,
//   dateFrom: string,
//   dateTo: string,
// }
export default function TransactionsScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { session } = useSession();
  const { currency } = useAppContext();
  const dayjs = DayjsSingleton.getInstance(
    session?.user.favorite_locale || 'en-US'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'expense' | 'income'>(
    (searchParams.tab as 'expense' | 'income') ?? 'expense'
  );
  const [selectedCategory, setSelectedCategory] = useState(
    (searchParams.category as string) ?? 'all'
  );
  const now = new Date();
  const [dateFrom, setDateFrom] = useState<Date>(
    searchParams.dateFrom
      ? new Date(searchParams.dateFrom as string)
      : new Date(now.getFullYear(), now.getMonth(), 1)
  );
  const [dateTo, setDateTo] = useState<Date>(
    searchParams.dateTo
      ? new Date(searchParams.dateTo as string)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0)
  );

  const { data: transactions, isLoading } = useTransactions({
    startDate: dateFrom ?? undefined,
    endDate: dateTo ?? undefined,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    type: selectedTab,
    currency,
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(session?.user.favorite_locale || 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Filter transactions based on search query
  const filteredTransactions = useMemo(() => {
    return (
      transactions
        ?.filter((transaction) => {
          return (
            (selectedCategory === 'all' ||
              transaction.category_id === selectedCategory) &&
            transaction.type === selectedTab
          );
        })
        .filter((transaction) => {
          if (!searchQuery) return true;
          const searchTerms = searchQuery.toLowerCase();
          return (
            transaction.title.toLowerCase().includes(searchTerms) ||
            transaction.description?.toLowerCase().includes(searchTerms) ||
            transaction.account.toLowerCase().includes(searchTerms) ||
            transaction.category.toLowerCase().includes(searchTerms)
          );
        }) || []
    );
  }, [transactions, searchQuery, selectedCategory, selectedTab]);

  // Group transactions by date
  const groupedTransactions = groupTransactionsBySmartDate(
    filteredTransactions || []
  );

  // Calculate total amount
  const totalAmount =
    filteredTransactions?.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    ) || 0;

  const categories = useMemo(() => {
    if (selectedTab === 'expense') {
      return session?.user?.expense_categories || [];
    } else {
      return session?.user?.income_categories || [];
    }
  }, [
    session?.user?.expense_categories,
    session?.user?.income_categories,
    selectedTab,
  ]);

  const selectedCategoryLabel = useMemo(() => {
    if (selectedCategory === 'all') return 'categoría';

    const category = categories.find(
      (cat) =>
        cat.value === selectedCategory ||
        cat.label.toLowerCase() === selectedCategory.toLowerCase()
    );
    return category ? category.label : 'categoría';
  }, [selectedCategory, categories]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#05060A' }}
      className="pt-6 px-5"
    >
      <View className="mb-6 flex flex-row items-center gap-3 w-full mt-10">
        <Pressable
          className="rounded-full active:bg-[#1F2937] p-2 items-center justify-center"
          onPress={() => {
            const canGoBack = router.canGoBack();
            if (canGoBack) {
              router.back();
            } else {
              router.navigate('/');
            }
          }}
        >
          <XIcon className="h-5 w-5" color="white" />
        </Pressable>
        <View className="flex flex-col">
          <Text
            className="text-left text-white text-3xl"
            style={{
              fontFamily: 'Nunito_700Bold',
            }}
          >
            transacciones
          </Text>
          <Text
            className="text-xl text-[#6F757B]"
            style={{
              fontFamily: 'Nunito_700Bold',
            }}
          >
            {formatCurrency(totalAmount, currency)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center relative mb-6">
        <View className="z-10 shrink-0 absolute left-4">
          <SearchIcon color="#7F8082" className="mr-2 h-4 w-4" />
        </View>
        <TextInput
          placeholder="buscar transacciones..."
          className="flex placeholder:text-[#6F757B] text-lg text-white !h-[60px] pl-14 w-full rounded-[16px] border border-[#314157] bg-transparent px-8 leading-[17px]"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View className="flex-row gap-3 mb-6 items-center">
        <Pressable
          onPress={() => {
            SheetManager.show('date-range-picker', {
              payload: {
                selectedTab,
                date: {
                  from: dateFrom ?? undefined,
                  to: dateTo ?? undefined,
                },
                setDate: (date: DateRange) => {
                  console.log('setDate', date);
                  setDateFrom(date.from ?? dateFrom);
                  setDateTo(date.to ?? dateTo);
                },
              },
            });
          }}
          className="rounded-xl bg-[#1F2937] h-9 px-3 flex-row items-center justify-center"
        >
          <Text
            className="text-white"
            style={{
              fontFamily: 'Nunito_600SemiBold',
            }}
          >
            {dateFrom && dateTo
              ? `${dayjs(dateFrom).format('DD MMM')} - ${dayjs(dateTo).format(
                  'DD MMM'
                )}`
              : 'Selecciona fechas'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            SheetManager.show('category-selector', {
              payload: {
                selectedTab,
                selectedCategory,
                setSelectedCategory,
                mode: 'id',
              },
            });
          }}
          className="rounded-xl bg-[#1F2937] h-9 px-3 flex-row items-center justify-center"
        >
          <Text
            className="text-white mr-1"
            style={{
              fontFamily: 'Nunito_600SemiBold',
            }}
          >
            {selectedCategoryLabel}
          </Text>
        </Pressable>
        <View className="flex-row gap-1 w-20 ml-auto">
          <Pressable
            onPress={() => setSelectedTab('expense')}
            className={`flex-1 shrink-0 w-10 h-10 items-center justify-center rounded-xl ${
              selectedTab === 'expense' ? 'bg-[#F37212]' : 'bg-[#1F2937]'
            }`}
          >
            <Text
              className="text-white text-xl"
              style={{
                fontFamily: 'Nunito_600SemiBold',
              }}
            >
              -
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSelectedTab('income')}
            className={`flex-1 shrink-0 w-10 h-10 items-center justify-center rounded-xl ${
              selectedTab === 'income' ? 'bg-[#2EB88A]' : 'bg-[#1F2937]'
            }`}
          >
            <Text
              className="text-white text-xl"
              style={{
                fontFamily: 'Nunito_600SemiBold',
              }}
            >
              +
            </Text>
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-white">Cargando...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          {Object.entries(groupedTransactions).map(
            ([date, dateTransactions]) => (
              <View key={date} className="mb-6">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-[#6F757B]">{date}</Text>
                  <Text className=" text-[#6F757B] font-medium">
                    {formatCurrency(
                      dateTransactions.reduce((sum, t) => sum + t.amount, 0),
                      currency
                    )}
                  </Text>
                </View>

                <View className="flex flex-col gap-1">
                  {dateTransactions.map((transaction) => (
                    <View
                      key={transaction.id}
                      className="flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center flex-1 mr-4">
                        <View className="flex-1">
                          <Text
                            className="text-lg text-white"
                            style={{
                              fontFamily: 'Nunito_500Medium',
                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {transaction.title}
                          </Text>
                          <Text className="text-sm text-[#6F757B]">
                            {dayjs(transaction.date).format('DD [de] MMMM')}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-lg text-white">
                        {formatCurrency(transaction.amount, currency)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
