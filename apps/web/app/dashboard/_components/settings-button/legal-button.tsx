'use client';

import { FileText, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const LegalButton = ({ className }: { className?: string }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={cn(
            'flex items-center justify-between rounded-lg p-4 hover:bg-gray-800 transition-colors cursor-pointer w-full',
            className
          )}
        >
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 mr-4">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <span className="text-lg">legal</span>
          </div>
          <div className="text-gray-400">
            <svg
              width="6"
              height="10"
              viewBox="0 0 6 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 9L5 5L1 1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#05060A] border-[#3a3a3c] mx-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">
            legal
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 p-4">
          {/* Privacy option */}
          <button
            className="flex flex-col items-center justify-center py-5 px-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
            onClick={() => window.open('/privacy.html', '_blank')}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 mb-3">
              <Shield className="h-6 w-6 text-green-500" />
            </div>
            <span className="text-sm font-medium">política de privacidad</span>
          </button>

          {/* Legal Terms option */}
          <button
            className="flex flex-col items-center justify-center py-5 px-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
            onClick={() => window.open('/terms.html', '_blank')}
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 mb-3">
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
            <span className="text-sm font-medium">términos y condiciones</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
