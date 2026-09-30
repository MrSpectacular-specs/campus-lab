import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, ApiError } from './api';
import type { Profile } from './types';

interface AuthState {
  user: Profile | null;
  profile: Profile | null;
  session: boolean;
  loading: boolean;
  initError: string | null;
}

interface AuthContextValue extends AuthState {
  signUp: (
    email: string,
    password: string,
    meta: { full_name: string; role?: string; institution_id?: string }
  ) => Promise<{ error: string | null; user?: Profile | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; user?: Profile | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: false,
    loading: true,
    initError: null,
  });

  const checkSession = useCallback(async (): Promise<Profile | null> => {
    try {
      const data = await api.get<{ user: Profile | null }>('/api/auth/session');
      return data.user;
    } catch (err: unknown) {
      console.warn('[Auth: Session check failed]', err);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const user = await checkSession();
    setState((s) => ({
      ...s,
      user,
      profile: user,
      session: !!user,
    }));
  }, [checkSession]);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const user = await checkSession();
        if (isMounted) {
          setState({
            user,
            profile: user,
            session: !!user,
            loading: false,
            initError: null,
          });
        }
      } catch (err: unknown) {
        if (isMounted) {
          setState({
            user: null,
            profile: null,
            session: false,
            loading: false,
            initError: err instanceof Error ? err.message : 'Failed to connect to authentication server.',
          });
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [checkSession]);

  const signUp = async (
    email: string,
    password: string,
    meta: { full_name: string; role?: string; institution_id?: string }
  ) => {
    try {
      const res = await api.post<{ user: Profile }>('/api/auth/signup', {
        email: email.trim(),
        password,
        full_name: meta.full_name.trim(),
        institution_id: meta.institution_id,
      });

      setState({
        user: res.user,
        profile: res.user,
        session: true,
        loading: false,
        initError: null,
      });

      return { error: null, user: res.user };
    } catch (err: unknown) {
      let message = 'Failed to register account.';
      if (err instanceof ApiError) {
        message = err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      return { error: message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await api.post<{ user: Profile }>('/api/auth/login', {
        email: email.trim(),
        password,
      });

      setState({
        user: res.user,
        profile: res.user,
        session: true,
        loading: false,
        initError: null,
      });

      return { error: null, user: res.user };
    } catch (err: unknown) {
      let message = 'Failed to sign in.';
      if (err instanceof ApiError) {
        message = err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      return { error: message };
    }
  };

  const signOut = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err: unknown) {
      console.warn('[Auth: signOut error]', err);
    } finally {
      setState({
        user: null,
        profile: null,
        session: false,
        loading: false,
        initError: null,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default useAuth;
