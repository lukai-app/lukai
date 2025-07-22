import * as z from 'zod';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import Toast from 'react-native-root-toast';
import parsePhoneNumber from 'libphonenumber-js';
import { ChevronDown } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SheetManager } from 'react-native-actions-sheet';
import React, { Dispatch, SetStateAction, useState } from 'react';

import { env } from '@/env';

import { Button } from '@/components/ui/button';
import { countries, Country } from '@/lib/constants/countries';

const sendCodeFunction = async (phoneNumber: string) => {
  try {
    // Validate environment variables
    if (!env.EXPO_PUBLIC_API_URL) {
      throw new Error('API URL is not configured');
    }
    if (!env.EXPO_PUBLIC_API_KEY) {
      throw new Error('API key is not configured');
    }

    console.log('Making request to:', env.EXPO_PUBLIC_API_URL);
    console.log('Phone number:', phoneNumber);

    const response = await fetch(
      `${env.EXPO_PUBLIC_API_URL}/v1/auth/send-code`,
      {
        method: 'POST',
        body: JSON.stringify({ phoneNumber }),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.EXPO_PUBLIC_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorData,
      });
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error: any) {
    console.error('Detailed error:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
    });
    throw new Error(error?.message || 'Ocurrió un error al enviar el código');
  }
};

const isValidPhoneNumber = (phoneNumber: string) => {
  const parsedPhoneNumber = parsePhoneNumber(phoneNumber);
  return parsedPhoneNumber && parsedPhoneNumber.isValid();
};

const phoneNumberSchema = z.object({
  phone: z
    .string()
    .refine(isValidPhoneNumber, { message: 'Número de teléfono inválido' }),
});

type IPhoneNumberInput = z.infer<typeof phoneNumberSchema>;

interface PhoneNumberProps {
  phoneNumber: string | null;
  setPhoneNumber: (phoneNumber: string) => void;
  setScreen: Dispatch<SetStateAction<'phone' | 'code'>>;
}

const fixPhoneNumber = (phoneNumber: string, callingCode?: string) => {
  const phoneWithPlus = phoneNumber.startsWith('+')
    ? phoneNumber
    : `+${phoneNumber}`;
  const isValid = isValidPhoneNumber(phoneWithPlus);

  if (isValid) {
    const parsedPhoneNumber = parsePhoneNumber(phoneWithPlus);

    return {
      phone: parsedPhoneNumber?.number || '',
      isValid: true,
    };
  }

  const phoneWithAreaCode = `${callingCode}${phoneNumber}`;
  const isValidWithAreaCode = isValidPhoneNumber(phoneWithAreaCode);

  if (isValidWithAreaCode) {
    const parsedPhoneNumber = parsePhoneNumber(phoneWithAreaCode);

    return {
      phone: parsedPhoneNumber?.number || '',
      isValid: true,
    };
  }

  return {
    phone: '',
    isValid: false,
  };
};

export const PhoneNumber: React.FC<PhoneNumberProps> = (props) => {
  const { phoneNumber, setPhoneNumber, setScreen } = props;
  const [selectedArea, setSelectedArea] = useState<Country>(
    countries.find((country) => country.alpha2 === 'PE') || countries[0]
  );

  const form = useForm<IPhoneNumberInput>({
    resolver: zodResolver(phoneNumberSchema),
    defaultValues: {
      phone: phoneNumber || '',
    },
  });

  const { isPending, mutateAsync: sendCode } = useMutation({
    mutationFn: sendCodeFunction,
    onError: (error) => {
      console.error(error);
      Toast.show(error.message);
    },
    onSuccess: (response) => {
      Toast.show(response.message);
      setPhoneNumber(
        fixPhoneNumber(
          form.getValues().phone,
          selectedArea?.countryCallingCodes[0]
        ).phone
      );
      setScreen('code');
    },
  });

  return (
    <View className="w-full">
      <View className="mb-8">
        <Text className="text-lg font-medium text-white mb-1">
          Número de teléfono
        </Text>
        <View className="flex-row relative">
          {/* <Pressable
            className="absolute z-10 flex-row items-center justify-center left-0 top-0 h-full rounded-e-lg rounded-s-none"
            onPress={() => {
              console.log('show country code');
              SheetManager.show('country-code', {
                payload: {
                  onSelect: (country: Country) => {
                    SheetManager.hide('country-code');
                    setSelectedArea(country);
                  },
                },
              });
            }}
          >
            <View
              style={{ justifyContent: 'center', marginLeft: 16 }}
              className="h-full flex flex-row items-center justify-center"
            >
              <Text className="text-2xl">{selectedArea?.emoji}</Text>
            </View>
            <ChevronDown color="white" />
          </Pressable> */}
          <Controller
            control={form.control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="ej. 51987654321"
                placeholderTextColor={'#D9D9D9'}
                className="flex !h-[52px] text-white w-full rounded-[13px] border border-input bg-transparent px-8 leading-[17px] file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-[green=true]:border-[#5EA17B] aria-[invalid=true]:border-[#EB5757] aria-[green=true]:text-[#5EA17B]"
                keyboardType="phone-pad"
              />
            )}
          />
        </View>
        <Text className="text-base text-[#9CA3AF] mt-2">
          Te enviaremos un código de verificación por WhatsApp
        </Text>
        {form.formState.errors.phone && (
          <Text className="text-red-500">
            {form.formState.errors.phone.message}
          </Text>
        )}
      </View>

      <Button
        disabled={isPending}
        className="w-full !h-[52px] bg-white py-3 px-6 !rounded-3xl transition-colors"
        onPress={() => {
          // validate only phone number, add plus sign if not exists
          const phone = form.getValues().phone;
          const selectedAreaCode = selectedArea?.countryCallingCodes[0];

          const { phone: fixedPhone, isValid } = fixPhoneNumber(
            phone,
            selectedAreaCode
          );

          if (isValid) {
            sendCode(fixedPhone);
          } else {
            Toast.show('Número de teléfono inválido');
          }
        }}
      >
        <Text className="text-lg font-medium text-black">
          {isPending ? 'Enviando...' : 'Enviar código'}
        </Text>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  chevronDownIcon: {
    color: 'white',
    fontSize: 14,
  },
  selectFlagContainer: {
    width: 90,
    height: 50,
    marginHorizontal: 5,
    flexDirection: 'row',
  },
  flagIcon: {
    width: 30,
    height: 30,
  },
  input: {
    flex: 1,
    marginVertical: 10,
    height: 40,
    fontSize: 14,
    color: '#F0F0F0',
  },
});
