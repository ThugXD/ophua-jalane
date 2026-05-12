import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase, getCurrentUser } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isSignedIn: false,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setState({
          user,
          isLoading: false,
          isSignedIn: !!user,
        });
      } catch (error) {
        console.error('Error checking auth:', error);
        setState({
          user: null,
          isLoading: false,
          isSignedIn: false,
        });
      }
    };

    checkAuth();

    // Listen to auth state changes
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user || null,
        isLoading: false,
        isSignedIn: !!session?.user,
      });
      
      // Invalidate all queries when auth state changes
      queryClient.clear();
    });

    return () => {
      data?.subscription.unsubscribe();
    };
  }, [queryClient]);

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setState({
        user: data.user,
        isLoading: false,
        isSignedIn: true,
      });

      return { user: data.user, error: null };
    } catch (error) {
      setState({
        user: null,
        isLoading: false,
        isSignedIn: false,
      });
      return { user: null, error };
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, fullName: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
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

      if (error) throw error;

      setState({
        user: data.user || null,
        isLoading: false,
        isSignedIn: !!data.user,
      });

      return { user: data.user, error: null };
    } catch (error) {
      setState({
        user: null,
        isLoading: false,
        isSignedIn: false,
      });
      return { user: null, error };
    }
  }, []);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setState({
        user: null,
        isLoading: false,
        isSignedIn: false,
      });

      return { error: null };
    } catch (error) {
      return { error };
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }, []);

  return {
    ...state,
    login,
    signup,
    logout,
    resetPassword,
  };
}
