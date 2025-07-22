import { SheetManager } from 'react-native-actions-sheet';
import { Pressable, View, Text, Animated, Easing } from 'react-native';
import { ChevronRight, LucideLoader2 } from 'lucide-react-native';
import Toast from 'react-native-root-toast';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { useSession } from '@/components/auth/ctx';
import { env } from '@/env';

interface UpdateCurrencyResponse {
  success: boolean;
  message: string;
  data?: {
    favorite_currency_code: string;
  };
}

const updateCurrencyFunction = async (params: {
  currency_code: string;
  token: string;
}) => {
  const response = (await fetch(
    `${env.EXPO_PUBLIC_API_URL}/v1/users/update-currency`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.EXPO_PUBLIC_API_KEY,
        Authorization: `Bearer ${params.token}`,
      },
      body: JSON.stringify({ currency_code: params.currency_code }),
    }
  ).then((res) => res.json())) as UpdateCurrencyResponse;

  if (!response.success) {
    throw new Error(response.message || 'Failed to update currency');
  }

  return response;
};

export const CurrencySelectorTrigger = () => {
  const { session, signIn } = useSession();
  const spinValue = useRef(new Animated.Value(0)).current;

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const { isPending, mutateAsync: updateCurrency } = useMutation({
    mutationFn: updateCurrencyFunction,
    onError: (error) => {
      console.error(error);
      Toast.show(error.message);
    },
    onSuccess: (response) => {
      Toast.show(response.message || 'Moneda actualizada con éxito');
      if (response.success && response.data && session) {
        // Update session with new currency
        signIn({
          ...session,
          user: {
            ...session.user,
            favorite_currency_code: response.data.favorite_currency_code,
          },
        });
      }
    },
  });

  useEffect(() => {
    if (isPending) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [isPending, spinValue]);

  // Get the currency symbol
  const getCurrencySymbol = (currency: string) => {
    try {
      const formatter = new Intl.NumberFormat(
        session?.user?.favorite_locale ?? 'es-PE',
        {
          style: 'currency',
          currency,
          minimumFractionDigits: 0,
        }
      );
      return formatter.format(0).replace(/[0-9]/g, '').trim();
    } catch (error) {
      return '';
    }
  };

  return (
    <Pressable
      className="flex flex-row items-center justify-between p-4 disabled:opacity-50"
      disabled={isPending}
      onPress={() => {
        SheetManager.show('currency-selector', {
          payload: {
            onSelect: (currencyCode: string) => {
              SheetManager.hide('currency-selector');
              updateCurrency({
                currency_code: currencyCode,
                token: session?.token ?? '',
              });
            },
          },
        });
      }}
    >
      <View className="flex flex-row items-center">
        <View className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mr-4">
          <Text className="text-green-500 text-xl">$</Text>
        </View>
        <View>
          <Text
            className="text-lg text-white"
            style={{
              fontFamily: 'Nunito_600SemiBold',
            }}
          >
            moneda predeterminada
          </Text>
          <Text className="text-sm text-gray-400">
            {session?.user?.favorite_currency_code
              ? `${session?.user?.favorite_currency_code} (${getCurrencySymbol(
                  session?.user?.favorite_currency_code
                )})`
              : 'Seleccionar moneda'}
          </Text>
        </View>
      </View>
      {isPending ? (
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <LucideLoader2 size={20} color="white" />
        </Animated.View>
      ) : (
        <ChevronRight color="white" size={20} />
      )}
    </Pressable>
  );
};
