import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { clearAccessToken, getAccessToken, setAccessToken } from '../../lib/storage';
import { fetchCurrentUser, loginUser, registerUser } from './auth-api';
import type { CurrentUser, LoginFormValues, RegisterFormValues } from './auth-types';

interface AuthContextValue {
  accessToken: string | null;
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (values: LoginFormValues) => Promise<void>;
  register: (values: RegisterFormValues) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(() => getAccessToken());
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const logout = useCallback(() => {
    clearAccessToken();
    setAccessTokenState(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const currentUser = await fetchCurrentUser(token);
      setUser(currentUser);
      setAccessTokenState(token);
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    void (async () => {
      await refreshUser();
      setIsBootstrapping(false);
    })();
  }, [refreshUser]);

  const login = useCallback(async (values: LoginFormValues) => {
    const token = await loginUser(values);
    setAccessToken(token.access_token);
    setAccessTokenState(token.access_token);
    const currentUser = await fetchCurrentUser(token.access_token);
    setUser(currentUser);
  }, []);

  const register = useCallback(async (values: RegisterFormValues) => {
    await registerUser(values);
    await login({ email: values.email, password: values.password });
  }, [login]);

  const value = useMemo<AuthContextValue>(() => ({
    accessToken,
    user,
    isAuthenticated: Boolean(accessToken && user),
    isBootstrapping,
    login,
    register,
    logout,
    refreshUser,
  }), [accessToken, user, isBootstrapping, login, register, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
