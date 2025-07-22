import { useRouter } from 'expo-router';
import { Loader2Icon } from 'lucide-react-native';
import { OtpInput } from 'react-native-otp-entry';
import { Text, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import Toast from 'react-native-root-toast';
import { useMutation } from '@tanstack/react-query';
import { AppUser, useSession } from '@/components/auth/ctx';
import { env } from '@/env';
import { mixpanelApp } from '@/lib/tools/mixpanel';
import { ANALYTICS_EVENTS } from '@/lib/analytics/constants';

const resendCodeFunction = async (phoneNumber: string) => {
  console.log('phoneNumber', phoneNumber);
  return fetch(`${env.EXPO_PUBLIC_API_URL}/v1/auth/send-code`, {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.EXPO_PUBLIC_API_KEY,
    },
  })
    .then((res) => res.json())
    .catch((error) => {
      console.error(error);
      throw new Error('Ocurrió un error al enviar el código');
    });
};

interface ValidateCodeResponse {
  success: boolean;
  data: {
    token: string;
    encryption_key: string;
    user: AppUser;
  };
  message: string;
}

const validateCodeFunction = async (params: {
  phoneNumber: string;
  otp: string;
}) => {
  const { phoneNumber, otp } = params;

  return fetch(`${env.EXPO_PUBLIC_API_URL}/v1/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ phoneNumber, otp }),
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.EXPO_PUBLIC_API_KEY,
    },
  })
    .then((res) => res.json() as Promise<ValidateCodeResponse>)
    .catch((error) => {
      console.error(error);
      throw new Error('Ocurrió un error al enviar el código');
    });
};

interface OTPVerificationProps {
  phoneNumber: string;
}

export const OTPVerification = (props: OTPVerificationProps) => {
  const { phoneNumber } = props;
  const [otp, setOTP] = useState('');
  const { signIn } = useSession();
  const router = useRouter();
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const handleResendCode = async () => {
    await resendCode(phoneNumber);
    setResendCooldown(60);
  };

  const { isPending: isPendingResend, mutateAsync: resendCode } = useMutation({
    mutationFn: resendCodeFunction,
    onError: (error) => {
      console.error(error);
      Toast.show(error.message);
      mixpanelApp.track(ANALYTICS_EVENTS.AUTH_ERROR, {
        error: error.message,
      });
    },
    onSuccess: (response) => {
      Toast.show(response.message);
    },
  });

  const { isPending: isPendingValidateCode, mutateAsync: validateCode } =
    useMutation({
      mutationFn: validateCodeFunction,
      onError: (error) => {
        console.error(error);
        Toast.show(error.message);
        mixpanelApp.track(ANALYTICS_EVENTS.AUTH_ERROR, {
          error: error.message,
        });
      },
      onSuccess: (response: ValidateCodeResponse) => {
        Toast.show(response.message);
        if (response.success) {
          signIn({
            token: response.data.token,
            encryptionKey: response.data.encryption_key,
            user: response.data.user,
          });
          router.navigate('/');
        }
      },
    });

  return (
    <View className="w-full">
      <Text className="text-lg font-medium text-white mb-2">
        Código de verificación
      </Text>

      <View className="flex flex-row justify-between">
        <OtpInput
          numberOfDigits={6}
          onTextChange={(text) => setOTP(text)}
          focusColor={'#34D399'}
          focusStickBlinkingDuration={400}
          theme={{
            pinCodeContainerStyle: {
              backgroundColor: 'transparent',
              width: 48,
              height: 56,
              borderRadius: 12,
              borderColor: '#5E646C',
            },
            pinCodeTextStyle: {
              color: 'white',
            },
          }}
        />
      </View>
      <Text className="text-base text-[#9CA3AF] mt-2">
        Te hemos enviado un código de verificación mediante WhatsApp al número{' '}
        <Text className="font-medium">{phoneNumber}</Text>{' '}
      </Text>

      <View className="flex flex-col items-center gap-1 justify-center mb-10 mt-6">
        <View className="flex flex-row items-center gap-1">
          <Text className="text-white">No recibiste el código? </Text>
          <TouchableOpacity
            onPress={handleResendCode}
            disabled={
              isPendingResend || isPendingValidateCode || resendCooldown > 0
            }
            className="ml-1"
          >
            <Text className="text-[#34D399]">
              {isPendingResend ? (
                <>
                  <Loader2Icon className="animate-spin inline-block mr-2" />
                  Reenviando código
                </>
              ) : (
                'Reenviar código'
              )}
            </Text>
          </TouchableOpacity>
        </View>
        {resendCooldown > 0 && (
          <Text className="ml-2 text-sm text-gray-500">
            podrás solicitar otro en {resendCooldown} segundos
          </Text>
        )}
      </View>

      <Button
        disabled={isPendingValidateCode}
        className="w-full !h-[52px] bg-white py-3 px-6 !rounded-3xl transition-colors"
        onPress={async () => {
          if (!otp || otp.length !== 6) {
            return Toast.show('Ingresa el código de verificación');
          } else {
            await validateCode({
              phoneNumber: phoneNumber,
              otp,
            });

            setOTP('');
          }
        }}
      >
        <Text className="text-lg font-medium text-black">
          {isPendingValidateCode ? 'Verificando...' : 'Verificar'}
        </Text>
      </Button>
    </View>
  );
};
