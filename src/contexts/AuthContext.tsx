
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

// Define user type
type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
} | null;

// Define auth context type
type AuthContextType = {
  user: AuthUser;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // Alias for signOut
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Set up auth state listener
  useEffect(() => {
    // Set a timeout to prevent infinite loading states
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("Auth loading timed out - forcing loading state to complete");
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout as a fallback

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        
        if (currentSession) {
          setSession(currentSession);
          try {
            // Fetch user profile from the profiles table
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .single();

            if (error) {
              console.error("Error fetching profile:", error);
              // If profile error, still use basic auth info instead of getting stuck
              setUser({
                id: currentSession.user.id,
                email: currentSession.user.email || '',
                name: currentSession.user.email?.split('@')[0] || '',
                role: 'user',
              });
            } else if (profile) {
              setUser({
                id: currentSession.user.id,
                email: profile.email,
                name: profile.name || '',
                role: profile.role as 'user' | 'admin',
              });
            } else {
              // If no profile found, use basic info from auth
              setUser({
                id: currentSession.user.id,
                email: currentSession.user.email || '',
                name: currentSession.user.email?.split('@')[0] || '',
                role: 'user',
              });
            }
          } catch (error) {
            console.error("Unexpected error in auth state change:", error);
            // Still set basic user info if there's an error
            setUser({
              id: currentSession.user.id,
              email: currentSession.user.email || '',
              name: currentSession.user.email?.split('@')[0] || '',
              role: 'user',
            });
          }
        } else {
          setSession(null);
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setIsLoading(false);
          return;
        }
        
        if (initialSession) {
          setSession(initialSession);
          try {
            // Fetch user profile
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', initialSession.user.id)
              .single();

            if (profileError) {
              console.error("Error fetching profile:", profileError);
              // Use basic auth info if profile fetch fails
              setUser({
                id: initialSession.user.id,
                email: initialSession.user.email || '',
                name: initialSession.user.email?.split('@')[0] || '',
                role: 'user',
              });
            } else if (profile) {
              setUser({
                id: initialSession.user.id,
                email: profile.email,
                name: profile.name || '',
                role: profile.role as 'user' | 'admin',
              });
            } else {
              // If no profile found, use basic info from auth
              setUser({
                id: initialSession.user.id,
                email: initialSession.user.email || '',
                name: initialSession.user.email?.split('@')[0] || '',
                role: 'user',
              });
            }
          } catch (err) {
            console.error("Unexpected error in initial auth:", err);
            // Still set basic user info
            setUser({
              id: initialSession.user.id,
              email: initialSession.user.email || '',
              name: initialSession.user.email?.split('@')[0] || '',
              role: 'user',
            });
          }
        }
        
        // Always complete loading, even if there's an error
        setIsLoading(false);
      } catch (e) {
        console.error("Critical auth initialization error:", e);
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    console.log("Attempting to sign in with:", email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Sign in error:", error);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user) {
        toast({
          title: "Sign in successful",
          description: `Welcome back, ${data.user.email?.split('@')[0] || 'User'}!`,
        });
      }
      
      return { error };
    } catch (error) {
      console.error("Unexpected sign in error:", error);
      return { error: error as Error };
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, name: string) => {
    console.log("Attempting to sign up with:", email);
    
    try {
      // For easier testing, we'll use email confirmation bypass
      // In production, you should enable email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          },
          emailRedirectTo: window.location.origin + '/login'
        }
      });
      
      if (error) {
        console.error("Sign up error:", error);
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user) {
        toast({
          title: "Sign up successful",
          description: "Your account has been created. You can now sign in.",
        });
      }
      
      return { error };
    } catch (error) {
      console.error("Unexpected sign up error:", error);
      return { error: error as Error };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out failed",
        description: "There was an error signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Context value
  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    logout: signOut, // Add logout as an alias for backward compatibility
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
