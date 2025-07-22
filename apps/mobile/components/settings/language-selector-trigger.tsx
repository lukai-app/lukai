import { SheetManager } from 'react-native-actions-sheet';
import { Pressable, View, Text, Animated, Easing } from 'react-native';
import { ChevronRight, LucideLoader2, Languages } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-root-toast';
import { useEffect, useRef } from 'react';
import languageNameMap from 'language-name-map';

import { useSession } from '@/components/auth/ctx';
import { env } from '@/env';

interface UpdateLanguageResponse {
  success: boolean;
  message: string;
  data?: {
    favorite_language: string;
  };
}

export interface Language {
  code: string;
  name: string;
  native: string;
}

const updateLanguageFunction = async (params: {
  language_code: string;
  token: string;
}) => {
  const response = (await fetch(
    `${env.EXPO_PUBLIC_API_URL}/v1/users/update-language`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.EXPO_PUBLIC_API_KEY,
        Authorization: `Bearer ${params.token}`,
      },
      body: JSON.stringify({ language_code: params.language_code }),
    }
  ).then((res) => res.json())) as UpdateLanguageResponse;

  if (!response.success) {
    throw new Error(response.message || 'Failed to update language');
  }

  return response;
};

export const LanguageSelectorTrigger = () => {
  const { session, signIn } = useSession();
  const spinValue = useRef(new Animated.Value(0)).current;

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const { isPending, mutateAsync: updateLanguage } = useMutation({
    mutationFn: updateLanguageFunction,
    onError: (error: any) => {
      console.error(error);
      Toast.show(error.message);
    },
    onSuccess: (response) => {
      Toast.show(response.message || 'Idioma actualizado con éxito');
      if (response.success && response.data && session) {
        // Update session with new language code
        signIn({
          ...session,
          user: {
            ...session.user,
            favorite_language: response.data.favorite_language,
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
        SheetManager.show('language-selector', {
          payload: {
            onSelect: (language: string) => {
              SheetManager.hide('language-selector');
              updateLanguage({
                language_code: language,
                token: session?.token ?? '',
              });
            },
          },
        });
      }}
    >
      <View className="flex flex-row items-center">
        <View className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mr-4">
          <Languages color="#6366f1" size={20} />
        </View>
        <View>
          <Text
            className="text-lg text-white"
            style={{
              fontFamily: 'Nunito_600SemiBold',
            }}
          >
            idioma
          </Text>
          <Text className="text-sm text-gray-400">
            {session?.user?.favorite_language
              ? languageNameMap.getLangNameFromCode(
                  session?.user?.favorite_language
                )?.name
              : 'Seleccionar idioma'}
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
