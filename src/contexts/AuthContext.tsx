
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean; // Add alias for compatibility
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        // Defer admin status check to avoid deadlock
        setTimeout(async () => {
          const adminStatus = await checkAdminStatus(session.user.id);
          setIsAdmin(adminStatus);
        }, 0);
      } else {
        setIsAdmin(false);
      }
    });
    
    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      console.log('Initial session check:', session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        setTimeout(async () => {
          const adminStatus = await checkAdminStatus(session.user.id);
          setIsAdmin(adminStatus);
        }, 0);
      }
    });
    
    return () => {
      console.log('AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);
  
  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching admin status:", error);
        return false;
      }
      
      return data?.role === 'admin';
    } catch (err) {
      console.error("Exception checking admin status:", err);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting to sign in with email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: 'Error signing in',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }
      
      console.log('Sign in successful:', data.user?.email);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
      
      return { error: null };
    } catch (err) {
      console.error('Sign in exception:', err);
      const error = { message: 'An unexpected error occurred' };
      toast({
        title: 'Error signing in',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      console.log('Attempting to sign up with email:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        toast({
          title: 'Error signing up',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }
      
      console.log('Sign up successful:', data.user?.email);
      toast({
        title: 'Account created!',
        description: 'Please check your email to verify your account.',
      });
      
      return { error: null };
    } catch (err) {
      console.error('Sign up exception:', err);
      const error = { message: 'An unexpected error occurred' };
      toast({
        title: 'Error signing up',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('Attempting to sign out');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: 'Error signing out',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        console.log('Sign out successful');
        toast({
          title: 'Signed out',
          description: 'You have been signed out successfully.',
        });
      }
    } catch (err) {
      console.error('Sign out exception:', err);
      toast({
        title: 'Error signing out',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isLoading: loading, // Alias for compatibility
        isAdmin,
        signIn,
        signUp,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
