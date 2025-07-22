'use client';
import { useAppContext } from '@/app/dashboard/_context/app-context';

import { cn } from '@/lib/utils';
import { currencyCodeData } from '@/lib/constants/currencies';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/mobile-command';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { CheckIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

interface MobileCurrencySelectorProps {
  locale: string;
  usedCurrencies: string[];
}

export const MobileCurrencySelector: React.FC<MobileCurrencySelectorProps> = (
  props
) => {
  const { locale, usedCurrencies } = props;
  const [isOpen, setIsOpen] = useState(false);

  const { setCurrency, currency } = useAppContext();

  // Get the currency symbol
  const getCurrencySymbol = (currency: string) => {
    const formatter = new Intl.NumberFormat(locale ?? 'es-PE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    });
    return formatter.format(0).replace(/[0-9]/g, '').trim();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="font-bold">
          {currency} ({getCurrencySymbol(currency)})
        </Button>
      </SheetTrigger>
      <SheetContent
        className=" bg-[#05060A] w-full max-w-full border-none"
        closeButton={false}
      >
        <div className="mb-4 flex gap-3">
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="font-bold">
              <XIcon className="h-5 w-5" />
            </Button>
          </SheetClose>
          <SheetTitle className="text-left text-3xl font-bold">
            moneda
          </SheetTitle>
        </div>
        <Command
          filter={(value, search) => {
            // compare value and also the title of the currency
            const currencyData = Object.values(currencyCodeData).find(
              (currencyData) => currencyData.type === value
            );
            if (!currencyData) return 0;

            const valueMatch = value
              .toLowerCase()
              .includes(search.toLowerCase())
              ? 1
              : 0;
            const titleMatch = currencyData.title
              .toLowerCase()
              .includes(search.toLowerCase())
              ? 1
              : 0;

            return Math.max(valueMatch, titleMatch);
          }}
          className="bg-transparent"
        >
          <CommandInput placeholder="buscar moneda..." className="h-9" />
          <CommandList className="max-h-full mt-4 pb-12">
            <CommandEmpty>moneda no encontrada.</CommandEmpty>
            {usedCurrencies.length > 0 && (
              <>
                <CommandGroup>
                  <p className="text-muted-foreground text-base">
                    monedas que más usas
                  </p>
                  {usedCurrencies.map((currencyOption) => {
                    const currencyData = Object.values(currencyCodeData).find(
                      (currencyData) => currencyData.type === currencyOption
                    );
                    if (!currencyData) return null;

                    return (
                      <CommandItem
                        key={currencyData.type}
                        value={currencyData.type}
                        onSelect={(currentValue) => {
                          setCurrency(currentValue);
                          setIsOpen(false);
                        }}
                        className="!text-sm py-4 px-0 cursor-pointer data-[selected=true]:bg-transparent"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground w-16 text-center bg-[#1a1a1a] rounded-full px-4 py-2 font-medium">
                            {currencyData.type}
                          </span>
                          <span className="text-base font-medium">
                            {currencyData.title}
                          </span>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                <CommandSeparator className="my-4" />
              </>
            )}
            <CommandGroup>
              {Object.values(currencyCodeData)
                .sort((a, b) => {
                  // Put the selected currency at the top
                  if (a.type === currency) return -1;
                  if (b.type === currency) return 1;
                  return 0;
                })
                .map((currencyData) => {
                  return (
                    <CommandItem
                      key={currencyData.type}
                      value={currencyData.type}
                      onSelect={(currentValue) => {
                        setCurrency(currentValue);
                        setIsOpen(false);
                      }}
                      className="!text-sm py-4 px-0 cursor-pointer data-[selected=true]:bg-transparent"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground w-16 text-center bg-[#1a1a1a] rounded-full px-4 py-2 font-medium">
                          {currencyData.type}
                        </span>
                        <span className="text-base font-medium">
                          {currencyData.title}
                        </span>
                      </div>
                      <CheckIcon
                        className={cn(
                          'ml-auto',
                          currency === currencyData.type
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </SheetContent>
    </Sheet>
  );
};
