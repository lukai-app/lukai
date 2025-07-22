'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const messages = [
  '/landing/message-es-1.png',
  '/landing/response-es-1.png',
  '/landing/message-es-2.png',
  '/landing/response-es-2.png',
  '/landing/message-es-3.png',
  '/landing/response-es-3.png',
];

export const ChatMessages: React.FC = () => {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsToShow = useMemo(() => messages.slice(0, index + 1), [index]);

  useEffect(() => {
    if (index < messages.length - 1) {
      const timeout = setTimeout(() => {
        setIndex((prevIndex) => prevIndex + 1);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [index]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="w-full relative gap-4 flex h-[120px] sm:w-[50%] mx-auto flex-col overflow-hidden p-2"
      >
        <AnimatePresence>
          {itemsToShow.map((message, index) => (
            <motion.img
              key={index}
              src={message}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, originY: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 40 }}
              alt="message"
              className={cn(
                'w-[70%] lg:w-[60%]',
                index % 2 === 0 ? 'self-end' : 'self-start'
              )}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[5%] bg-gradient-to-t from-background"></div>
    </div>
  );
};
