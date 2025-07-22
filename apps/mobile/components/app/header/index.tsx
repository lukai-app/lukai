'use client';
import { Link, useRouter } from 'expo-router';
import { SettingsIcon } from 'lucide-react-native';
import { View, Image, Text, Pressable } from 'react-native';
import getSymbolFromCurrency from 'currency-symbol-map';

import { useAppContext } from '@/components/app/app-context';
import { mixpanelApp } from '@/lib/tools/mixpanel';
import { ANALYTICS_EVENTS } from '@/lib/analytics/constants';
import { useSession } from '@/components/auth/ctx';

export const Header = () => {
  const { currency } = useAppContext();
  const { session } = useSession();
  const router = useRouter();

  return (
    <View className="w-full flex-row items-center justify-between mt-12 mb-4 relative">
      <Pressable
        onPress={() => {
          mixpanelApp.track(ANALYTICS_EVENTS.CURRENCY, {
            distinct_id: session?.user?.phone_number,
          });

          router.push('/currency');
        }}
        className="rounded-full active:bg-[#1F2937]  px-3 h-9 items-center justify-center"
      >
        <Text className="text-white font-bold ">
          {currency} ({getSymbolFromCurrency(currency)})
        </Text>
      </Pressable>

      <View className="absolute left-1/2 -translate-x-1/2 ml-2.5">
        <Image
          source={require('@/assets/images/white-transparent.png')}
          style={{ width: 52, height: 52 }}
          resizeMode="contain"
          className="object-contain"
        />
      </View>

      <Pressable
        onPress={() => {
          mixpanelApp.track(ANALYTICS_EVENTS.SETTINGS, {
            distinct_id: session?.user?.phone_number,
          });

          router.push('/settings');
        }}
        className="rounded-full active:bg-[#1F2937] w-10 h-10 items-center justify-center"
      >
        <SettingsIcon size={20} color="white" />
      </Pressable>
    </View>
  );
};
