'use client';
import { useState } from 'react';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { currencyCodeData } from '@/lib/constants/currencies';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/app/dashboard/_context/app-context';

export const CurrencySelector: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { currency, setCurrency } = useAppContext();

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            <span className="hidden md:block">
              {currency
                ? Object.values(currencyCodeData).find(
                    (currencyData) => currencyData.type === currency
                  )?.title
                : 'Seleccionar moneda...'}
            </span>
            <span className="md:hidden">
              {currency
                ? Object.values(currencyCodeData).find(
                    (currencyData) => currencyData.type === currency
                  )?.type
                : 'Seleccionar moneda...'}
            </span>
            <ChevronsUpDownIcon className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
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
          >
            <CommandInput placeholder="Buscar moneda..." className="h-9" />
            <CommandList>
              <CommandEmpty>Moneda no encontrada.</CommandEmpty>
              <CommandGroup>
                {Object.values(currencyCodeData).map((currencyData) => (
                  <CommandItem
                    key={currencyData.type}
                    value={currencyData.type}
                    onSelect={(currentValue) => {
                      setCurrency(currentValue);
                      setOpen(false);
                    }}
                  >
                    {currencyData.title}
                    <CheckIcon
                      className={cn(
                        'ml-auto',
                        currency === currencyData.type
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
