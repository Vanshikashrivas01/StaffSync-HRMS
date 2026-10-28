import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';
import { api, setAuthToken, clearAuthToken, getAuthToken } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  quickSwitchRole: (targetRole: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (!getAuthToken()) {
        setIsLoading(false);
        return;
      }
      const data = await api.auth.getMe();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        clearAuthToken();
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.warn('Session verification failed, logging out:', err);
      clearAuthToken();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.auth.login({ email, password });
      if (data.token) {
        setAuthToken(data.token);
        setToken(data.token);
        setUser(data.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const data = await api.auth.register(userData);
      if (data.token) {
        setAuthToken(data.token);
        setToken(data.token);
        setUser(data.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setToken(null);
    setUser(null);
  };

  /**
   * Helper: Seamlessly switches between the 3 canonical roles:
   * 'hr' -> hr@staffsync.io
   * 'manager' -> manager@staffsync.io
   * 'employee' -> alex@staffsync.io
   */
  const quickSwitchRole = async (targetRole: UserRole) => {
    const credentialsMap: Record<UserRole, { email: string; pass: string }> = {
      hr: { email: 'hr@staffsync.io', pass: 'StaffSync@123' },
      manager: { email: 'manager@staffsync.io', pass: 'StaffSync@123' },
      employee: { email: 'alex@staffsync.io', pass: 'StaffSync@123' },
    };
    const creds = credentialsMap[targetRole];
    if (creds) {
      await login(creds.email, creds.pass);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isLoading,
        login,
        register,
        logout,
        quickSwitchRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
