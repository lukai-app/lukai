import {
  useContext,
  createContext,
  type PropsWithChildren,
  useEffect,
  useState,
} from 'react';

import { env } from '@/env';
import { subscription_status } from '@/types';
import { useStorageState } from '@/lib/hooks/useStorageState';

export interface AppUser {
  id: string;
  name?: string;
  phone_number: string;
  country_code?: string;
  favorite_language?: string;
  favorite_currency_code?: string;
  favorite_locale?: string;
  favorite_timezone?: string;
  subscription?: {
    status: subscription_status;
  };
  expense_categories: {
    value: string;
    label: string;
    image_url?: string;
  }[];
  income_categories: {
    value: string;
    label: string;
    image_url?: string;
  }[];
  tags: {
    id: string;
    name: string;
  }[];
  expenses_count: number;
  used_currencies: string[];
}

interface FetchUserResponse {
  message: string;
  data: AppUser & {
    permanent_key: string;
    encryption_key: string;
  };
}

interface Session {
  token: string;
  encryptionKey: string;
  user: AppUser;
}

const AuthContext = createContext<{
  signIn: (params: Session) => void;
  signOut: () => void;
  session: Session | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  const [[isLoading, token], setToken] = useStorageState('lukai-auth-token');

  useEffect(() => {
    const fetchUser = async (token: string) => {
      setIsFetching(true);
      try {
        const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/v1/auth/me`, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.NEXT_PUBLIC_API_KEY,
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch user');
        const user: FetchUserResponse = await response.json();

        setUser(user.data);
        setSession({
          token,
          encryptionKey: user.data.permanent_key,
          user: user.data,
        });
      } catch (error) {
        console.error(error);
        setSession(null);
        setUser(null);
        setToken(null);
      } finally {
        setIsFetching(false);
      }
    };

    if (token && !user) {
      fetchUser(token);
    }
  }, [token, user]);

  const handleSignIn = (params: Session) => {
    setToken(params.token);
    setSession(params);
    setUser(params.user);
  };

  const handleSignOut = () => {
    setToken(null);
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        signIn: handleSignIn,
        signOut: handleSignOut,
        session: session && user ? { ...session, user } : null,
        isLoading: isLoading || isFetching,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
