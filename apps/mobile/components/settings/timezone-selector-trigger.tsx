import { View, Text, Pressable, Animated, Easing } from 'react-native';
import { SheetManager } from 'react-native-actions-sheet';
import {
  ChevronRight,
  Loader2 as LucideLoader2,
  Clock,
} from 'lucide-react-native';
import { useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-root-toast';
import { useSession } from '@/components/auth/ctx';
import { env } from '@/env';

const updateTimezoneFunction = async ({
  timezone,
  token,
}: {
  timezone: string;
  token: string;
}) => {
  const response = await fetch(
    `${env.EXPO_PUBLIC_API_URL}/v1/users/update-timezone`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-api-key': env.EXPO_PUBLIC_API_KEY,
      },
      body: JSON.stringify({ timezone }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al actualizar la zona horaria');
  }

  return data;
};

export const TimezoneSelectorTrigger = () => {
  const { session, signIn } = useSession();
  const spinValue = useRef(new Animated.Value(0)).current;

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const { isPending, mutateAsync: updateTimezone } = useMutation({
    mutationFn: updateTimezoneFunction,
    onError: (error: any) => {
      console.error(error);
      Toast.show(error.message);
    },
    onSuccess: (response) => {
      Toast.show(response.message || 'Zona horaria actualizada con éxito');
      if (response.success && response.data && session) {
        // Update session with new timezone
        signIn({
          ...session,
          user: {
            ...session.user,
            favorite_timezone: response.data.favorite_timezone,
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
        SheetManager.show('timezone-selector', {
          payload: {
            onSelect: (timezone: string) => {
              SheetManager.hide('timezone-selector');
              updateTimezone({
                timezone,
                token: session?.token ?? '',
              });
            },
          },
        });
      }}
    >
      <View className="flex flex-row items-center">
        <View className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mr-4">
          <Clock className="h-5 w-5" color="purple" />
        </View>
        <View>
          <Text
            className="text-lg text-white"
            style={{
              fontFamily: 'Nunito_600SemiBold',
            }}
          >
            zona horaria
          </Text>
          <Text className="text-sm text-gray-400">
            {session?.user?.favorite_timezone || 'No seleccionada'}
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
