import clm from 'country-locale-map';
import { useMemo, useState } from 'react';
import { CheckIcon, SearchIcon } from 'lucide-react-native';
import { View, Text, Pressable, TextInput } from 'react-native';
import ActionSheet, { SheetProps, FlatList } from 'react-native-actions-sheet';

import { useSession } from '@/components/auth/ctx';

export const CountrySelectorSheet: React.FC<SheetProps<'country-selector'>> = ({
  payload,
}) => {
  const { session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const countries = clm.getAllCountries();

  // Use useMemo for filtered countries to improve performance
  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;

    return countries.filter((country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, countries]);

  return (
    <ActionSheet
      gestureEnabled={true}
      indicatorStyle={{
        width: 100,
        backgroundColor: '#9CA3AF',
        marginTop: 10,
      }}
      containerStyle={{
        backgroundColor: '#05060A',
        height: '70%',
      }}
    >
      <View className="bg-[#05060A] px-6">
        <View className="flex flex-row items-center justify-between mb-4 mt-8">
          <Text
            className="text-center text-white text-3xl"
            style={{
              fontFamily: 'Nunito_800ExtraBold',
            }}
          >
            selecciona tu país
          </Text>
        </View>

        <View className="flex-row items-center relative">
          <View className="z-10 shrink-0 absolute left-4">
            <SearchIcon color="#7F8082" className="mr-2 h-4 w-4" />
          </View>
          <TextInput
            placeholder="buscar moneda..."
            className="flex placeholder:text-[#6F757B] text-lg text-white !h-[64px] pl-14 w-full rounded-[16px] border border-[#314157] bg-transparent px-8 leading-[17px] file:border-0 file:bg-transparent file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={filteredCountries}
          keyExtractor={(item) => item.alpha2}
          className="mt-3 mb-10"
          renderItem={({ item }) => (
            <Pressable
              className="flex flex-row items-center py-4 w-full"
              onPress={() => {
                payload?.onSelect?.(item);
              }}
            >
              <View className="flex flex-row items-center">
                <Text className="text-white text-xl mr-2">{item.emoji}</Text>
                <Text
                  className="text-lg text-white"
                  style={{
                    fontFamily: 'Nunito_600SemiBold',
                  }}
                >
                  {item.name}
                </Text>
              </View>
              {session?.user?.country_code === item.alpha2 && (
                <View className="ml-auto">
                  <CheckIcon color="green" className="h-5 w-5" />
                </View>
              )}
            </Pressable>
          )}
        />
      </View>
    </ActionSheet>
  );
};
