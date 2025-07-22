'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { getWhatsappBotLinkWithMessage } from '@/lib/constants/chat';

const templates = [
  {
    id: 1,
    img: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/hamburger-82s0wuWab90KQSshFoj2ZTDfK6Ij0q.png',
    name: '10 USD en delivery',
    message: 'gasté 10 dólares en delivery',
  },
  {
    id: 2,
    img: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/hamburger-82s0wuWab90KQSshFoj2ZTDfK6Ij0q.png',
    name: '6 USD en un Starbucks',
    message: 'gasté 6 dólares en un Starbucks',
  },
  {
    id: 3,
    img: 'https://9nyli2dgkyez2ban.public.blob.vercel-storage.com/shopping_trolley-cQNOSlcRRHPAheKqKd7KnLQiY1e6o2.png',
    name: '15 USD en mercado',
    message: 'gasté 15 dólares en mercado',
  },
];

interface MobileSuggestionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSuggestionsSheet: React.FC<MobileSuggestionsSheetProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed bottom-[80px] left-0 right-0 px-4 z-50 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-[#1A1A1A] rounded-2xl shadow-lg border border-white/10 overflow-hidden pointer-events-auto"
          >
            <div className="p-3">
              <div className="flex flex-col gap-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      window.open(
                        getWhatsappBotLinkWithMessage(template.message),
                        '_blank'
                      );
                      onClose();
                    }}
                    className="flex items-center gap-3 rounded-lg bg-[#272725] p-2.5 text-left text-white transition-colors hover:bg-[#272725]/80"
                  >
                    <img
                      src={template.img}
                      alt={template.name}
                      className="h-6 w-6"
                    />
                    <span className="text-sm">{template.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
