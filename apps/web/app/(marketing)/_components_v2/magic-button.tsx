'use client';
import { cn } from '@/lib/utils';
import { getWhatsappBotLinkWithMessage } from '@/lib/constants/chat';

export const MagicButton: React.FC = () => {
  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2">
      <button
        onClick={() => {
          window.open(
            getWhatsappBotLinkWithMessage('hola!! soy nuevo en la app'),
            '_blank'
          );
        }}
        className={cn(
          'group relative text-sm min-w-fit group flex items-center gap-2 border border-[#40403F] rounded-full px-4 md:px-6 hover:bg-black py-1.5 mb-4.5'
        )}
      >
        <p className="text-xs md:text-sm whitespace-nowrap">
          <span>✨ AI Finance on WhatsApp!</span>
        </p>
        <span className="absolute z-10 -top-px left-1/2 -translate-x-1/2 h-px w-[calc(100%)] bg-gradient-to-r from-lemon/0 via-lemon to-lemon/0 opacity-0 group-hover:opacity-100 transition-opacity transition-theme"></span>
        <span className="absolute z-10 -top-px left-1/2 -translate-x-1/2 h-px w-[60px] bg-gradient-to-r from-lemon/0 via-lemon to-lemon/0 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity transition-theme"></span>
      </button>
    </div>
  );
};
