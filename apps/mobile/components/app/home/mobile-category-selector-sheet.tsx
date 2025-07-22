'use client';

import { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import ActionSheet, {
  SheetManager,
  SheetProps,
  ScrollView,
} from 'react-native-actions-sheet';

import { Text } from '@/components/ui/text';
import { useSession } from '@/components/auth/ctx';

export const MobileCategorySelector: React.FC<
  SheetProps<'category-selector'>
> = (props) => {
  const {
    selectedTab,
    selectedCategory,
    setSelectedCategory,
    showAll = true,
    mode = 'label',
  } = props.payload ?? {};
  const { session } = useSession();

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

  const allCategories = useMemo(() => {
    if (!showAll) return categories;
    return [{ label: 'todas', value: 'all' }, ...categories];
  }, [categories, showAll]);

  return (
    <ActionSheet
      id="category-selector"
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
      <ScrollView className="bg-black px-6">
        <Text
          className="text-left text-white text-4xl mr-auto mt-8"
          style={{
            fontFamily: 'Nunito_800ExtraBold',
          }}
        >
          categorías
        </Text>

        <View className="bg-[#1a1a1a] rounded-3xl mb-4 p-6 !h-fit mt-4">
          <View className="flex-row flex-wrap gap-2">
            {allCategories.map((category) => (
              <Pressable
                key={category.value}
                onPress={() => {
                  setSelectedCategory?.(
                    mode === 'id' ? category.value : category.label
                  );
                  SheetManager.hide('category-selector');
                }}
                className={`
                    py-8 w-[30%] rounded-2xl flex items-center justify-center text-xl text-center transition-colors
                    ${
                      selectedCategory ===
                      (mode === 'id' ? category.value : category.label)
                        ? selectedTab === 'expense'
                          ? 'bg-[#F37212]'
                          : 'bg-[#2EB88A]'
                        : ''
                    }
                  `}
              >
                <Text
                  className="text-white text-lg text-center"
                  style={{
                    fontFamily:
                      selectedCategory ===
                      (mode === 'id' ? category.value : category.label)
                        ? 'Nunito_800ExtraBold'
                        : 'Nunito_600SemiBold',
                  }}
                >
                  {category.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </ActionSheet>
  );
};
