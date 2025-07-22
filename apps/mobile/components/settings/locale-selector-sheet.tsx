import { View, Text, TextInput, Pressable } from 'react-native';
import ActionSheet, { SheetProps, FlatList } from 'react-native-actions-sheet';
import { Search as SearchIcon, Check as CheckIcon } from 'lucide-react-native';
import { useState, useMemo } from 'react';
import clm from 'country-locale-map';

import { useSession } from '@/components/auth/ctx';

type LocaleItem = {
  code: string;
  name: string;
  emoji: string;
};

const LocaleSelectorSheet = ({
  sheetId,
  payload,
}: SheetProps<'locale-selector'>) => {
  const { session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');

  // Extract locales from countries
  const locales = useMemo(() => {
    const countries = clm.getAllCountries();
    const localeMap = new Map<string, LocaleItem>();

    // Add all locales from countries
    countries.forEach((country) => {
      if (country.locales && country.locales.length > 0) {
        country.locales.forEach((locale) => {
          if (!localeMap.has(locale)) {
            localeMap.set(locale, {
              code: locale.replaceAll('_', '-'),
              name: `${country.name}`,
              emoji: country.emoji,
            });
          }
        });
      }
    });

    return Array.from(localeMap.values());
  }, []);

  // Use useMemo for filtered locales to improve performance
  const filteredLocales = useMemo(() => {
    if (!searchQuery) return locales;

    const query = searchQuery.toLowerCase();
    return locales.filter(
      (locale) =>
        locale.name.toLowerCase().includes(query) ||
        locale.code.toLowerCase().includes(query)
    );
  }, [searchQuery, locales]);

  return (
    <ActionSheet
      id={sheetId}
      gestureEnabled={true}
      indicatorStyle={{
        width: 100,
        backgroundColor: '#9CA3AF',
        marginTop: 10,
      }}
      containerStyle={{
        backgroundColor: '#05060A',
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
            configuración regional
          </Text>
        </View>

        <View className="flex-row items-center relative">
          <View className="z-10 shrink-0 absolute left-4">
            <SearchIcon color="#7F8082" className="mr-2 h-4 w-4" />
          </View>
          <TextInput
            placeholder="buscar configuración regional..."
            className="flex placeholder:text-[#6F757B] text-lg text-white !h-[64px] pl-14 w-full rounded-[16px] border border-[#314157] bg-transparent px-8 leading-[17px] file:border-0 file:bg-transparent file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={filteredLocales}
          keyExtractor={(item) => item.code}
          className="mt-3 mb-10"
          renderItem={({ item }) => (
            <Pressable
              className="flex flex-row items-center py-4 w-full"
              onPress={() => {
                payload?.onSelect?.(item.code.replaceAll('_', '-'));
              }}
            >
              <View className="flex flex-row items-center">
                <Text className="text-white text-xl mr-2">{item.emoji}</Text>
                <View>
                  <Text
                    className="text-lg text-white"
                    style={{
                      fontFamily: 'Nunito_600SemiBold',
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text className="text-sm text-gray-400">{item.code}</Text>
                </View>
              </View>
              {session?.user?.favorite_locale === item.code && (
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

export { LocaleSelectorSheet };
