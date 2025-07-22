'use client';
import * as z from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { isValidPhoneNumber } from 'react-phone-number-input';
import React, { Dispatch, SetStateAction } from 'react';
import { useTheme } from 'next-themes';
import { LuLoader2 } from 'react-icons/lu';

import { env } from '@/env';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/ui/phone-number-input';
import { motion } from 'framer-motion';

const sendCodeFunction = async (phoneNumber: string) => {
  return fetch(`${env.NEXT_PUBLIC_API_URL}/v1/auth/send-code`, {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.NEXT_PUBLIC_API_KEY,
    },
  })
    .then((res) => res.json())
    .catch((error) => {
      console.error(error);
      throw new Error('Ocurrió un error al enviar el código');
    });
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

export const PhoneNumber: React.FC<PhoneNumberProps> = (props) => {
  const { setPhoneNumber, phoneNumber, setScreen } = props;
  const { theme } = useTheme();

  const form = useForm<IPhoneNumberInput>({
    resolver: zodResolver(phoneNumberSchema),
    defaultValues: {
      phone: phoneNumber || '',
    },
  });

  const { mutate: sendCode, isPending } = useMutation({
    mutationFn: sendCodeFunction,
    onError: (error) => {
      console.error(error);
      toast.error(error.message);
    },
    onSuccess: (response) => {
      toast.success(response.message);
      setPhoneNumber(form.getValues().phone);
      setScreen('code');
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => sendCode(data.phone))}
        className="flex flex-col items-start space-y-8"
      >
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="flex flex-col items-start w-full">
              <FormLabel className="text-left">Número de teléfono</FormLabel>
              <FormControl className="w-full">
                <PhoneInput
                  placeholder="Ingresa tu número de teléfono"
                  defaultCountry="PE"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-left object-left">
                Te enviaremos un código de verificación por WhatsApp
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full bg-white text-black py-3 px-6 rounded-lg font-medium hover:bg-gray-100 transition-colors text-lg"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <LuLoader2 className="animate-spin inline-block mr-2" />
              Enviando
            </>
          ) : (
            'Enviar código'
          )}
        </motion.button>
      </form>
    </Form>
  );
};
