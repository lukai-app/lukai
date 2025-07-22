'use client';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as React from 'react';
import { LuX } from 'react-icons/lu';
import { Drawer } from 'vaul';

import useViewportSize from '@/lib/hooks/useViewportSize';
import { twMerge } from 'tailwind-merge';

const Dialog = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>
>((props, ref) => {
  const { width } = useViewportSize();

  if (width < 640) {
    return <Drawer.Root {...props} />;
  }

  return <DialogPrimitive.Root {...props} />;
});

const DialogTrigger = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const { width } = useViewportSize();

  if (width < 640) {
    return <Drawer.Trigger {...props} />;
  }

  return <DialogPrimitive.Trigger {...props} />;
});

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={twMerge(
      'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    preventClose?: boolean;
    showClose?: boolean;
    closeClassName?: string;
  }
>(
  (
    {
      className,
      children,
      preventClose,
      showClose,
      closeClassName,
      onAnimationEnd,
      ...props
    },
    ref
  ) => {
    const { width } = useViewportSize();

    if (width < 640) {
      return (
        <Drawer.Portal>
          <DialogOverlay />
          <Drawer.Content
            ref={ref}
            className={twMerge(
              'bg-white z-50 font-nunito p-4 flex flex-col rounded-t-[32px] mt-24 max-h-[96%] fixed bottom-0 left-0 right-0',
              className
            )}
            onEscapeKeyDown={(e) => {
              preventClose && e.preventDefault();
            }}
            onPointerDownOutside={(e) => {
              preventClose && e.preventDefault();
            }}
            onInteractOutside={(e) => {
              preventClose && e.preventDefault();
            }}
            {...props}
          >
            <div className="mx-auto cursor-move w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
            {children}
            {showClose ? (
              <Drawer.Close
                disabled={preventClose}
                className={twMerge(
                  'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground',
                  closeClassName
                )}
              >
                <LuX className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Drawer.Close>
            ) : null}{' '}
          </Drawer.Content>
          <Drawer.Overlay />
        </Drawer.Portal>
      );
    }

    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={twMerge(
            'fixed right-[50%] top-[50%] max-h-[96%] flex flex-col z-50 w-full max-w-lg -translate-x-[-50%] translate-y-[-50%] bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-right-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-right-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-[12px]',
            className
          )}
          onEscapeKeyDown={(e) => {
            preventClose && e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            preventClose && e.preventDefault();
          }}
          onInteractOutside={(e) => {
            preventClose && e.preventDefault();
          }}
          onAnimationEnd={onAnimationEnd}
          {...props}
        >
          {children}
          {showClose ? (
            <DialogPrimitive.Close
              disabled={preventClose}
              className={twMerge(
                'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground',
                closeClassName
              )}
            >
              <LuX className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  }
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={twMerge(
      'flex flex-col space-y-2 text-center sm:text-left',
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={twMerge(
      'flex gap-2 flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={twMerge(
      'text-lg font-medium font-poppins tracking-tight',
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={twMerge(
      'font-geistSans leading-[19.2px] text-[#636363]',
      className
    )}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
