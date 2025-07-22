'use client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useState, useEffect } from 'react';

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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { LuLoader2 } from 'react-icons/lu';
import { AppUser, useSession } from '@/app/_components/session-provider';
import { motion } from 'framer-motion';

const otpSchema = z.object({
  otp: z.string().min(6, {
    message: 'El código debe tener al menos 6 caracteres',
  }),
});

type IOTPSchema = z.infer<typeof otpSchema>;

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

  return fetch(`${env.NEXT_PUBLIC_API_URL}/v1/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ phoneNumber, otp }),
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.NEXT_PUBLIC_API_KEY,
    },
  })
    .then((res) => res.json() as Promise<ValidateCodeResponse>)
    .catch((error) => {
      console.error(error);
      throw new Error('Ocurrió un error al enviar el código');
    });
};

const resendCodeFunction = async (phoneNumber: string) => {
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

interface OTPVerificationProps {
  phoneNumber: string;
}

export const OTPVerification = (props: OTPVerificationProps) => {
  const { phoneNumber } = props;
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

  const form = useForm<IOTPSchema>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const { isPending: isPendingResend, mutateAsync: resendCode } = useMutation({
    mutationFn: resendCodeFunction,
    onError: (error) => {
      console.error(error);
      toast.error(error.message);
    },
    onSuccess: (response) => {
      toast.success(response.message);
    },
  });

  const { isPending: isPendingValidate, mutateAsync: validateCode } =
    useMutation({
      mutationFn: validateCodeFunction,
      onError: (error) => {
        console.error(error);
        toast.error(error.message);
      },
      onSuccess: (response: ValidateCodeResponse) => {
        toast.success(response.message);
        if (response.success) {
          signIn({
            token: response.data.token,
            encryptionKey: response.data.encryption_key,
            user: response.data.user,
          });
          router.push('/dashboard');
        }
      },
    });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) =>
          validateCode({ phoneNumber, otp: data.otp })
        )}
        className="w-full space-y-6"
      >
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Código de verificación</FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  {...field}
                  pattern={REGEXP_ONLY_DIGITS}
                  title="El código de verificación solo puede contener números"
                >
                  <InputOTPGroup className="w-full max-w-[80%]">
                    <InputOTPSlot index={0} className="w-full h-14 md:h-14" />
                    <InputOTPSlot index={1} className="w-full h-14 md:h-14" />
                    <InputOTPSlot index={2} className="w-full h-14 md:h-14" />
                    <InputOTPSlot index={3} className="w-full h-14 md:h-14" />
                    <InputOTPSlot index={4} className="w-full h-14 md:h-14" />
                    <InputOTPSlot index={5} className="w-full h-14 md:h-14" />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>
                Te hemos enviado un código de verificación mediante WhatsApp al
                número <span className="font-medium">{phoneNumber}</span>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col items-center gap-1 text-sm justify-center mb-4">
          <div>
            <span>No recibiste el código? </span>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={
                isPendingResend || isPendingValidate || resendCooldown > 0
              }
              className="text-apollo ml-1 text-blue-500"
            >
              {isPendingResend ? (
                <>
                  <LuLoader2 className="animate-spin inline-block mr-2" />
                  Reenviando código
                </>
              ) : (
                'Reenviar código'
              )}
            </button>
          </div>
          {resendCooldown > 0 && (
            <span className="ml-2 text-xs text-gray-500">
              podrás solicitar otro en {resendCooldown} segundos
            </span>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full bg-white text-black py-3 px-6 rounded-lg font-medium hover:bg-gray-100 transition-colors text-lg"
          disabled={isPendingResend || isPendingValidate}
        >
          {isPendingValidate ? (
            <>
              <LuLoader2 className="animate-spin inline-block mr-2" />
              Verificando
            </>
          ) : (
            'Verificar'
          )}
        </motion.button>
      </form>
    </Form>
  );
};
