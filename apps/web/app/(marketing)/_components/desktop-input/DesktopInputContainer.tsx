'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuSend } from 'react-icons/lu';
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

const promptCompletions = [
  'registra tu primer gasto',
  'gasté en...',
  'gasté en transporte...',
  'gasté 6 dólares en...',
  'gasté en entretenimiento...',
  'tuve un ingreso de...',
  'gané 200 dólares...',
];

const TYPING_SPEED = 15; // Speed of typing each character
const DELETING_SPEED = 5; // Speed of deleting each character
const PAUSE_DURATION = 1500; // How long to pause when text is fully typed

interface DesktopInputContainerProps {
  onFocusChange?: (focused: boolean) => void;
}

export const DesktopInputContainer = ({
  onFocusChange,
}: DesktopInputContainerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Placeholder animation states
  const [displayText, setDisplayText] = useState('');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const animateText = () => {
      const currentCompletion = promptCompletions[currentPromptIndex];

      if (isWaiting) {
        timeout = setTimeout(() => {
          setIsWaiting(false);
          setIsDeleting(true);
        }, PAUSE_DURATION);
        return;
      }

      if (isDeleting) {
        if (displayText === '') {
          setIsDeleting(false);
          setCurrentPromptIndex(
            (prev) => (prev + 1) % promptCompletions.length
          );
        } else {
          timeout = setTimeout(() => {
            setDisplayText((prev) => prev.slice(0, -1));
          }, DELETING_SPEED);
        }
      } else {
        if (displayText === currentCompletion) {
          setIsWaiting(true);
        } else {
          timeout = setTimeout(() => {
            setDisplayText(currentCompletion.slice(0, displayText.length + 1));
          }, TYPING_SPEED);
        }
      }
    };

    timeout = setTimeout(animateText, 50);

    return () => clearTimeout(timeout);
  }, [displayText, currentPromptIndex, isDeleting, isWaiting]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    window.open(
      getWhatsappBotLinkWithMessage(
        inputValue.trim() || 'hola, soy nuevo en la app'
      ),
      '_blank'
    );
    setInputValue('');
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex justify-center">
        <motion.div
          className="relative flex w-full items-center"
          animate={{
            width: isFocused ? '500px' : '300px',
            height: isFocused ? '52px' : '48px',
          }}
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 150,
          }}
        >
          <div className="w-full h-full bg-[#1A1A1A] rounded-full shadow-lg transition-all duration-300">
            <input
              type="text"
              className="w-full h-full rounded-full bg-[#272725] px-4 pr-12 text-[15px] text-white placeholder:text-gray-400 focus:outline-none border border-white/10 transition-all"
              placeholder={displayText}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => {
                setIsFocused(true);
                setIsOpen(true);
                onFocusChange?.(true);
              }}
              onBlur={() => {
                setIsFocused(false);
                setTimeout(() => {
                  setIsOpen(false);
                  onFocusChange?.(false);
                }, 100);
              }}
            />
            <motion.button
              type="button"
              className="absolute right-3 top-[13px] rounded-full p-1.5 text-white transition-colors hover:bg-white/10"
              disabled={!inputValue.trim()}
              animate={{
                rotate: isFocused ? 45 : -10,
              }}
              onClick={handleSubmit}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              <LuSend className="h-4 w-4" />
            </motion.button>
          </div>
        </motion.div>
      </form>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] rounded-2xl shadow-lg border border-white/10 overflow-hidden z-50"
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
                      setIsOpen(false);
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
        )}
      </AnimatePresence>
    </div>
  );
};
