'use client';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { useSession } from '@/app/_components/session-provider';

interface AppContextProps {
  currency: string;
  setCurrency: (currency: string) => void;
  year: number;
  setYear: (year: number) => void;
  month: number;
  setMonth: (month: number) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { session } = useSession();
  const [currency, setCurrency] = useState<string>(() => {
    return session?.user.favorite_currency_code ?? 'USD';
  });
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const sessionProcessedRef = useRef(false);

  useEffect(() => {
    if (session?.user.favorite_currency_code && !sessionProcessedRef.current) {
      setCurrency(session.user.favorite_currency_code);
      sessionProcessedRef.current = true;
    }
  }, [session]);

  return (
    <AppContext.Provider
      value={{ currency, setCurrency, year, setYear, month, setMonth }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
