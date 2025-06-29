import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Clear any invalid tokens on startup
    const clearInvalidTokens = async () => {
      try {
        // Get the current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Error getting session, clearing auth state:', error.message);
          // Clear local storage if there's an error getting the session
          await supabase.auth.signOut({ scope: 'local' });
          if (mounted) {
            setUser(null);
            setSession(null);
          }
        } else if (currentSession) {
          if (mounted) {
            setUser(currentSession.user);
            setSession(currentSession);
          }
        }
      } catch (error) {
        console.warn('Error during auth initialization, clearing auth state:', error);
        // Clear local storage on any error
        await supabase.auth.signOut({ scope: 'local' });
        if (mounted) {
          setUser(null);
          setSession(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    clearInvalidTokens();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null);
          setSession(session);
        } else if (event === 'SIGNED_IN') {
          setUser(session?.user ?? null);
          setSession(session);
        } else if (event === 'USER_UPDATED') {
          setUser(session?.user ?? null);
          setSession(session);
        }

        // Handle token refresh errors
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.warn('Token refresh failed, signing out');
          await supabase.auth.signOut({ scope: 'local' });
          setUser(null);
          setSession(null);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      // Sign out from both local storage and server
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.warn('Error during sign out:', error);
        // Even if there's an error, clear local state
        await supabase.auth.signOut({ scope: 'local' });
      }
      
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      // Force clear local state on any error
      await supabase.auth.signOut({ scope: 'local' });
      setUser(null);
      setSession(null);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}