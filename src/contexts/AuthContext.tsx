
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const runtimeEnv = typeof process !== 'undefined' ? process.env : undefined;
const adminEmailEnv = (import.meta.env?.VITE_ADMIN_EMAILS ?? runtimeEnv?.VITE_ADMIN_EMAILS ?? '') as string;
const adminEmailSet = new Set(
  adminEmailEnv
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

const deriveAdminFromUser = (user: User | null) => {
  if (!user) {
    return false;
  }

  const metadataRole = (user.user_metadata?.role ?? user.app_metadata?.role ?? '') as string;
  if (typeof metadataRole === 'string' && metadataRole.toLowerCase() === 'admin') {
    return true;
  }

  const email = user.email?.toLowerCase();
  if (email && adminEmailSet.has(email)) {
    return true;
  }

  return false;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const isAdminFromMetadata = deriveAdminFromUser(session.user);
        if (isAdminFromMetadata) {
          setIsAdmin(true);
        } else {
          setTimeout(async () => {
            try {
              const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .maybeSingle();

              if (!error && data?.role === 'admin') {
                setIsAdmin(true);
              } else {
                setIsAdmin(false);
              }
            } catch (err) {
              console.error('Error checking admin status:', err);
              setIsAdmin(false);
            }
          }, 100);
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }

      setSession(session);
      setUser(session?.user ?? null);
      setIsAdmin(deriveAdminFromUser(session?.user ?? null));
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

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

      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });

      if (data?.user) {
        const metadataAdmin = deriveAdminFromUser(data.user);
        setIsAdmin(metadataAdmin);

        if (!metadataAdmin) {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', data.user.id)
              .maybeSingle();

            if (profileData?.role === 'admin') {
              setIsAdmin(true);
            }
          } catch (err) {
            console.error('Error checking admin status on sign-in:', err);
          }
        }
      }
      
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

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: 'Error signing out',
          description: error.message,
          variant: 'destructive',
        });
      } else {
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
        isLoading: loading,
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
