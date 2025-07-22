import { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Linking, Animated, Easing } from 'react-native';
import {
  ChevronRightIcon,
  CreditCard,
  LucideLoader2,
  RefreshCwIcon,
  Sparkles,
} from 'lucide-react-native';

import { env } from '@/env';
import { AppUser, useSession } from '@/components/auth/ctx';
import Toast from 'react-native-root-toast';
import { lemonProductLink } from '@/lib/constants/lemon';
import { getWhatsappBotLinkWithMessage } from '@/lib/constants/chat';

function useBillingPortal() {
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useSession();

  const getBillingPortal = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${env.EXPO_PUBLIC_API_URL}/v1/subscriptions/billing-portal`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.EXPO_PUBLIC_API_KEY,
            Authorization: `Bearer ${session?.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get billing portal');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      return data.data.url;
    } catch (error) {
      console.error('Error getting billing portal:', error);
      Toast.show('No se pudo obtener el portal de pagos. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, getBillingPortal };
}

interface SubscriptionStatusProps {
  user: AppUser;
}

export function SubscriptionStatusSimple({ user }: SubscriptionStatusProps) {
  const { isLoading, getBillingPortal } = useBillingPortal();

  const spinValue = useRef(new Animated.Value(0)).current;

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const onClickNoSubscription = () => {
    const checkoutLink = `${lemonProductLink}?checkout[custom][phone_number]=${
      user.phone_number
    }&checkout[billing_address][country]=${user.country_code ?? ''}`;
    Linking.openURL(checkoutLink);
  };

  const onClickInactiveSubscription = () => {
    Linking.openURL(
      getWhatsappBotLinkWithMessage('Hola!! quiero reactivar mi suscripción')
    );
  };

  const onClickActiveSubscription = () => {
    Linking.openURL(
      getWhatsappBotLinkWithMessage('Hola!! quiero gestionar mi suscripción')
    );
  };

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (isLoading) {
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
  }, [isLoading]);

  return (
    <Pressable
      onPress={
        !user.subscription
          ? onClickNoSubscription
          : user.subscription.status === 'active' ||
            user.subscription.status === 'on_trial'
          ? onClickActiveSubscription
          : onClickInactiveSubscription
      }
      className="flex flex-row items-center justify-between p-4 active:bg-gray-800"
    >
      <View className="flex flex-row items-center">
        <View className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mr-4">
          {!user.subscription ? (
            <Sparkles color="#F59E0B" size={20} />
          ) : user.subscription.status === 'active' ||
            user.subscription.status === 'on_trial' ? (
            <CreditCard color="#60A5FA" size={20} />
          ) : (
            <RefreshCwIcon color="#F59E0B" size={20} />
          )}
        </View>
        <View>
          <Text
            className="text-lg text-white"
            style={{
              fontFamily: 'Nunito_600SemiBold',
            }}
          >
            {!user.subscription
              ? 'premium'
              : user.subscription.status === 'active' ||
                user.subscription.status === 'on_trial'
              ? 'gestionar suscripción'
              : 'activar premium'}
          </Text>
          <Text
            className="text-sm text-gray-400"
            style={{
              fontFamily: 'Nunito_400Regular',
            }}
          >
            {!user.subscription
              ? 'registra gastos ilimitados mediante WhatsApp'
              : user.subscription.status === 'active' ||
                user.subscription.status === 'on_trial'
              ? 'gestiona tu suscripción'
              : 'reactivar tu suscripción'}
          </Text>
        </View>
      </View>
      <View className="text-gray-400">
        {isLoading ? (
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <LucideLoader2 size={20} color="white" />
          </Animated.View>
        ) : (
          <ChevronRightIcon color="white" size={20} />
        )}
      </View>
    </Pressable>
  );
}
