import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { CheckIcon, SearchIcon, XIcon } from 'lucide-react-native';
import getSymbolFromCurrency from 'currency-symbol-map';
import {
  View,
  SafeAreaView,
  Text,
  Pressable,
  TextInput,
  FlatList,
} from 'react-native';

import { cn } from '@/lib/utils';
import { useSession } from '@/components/auth/ctx';
import { useAppContext } from '@/components/app/app-context';
import { currencyCodeData } from '@/lib/constants/currencies';

export default function CurrencyScreen() {
  const { session } = useSession();
  const { setCurrency, currency } = useAppContext();
  const router = useRouter();

  const [search, setSearch] = useState('');

  const filteredCurrencies = useMemo(() => {
    return Object.values(currencyCodeData).filter(
      (currency) =>
        currency.title.toLowerCase().includes(search.toLowerCase()) ||
        currency.type.toLowerCase().includes(search.toLowerCase()) ||
        currency.title.includes(search) ||
        currency.type.includes(search)
    );
  }, [search]);

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
          <XIcon className="h-5 w-5" color={'white'} />
        </Pressable>
        <Text
          className="text-left text-white text-3xl"
          style={{
            fontFamily: 'Nunito_700Bold',
          }}
        >
          moneda
        </Text>
      </View>

      <View className="flex-row items-center relative mb-6">
        <View className="z-10 shrink-0 absolute left-4">
          <SearchIcon color="#7F8082" className="mr-2 h-4 w-4" />
        </View>
        <TextInput
          placeholder="buscar moneda..."
          className="flex placeholder:text-[#6F757B] text-lg text-white !h-[64px] pl-14 w-full rounded-[16px] border border-[#314157] bg-transparent px-8 leading-[17px] file:border-0 file:bg-transparent file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {session?.user?.used_currencies &&
        session?.user?.used_currencies?.length > 0 && (
          <View>
            <Text className="text-muted-foreground text-base">
              monedas que más usas
            </Text>
            {session?.user?.used_currencies?.map((currencyOption) => {
              const currencyData = Object.values(currencyCodeData).find(
                (currencyData) => currencyData.type === currencyOption
              );
              if (!currencyData) return null;

              return (
                <Pressable
                  key={currencyData.type}
                  onPress={() => {
                    setCurrency(currencyData.type);
                  }}
                  className="!text-base py-4 px-0 cursor-pointer data-[selected=true]:bg-transparent"
                >
                  <View className="flex flex-row items-center gap-4">
                    <Text className="text-[#9CA3AF] whitespace-nowrap w-16 text-center bg-[#1a1a1a] rounded-full px-4 py-2 font-medium">
                      {currencyData.type}
                    </Text>
                    <Text className="text-base font-medium text-white">
                      {currencyData.title} (
                      {getSymbolFromCurrency(currencyData.type)})
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

      <View className="mt-6 mb-6 h-[1px] bg-[#314157]" />

      <FlatList
        data={filteredCurrencies.sort((a, b) => {
          // Put the selected currency at the top
          if (a.type === currency) return -1;
          if (b.type === currency) return 1;
          return 0;
        })}
        renderItem={({ item: currencyData }) => (
          <Pressable
            key={currencyData.type}
            onPress={() => {
              setCurrency(currencyData.type);
            }}
            className="!text-sm py-4 w-full px-0 cursor-pointer data-[selected=true]:bg-transparent"
          >
            <View className="flex flex-row items-center gap-4">
              <Text className="text-muted-foreground shrink-0 whitespace-nowrap text-center bg-[#1a1a1a] rounded-full px-4 py-2 font-medium">
                {currencyData.type}
              </Text>
              <Text className="text-base font-medium text-white">
                {currencyData.title} ({getSymbolFromCurrency(currencyData.type)}
                )
              </Text>
              <View
                className={cn(
                  'ml-auto ',
                  currency === currencyData.type ? 'opacity-100' : 'opacity-0'
                )}
              >
                <CheckIcon color="white" />
              </View>
            </View>
          </Pressable>
        )}
        keyExtractor={(item) => item.type}
        contentContainerStyle={{ gap: 16 }}
      />
    </SafeAreaView>
  );
}
