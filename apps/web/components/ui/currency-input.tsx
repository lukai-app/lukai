import { cn } from '@/lib/utils';
import * as React from 'react';
import {
  CurrencyInputProps,
  default as PrimitiveCurrencyInput,
} from 'react-currency-input-field';
import { CurrencyInputOnChangeValues } from 'react-currency-input-field/dist/components/CurrencyInputProps';
import { twMerge } from 'tailwind-merge';
import { Input as LocalInput } from '@/components/ui/input';

interface PrimitiveInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, PrimitiveInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <LocalInput
        type={type}
        className={cn('text-2xl rounded-xl p-2 px-5', className)}
        ref={ref}
        {...props}
      />
    );
  }
);

interface InputProps
  extends Omit<CurrencyInputProps, 'onValueChange' | 'onChange'> {
  onChange?: (
    value: string | undefined,
    name?: string,
    values?: CurrencyInputOnChangeValues
  ) => void;
  showCurrencySymbol?: boolean;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onChange, showCurrencySymbol = true, ...props }, ref) => {
    return (
      <div className={twMerge('relative', className)}>
        {showCurrencySymbol && (
          <span className="absolute top-1/2 left-4 text-zinc-400 transform -translate-y-1/2">
            $
          </span>
        )}
        <PrimitiveCurrencyInput
          customInput={Input}
          className={cn(showCurrencySymbol && 'pl-8', className)}
          ref={ref}
          placeholder="0.00"
          {...props}
          onChange={undefined}
          onValueChange={onChange}
          decimalsLimit={2}
          step={1}
        />
      </div>
    );
  }
);
CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
