import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          //flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          'flex h-12 w-full rounded-[13px] border border-input bg-transparent px-8 text-sm leading-[17px] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#6F757B] focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-[green=true]:border-[#5EA17B] aria-[invalid=true]:border-[#EB5757] aria-[green=true]:text-[#5EA17B]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
