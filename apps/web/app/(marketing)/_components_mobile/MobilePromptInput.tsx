'use client';

import { useState, useEffect } from 'react';
import { LuSend } from 'react-icons/lu';
import { motion } from 'framer-motion';
import { getWhatsappBotLinkWithMessage } from '@/lib/constants/chat';

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

interface MobilePromptInputProps {
  onFocus: () => void;
  onBlur: () => void;
}

export const MobilePromptInput: React.FC<MobilePromptInputProps> = ({
  onFocus,
  onBlur,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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

  const handleSubmit = () => {
    if (inputValue.trim()) {
      window.open(getWhatsappBotLinkWithMessage(inputValue), '_blank');
      setInputValue('');
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur();
  };

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 pointer-events-none pb-6"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 300,
        delay: 1,
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="mx-4 pointer-events-auto flex justify-center"
      >
        <motion.div
          className="relative flex items-center"
          initial={{ width: '85%' }}
          animate={{ width: isFocused ? '100%' : '75%' }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <div className="w-full bg-[#1A1A1A] rounded-full shadow-lg">
            <input
              type="text"
              className="w-full rounded-full bg-[#272725] py-3.5 pl-4 pr-12 text-[16px] text-white placeholder:text-gray-400 focus:outline-none focus:ring-0 border border-white/10"
              placeholder={displayText}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <motion.button
              type="submit"
              className="absolute right-3 top-[11px] rounded-full p-1.5 text-white transition-colors hover:bg-white/10"
              disabled={!inputValue.trim()}
              animate={{ rotate: isFocused ? 45 : -10 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              <LuSend className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>
      </form>
    </motion.div>
  );
};
