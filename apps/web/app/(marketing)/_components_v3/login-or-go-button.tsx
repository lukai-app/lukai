'use client';

import { LuArrowRight } from 'react-icons/lu';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import { useSession } from '@/app/_components/session-provider';

import { Button } from '@/components/ui/button';

const buttonVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

export const LoginOrGoButton: React.FC = () => {
  const { session } = useSession();

  return (
    <div className="relative h-[40px]">
      <AnimatePresence mode="wait">
        {session ? (
          <motion.div
            key="dashboard"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={buttonVariants}
          >
            <Link href="/dashboard" prefetch>
              <Button
                variant="ghost"
                className="text-black w-[140px] text-sm gap-1 font-semibold hover:bg-black/10 hover:text-black"
              >
                Ir a la app
                <LuArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={buttonVariants}
          >
            <Link href="/login" prefetch>
              <Button
                variant="ghost"
                className="text-black w-[140px] text-sm gap-1 font-semibold hover:bg-black/10 hover:text-black"
              >
                Iniciar sesión
                <LuArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
