'use client';

import { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import ActionSheet, {
  SheetManager,
  SheetProps,
} from 'react-native-actions-sheet';
import DateTimePicker from 'react-native-ui-datepicker';

import { Text } from '@/components/ui/text';
import DayjsSingleton from '@/lib/Dayjs';
import { useSession } from '@/components/auth/ctx';

export interface DateRange {
  from?: Date;
  to?: Date;
}

export const MobileDateRangePicker: React.FC<
  SheetProps<'date-range-picker'>
> = (props) => {
  const { date, setDate, selectedTab } = props.payload ?? {};
  const { session } = useSession();
  const [localDate, setLocalDate] = useState<DateRange>({
    from: date?.from,
    to: date?.to,
  });

  const selectedColor = useMemo(
    () => (selectedTab === 'expense' ? '#F37212' : '#2EB88A'),
    [selectedTab]
  );

  const dayjs = DayjsSingleton.getInstance(
    session?.user.favorite_locale || 'en-US'
  );

  const QUICK_SELECTIONS = [
    {
      label: 'esta semana',
      shortLabel: 'esta semana',
      getValue: () => ({
        from: dayjs().startOf('isoWeek').toDate(),
        to: dayjs().endOf('isoWeek').toDate(),
      }),
    },
    {
      label: 'este mes',
      shortLabel: 'este mes',
      getValue: () => ({
        from: dayjs().startOf('month').toDate(),
        to: dayjs().endOf('month').toDate(),
      }),
    },
    {
      label: '7 días',
      shortLabel: '7d',
      getValue: () => ({
        from: dayjs().subtract(6, 'day').startOf('day').toDate(),
        to: dayjs().endOf('day').toDate(),
      }),
    },
    {
      label: '30 días',
      shortLabel: '30d',
      getValue: () => ({
        from: dayjs().subtract(29, 'day').startOf('day').toDate(),
        to: dayjs().endOf('day').toDate(),
      }),
    },
    {
      label: '3 meses',
      shortLabel: '3M',
      getValue: () => ({
        from: dayjs().subtract(3, 'month').startOf('day').toDate(),
        to: dayjs().endOf('day').toDate(),
      }),
    },
    {
      label: '6 meses',
      shortLabel: '6M',
      getValue: () => ({
        from: dayjs().subtract(6, 'month').startOf('day').toDate(),
        to: dayjs().endOf('day').toDate(),
      }),
    },
  ];

  const handleQuickSelection = async (
    selection: (typeof QUICK_SELECTIONS)[0]
  ) => {
    const newRange = selection.getValue();
    setDate?.(newRange);
    SheetManager.hide('date-range-picker');
  };

  const handleDateChange = async ({ startDate, endDate }: any) => {
    if (startDate && !endDate) {
      setLocalDate({
        from: dayjs(startDate).startOf('day').toDate(),
        to: undefined,
      });
    } else if (startDate && endDate) {
      setLocalDate({
        from: dayjs(startDate).startOf('day').toDate(),
        to: dayjs(endDate).endOf('day').toDate(),
      });
    }
  };

  return (
    <ActionSheet
      id="date-range-picker"
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
      <View className="bg-black px-6">
        <Text
          className="text-left text-white text-4xl mr-auto mt-8"
          style={{
            fontFamily: 'Nunito_800ExtraBold',
          }}
        >
          rango de fechas
        </Text>

        <View className="bg-[#1a1a1a] rounded-3xl mb-4 p-6 !h-fit mt-4">
          <View className="flex-row flex-wrap gap-2 mb-6">
            {QUICK_SELECTIONS.map((selection) => (
              <Pressable
                key={selection.label}
                onPress={() => handleQuickSelection(selection)}
                className="flex-1 min-w-[30%] rounded-xl py-4 bg-[#2A2A2A]"
              >
                <Text
                  className="text-white text-center"
                  style={{
                    fontFamily: 'Nunito_600SemiBold',
                  }}
                >
                  {selection.shortLabel}
                </Text>
              </Pressable>
            ))}
          </View>

          <DateTimePicker
            mode="range"
            startDate={localDate?.from}
            endDate={localDate?.to}
            onChange={handleDateChange}
            firstDayOfWeek={1}
            styles={{
              day: {
                borderRadius: 8,
              },
              day_label: {
                color: 'white',
                fontFamily: 'Nunito_400Regular',
              },
              month_selector_label: {
                color: 'white',
                fontFamily: 'Nunito_600SemiBold',
                fontSize: 16,
                textTransform: 'lowercase',
              },
              year_selector_label: {
                color: 'white',
                fontFamily: 'Nunito_600SemiBold',
                fontSize: 16,
              },
              year_label: {
                color: 'white',
                fontFamily: 'Nunito_600SemiBold',
                fontSize: 16,
              },
              weekday_label: {
                color: 'white',
                fontFamily: 'Nunito_400Regular',
              },
              today_label: {
                color: selectedColor,
              },
              selected_label: {
                color: 'white',
              },
              selected: {
                backgroundColor: selectedColor,
              },
              range_middle: {
                backgroundColor: `${selectedColor}40`,
              },
              range_middle_label: {
                color: 'white',
              },
              range_start: {
                backgroundColor: selectedColor,
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
              },
              range_start_label: {
                color: 'white',
              },
              range_end: {
                backgroundColor: selectedColor,
                borderTopRightRadius: 8,
                borderBottomRightRadius: 8,
              },
              range_end_label: {
                color: 'white',
              },
              button_next: {
                color: 'white',
              },
              button_prev: {
                color: 'white',
              },
            }}
          />

          <View className="flex-row gap-3 mt-6">
            <Pressable
              onPress={() => {
                SheetManager.hide('date-range-picker');
              }}
              className="flex-1 py-4 bg-[#2A2A2A] rounded-xl"
            >
              <Text
                className="text-white text-center text-lg"
                style={{
                  fontFamily: 'Nunito_600SemiBold',
                }}
              >
                cancelar
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (localDate?.from && localDate?.to) {
                  setDate?.({
                    from: localDate.from,
                    to: localDate.to,
                  });
                  SheetManager.hide('date-range-picker');
                }
              }}
              className={`flex-1 py-4 rounded-xl ${
                localDate?.from && localDate?.to
                  ? 'bg-yc-500'
                  : 'bg-[#2A2A2A] opacity-50'
              }`}
              disabled={!localDate?.from || !localDate?.to}
            >
              <Text
                className="text-white text-center text-lg "
                style={{
                  fontFamily: 'Nunito_600SemiBold',
                }}
              >
                confirmar
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ActionSheet>
  );
};
