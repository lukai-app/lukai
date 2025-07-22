import { useMemo, useState } from 'react';
import { CheckIcon, SearchIcon } from 'lucide-react-native';
import { View, Text, Pressable, TextInput } from 'react-native';
import ActionSheet, { SheetProps, FlatList } from 'react-native-actions-sheet';

import { useSession } from '@/components/auth/ctx';

// Common languages list
const commonLanguages = [
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'en', name: 'English', native: 'English' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'it', name: 'Italian', native: 'Italiano' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ko', name: 'Korean', native: '한국어' },
];

export const LanguageSelectorSheet: React.FC<
  SheetProps<'language-selector'>
> = ({ payload }) => {
  const { session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');

  // Use useMemo for filtered languages to improve performance
  const filteredLanguages = useMemo(() => {
    if (!searchQuery) return commonLanguages;

    return commonLanguages.filter(
      (language) =>
        language.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        language.native.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

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
            selecciona tu idioma
          </Text>
        </View>

        <View className="flex-row items-center relative">
          <View className="z-10 shrink-0 absolute left-4">
            <SearchIcon color="#7F8082" className="mr-2 h-4 w-4" />
          </View>
          <TextInput
            placeholder="buscar idioma..."
            className="flex placeholder:text-[#6F757B] text-lg text-white !h-[64px] pl-14 w-full rounded-[16px] border border-[#314157] bg-transparent px-8 leading-[17px] file:border-0 file:bg-transparent file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={filteredLanguages}
          keyExtractor={(item) => item.code}
          className="mt-3 mb-10"
          renderItem={({ item }) => (
            <Pressable
              className="flex flex-row items-center py-4 w-full"
              onPress={() => {
                payload?.onSelect?.(item.code);
              }}
            >
              <View className="flex flex-row items-center">
                <Text
                  className="text-lg text-white"
                  style={{
                    fontFamily: 'Nunito_600SemiBold',
                  }}
                >
                  {item.name}
                </Text>
                <Text className="text-sm text-gray-400 ml-2">
                  ({item.native})
                </Text>
              </View>
              {session?.user?.favorite_language === item.code && (
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
