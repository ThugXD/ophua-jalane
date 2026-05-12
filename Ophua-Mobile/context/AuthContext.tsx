import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/lib/constants';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      
      if (data.session?.user) {
        setUser({
          id: data.session.user.id,
          email: data.session.user.email || '',
          user_metadata: data.session.user.user_metadata,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthContext] Error checking auth:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.session?.user) {
        setUser({
          id: data.session.user.id,
          email: data.session.user.email || '',
          user_metadata: data.session.user.user_metadata,
        });
      }
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      throw error;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          user_metadata: data.user.user_metadata,
        });
      }
    } catch (error) {
      console.error('[AuthContext] Signup error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      setUser(null);
      await AsyncStorage.removeItem(STORAGE_KEYS.authToken);
      await AsyncStorage.removeItem(STORAGE_KEYS.authRefresh);
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'ophua://reset-password',
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('[AuthContext] Reset password error:', error);
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isSignedIn: !!user,
        login,
        signup,
        logout,
        resetPassword,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
