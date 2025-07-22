'use client';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { LuLoader2 } from 'react-icons/lu';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { getWhatsappBotLinkWithMessage } from '@/lib/constants/chat';
import { mixpanel } from '@/lib/tools/mixpanel';

// Create schema for the form
const expenseFormSchema = z.object({
  description: z
    .string()
    .min(3, { message: 'La descripción debe tener al menos 3 caracteres' }),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export function TryLive() {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: '',
    },
  });

  const onSubmit = async (data: ExpenseFormValues) => {
    try {
      mixpanel.track('try_live_register_expense', {
        description: data.description,
      });

      window.open(getWhatsappBotLinkWithMessage(data.description), '_blank');
    } catch (error) {
      toast.error('Ocurrió un error al registrar el gasto');
    }
  };

  return (
    <section
      className="min-h-[100vh] flex items-center justify-center text-white"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% -30%, rgba(10, 39, 255, 0.35) 0%, rgba(10, 39, 82, 0) 50%)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-8">
        <div className="flex justify-center items-center gap-5">
          <span className="bg-[#F37211] w-3 h-2 rounded-full"></span>BETA
          DISPONIBLE AHORA
        </div>

        <h1 className="text-4xl md:text-6xl font-normal tracking-tight leading-tight">
          Tu Agente Personal de Finanzas y Gastos
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
          Registra tu primer gasto y comienza a tomar el control de tus finanzas
          personales.
        </p>

        <div className="max-w-2xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Describe el gasto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Gasté 20 soles en una hamburguesa"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-zinc-200"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <LuLoader2 className="animate-spin inline-block mr-2" />
                    Registrando...
                  </>
                ) : (
                  'Registrar Gasto'
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
