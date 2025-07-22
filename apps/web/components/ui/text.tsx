import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const textVariants = cva('font-lexend', {
  variants: {
    variant: {
      h1: 'text-5xl font-extrabold leading-[48px]',
      h2: 'text-3xl font-semibold leading-9',
      h3: 'text-2xl font-semibold',
      h4: 'text-xl font-semibold leading-7',
      p: 'text-base font-normal',
      large: 'text-lg font-semibold leading-7',
      subtle: 'text-sm font-normal leading-tight',
    },
  },
  defaultVariants: {
    variant: 'p',
  },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {}

const Text: React.FC<TextProps> = ({ className, variant, ...props }) => {
  const TagName =
    variant === 'p'
      ? 'p'
      : variant === 'h1'
      ? 'h1'
      : variant === 'h2'
      ? 'h2'
      : variant === 'h3'
      ? 'h3'
      : variant === 'h4'
      ? 'h4'
      : variant === 'subtle'
      ? 'span'
      : 'p';

  return (
    <TagName className={cn(textVariants({ variant, className }))} {...props} />
  );
};
Text.displayName = 'Text';

export { Text, textVariants };
