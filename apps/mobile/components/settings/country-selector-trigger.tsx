import { SheetManager } from 'react-native-actions-sheet';
import { Pressable, View, Text, Animated, Easing } from 'react-native';
import { ChevronRight, LucideLoader2 } from 'lucide-react-native';
import clm from 'country-locale-map';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-root-toast';
import { useEffect, useRef } from 'react';

import { useSession } from '@/components/auth/ctx';
import { env } from '@/env';

interface UpdateCountryResponse {
  success: boolean;
  message: string;
  data?: {
    country_code: string;
  };
}

export interface Country {
  name: string;
  alpha2: string;
  alpha3: string;
  numeric: string;
  locales: string[];
  default_locale: string;
  currency: string;
  currency_name: string;
  languages: string[];
  capital: string;
  emoji: string;
  emojiU: string;
  fips: string;
  internet: string;
  continent: string;
  region: string;
  alternate_names?: string[];
  latitude?: number;
  longitude?: number;
}

const updateCountryFunction = async (params: {
  country_code: string;
  token: string;
}) => {
  const response = (await fetch(
    `${env.EXPO_PUBLIC_API_URL}/v1/users/update-country`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.EXPO_PUBLIC_API_KEY,
        Authorization: `Bearer ${params.token}`,
      },
      body: JSON.stringify({ country_code: params.country_code }),
    }
  ).then((res) => res.json())) as UpdateCountryResponse;

  if (!response.success) {
    throw new Error(response.message || 'Failed to update country');
  }

  return response;
};

export const CountrySelectorTrigger = () => {
  const { session, signIn } = useSession();
  const spinValue = useRef(new Animated.Value(0)).current;

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const { isPending, mutateAsync: updateCountry } = useMutation({
    mutationFn: updateCountryFunction,
    onError: (error: any) => {
      console.error(error);
      Toast.show(error.message);
    },
    onSuccess: (response) => {
      Toast.show(response.message || 'País actualizado con éxito');
      if (response.success && response.data && session) {
        // Update session with new country code
        signIn({
          ...session,
          user: {
            ...session.user,
            country_code: response.data.country_code,
          },
        });
      }
    },
  });

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (isPending) {
      animation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animation.start();
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [isPending]);

  return (
    <Pressable
      className="flex flex-row items-center justify-between p-4 disabled:opacity-50"
      disabled={isPending}
      onPress={() => {
        SheetManager.show('country-selector', {
          payload: {
            onSelect: (country: Country) => {
              SheetManager.hide('country-selector');
              console.log('country', country);
              console.log('session', session);
              updateCountry({
                country_code: country.alpha2,
                token: session?.token ?? '',
              });
            },
          },
        });
      }}
    >
      <View className="flex flex-row items-center">
        {session?.user?.country_code && (
          <View className="flex items-center justify-center bg-gray-800 w-10 h-10 rounded-full mr-4">
            <Text className="text-white text-xl">
              {clm.getCountryByAlpha2(session?.user?.country_code)?.emoji}
            </Text>
          </View>
        )}
        <View>
          <Text
            className="text-lg text-white"
            style={{
              fontFamily: 'Nunito_600SemiBold',
            }}
          >
            país
          </Text>
          <Text className="text-sm text-gray-400">
            {session?.user?.country_code
              ? clm.getCountryNameByAlpha2(session?.user?.country_code)
              : 'Seleccionar país'}
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
