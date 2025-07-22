import { View, Text, TextInput, Pressable } from 'react-native';
import ActionSheet, { SheetProps, FlatList } from 'react-native-actions-sheet';
import { Search as SearchIcon, Check as CheckIcon } from 'lucide-react-native';
import { useState, useMemo } from 'react';
import * as ct from 'countries-and-timezones';

import { useSession } from '@/components/auth/ctx';

const TimezoneSelectorSheet = ({
  sheetId,
  payload,
}: SheetProps<'timezone-selector'>) => {
  const { session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');

  // Get all timezones
  const timezones = useMemo(() => {
    return Object.values(ct.getAllTimezones());
  }, []);

  // Use useMemo for filtered timezones to improve performance
  const filteredTimezones = useMemo(() => {
    if (!searchQuery) return timezones;

    const query = searchQuery.toLowerCase();
    return timezones.filter(
      (timezone) =>
        timezone.name.toLowerCase().includes(query) ||
        timezone.countries.some((country) =>
          country.toLowerCase().includes(query)
        )
    );
  }, [searchQuery, timezones]);

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
            zona horaria
          </Text>
        </View>

        <View className="flex-row items-center relative">
          <View className="z-10 shrink-0 absolute left-4">
            <SearchIcon color="#7F8082" className="mr-2 h-4 w-4" />
          </View>
          <TextInput
            placeholder="buscar zona horaria..."
            className="flex placeholder:text-[#6F757B] text-lg text-white !h-[64px] pl-14 w-full rounded-[16px] border border-[#314157] bg-transparent px-8 leading-[17px] file:border-0 file:bg-transparent file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={filteredTimezones}
          keyExtractor={(item) => item.name}
          className="mt-3 mb-10"
          renderItem={({ item }) => (
            <Pressable
              className="flex flex-row items-center py-4 w-full"
              onPress={() => {
                payload?.onSelect?.(item.name);
              }}
            >
              <View className="flex flex-row items-center">
                <View className="w-20 text-center bg-[#1a1a1a] rounded-full px-2 py-1 mr-3">
                  <Text
                    className="text-muted-foreground text-center font-medium"
                    style={{
                      fontFamily: 'Nunito_600SemiBold',
                    }}
                  >
                    {item.utcOffsetStr}
                  </Text>
                </View>
                <View>
                  <Text
                    className="text-lg text-white"
                    style={{
                      fontFamily: 'Nunito_600SemiBold',
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text className="text-sm text-gray-400">
                    {item.countries.join(', ')}
                  </Text>
                </View>
              </View>
              {session?.user?.favorite_timezone === item.name && (
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

export { TimezoneSelectorSheet };
