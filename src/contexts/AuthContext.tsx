import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any;
  }>;
  signUp: (email: string, password: string, username: string) => Promise<{
    error: Error | null;
    data: any;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: Error | null;
    data: any;
  }>;
  updatePassword: (password: string) => Promise<{
    error: Error | null;
    data: any;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get session and user on mount
    const fetchSession = async () => {
      setLoading(true);
      try {
        const deploymentMode = import.meta.env.VITE_DEPLOYMENT_MODE;
        
        if (deploymentMode === 'blockchain-only') {
          // Check localStorage for mock session
          const storedUser = localStorage.getItem('veridica_user');
          const storedSession = localStorage.getItem('veridica_session');
          
          if (storedUser && storedSession) {
            const user = JSON.parse(storedUser);
            const session = JSON.parse(storedSession);
            
            // Check if session is still valid (7 days)
            if (session.expires_at > Date.now()) {
              setUser(user);
              setSession(session);
            } else {
              // Session expired, clear storage
              localStorage.removeItem('veridica_user');
              localStorage.removeItem('veridica_session');
            }
          }
        } else {
          // Full mode - use Supabase
          const { data: { session } } = await supabase.auth.getSession();
          setSession(session);
          setUser(session?.user ?? null);
          
          // Listen for auth changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
              setSession(session);
              setUser(session?.user ?? null);
            }
          );
          
          // Cleanup subscription
          return () => subscription.unsubscribe();
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  // Set up a session refresh interval to prevent logout on page refresh
  useEffect(() => {
    // Refresh session every 10 minutes to keep it active
    const refreshInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          console.warn('Session refresh failed:', error);
        } else if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
      } catch (err) {
        console.error('Error refreshing session:', err);
      }
    }, 10 * 60 * 1000); // 10 minutes
    
    return () => clearInterval(refreshInterval);
  }, []);

  const signIn = async (email: string, password: string) => {
    const deploymentMode = import.meta.env.VITE_DEPLOYMENT_MODE;
    
    if (deploymentMode === 'blockchain-only') {
      // In blockchain-only mode, check localStorage for existing user
      try {
        const storedUser = localStorage.getItem('veridica_user');
        
        if (storedUser) {
          const user = JSON.parse(storedUser);
          
          // Simple email match (in real app, you'd want more security)
          if (user.email === email) {
            // Create new session
            const session = {
              user,
              access_token: 'mock_token_' + Date.now(),
              expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
            };
            
            localStorage.setItem('veridica_session', JSON.stringify(session));
            setUser(user);
            setSession(session as any);
            
            return { data: { user, session }, error: null };
          }
        }
        
        // User not found or email doesn't match
        return { 
          data: null, 
          error: { message: 'Invalid login credentials' } as Error 
        };
      } catch (error) {
        return { error: error as Error, data: null };
      }
    } else {
      // Full mode - use Supabase
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        return { data, error };
      } catch (error) {
        return { error: error as Error, data: null };
      }
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    const deploymentMode = import.meta.env.VITE_DEPLOYMENT_MODE;
    
    if (deploymentMode === 'blockchain-only') {
      // In blockchain-only mode, create a mock user that works with the UI
      try {
        // Create a fake but functional user object
        const mockUser = {
          id: crypto.randomUUID(),
          email,
          user_metadata: {
            username,
            display_name: username
          },
          created_at: new Date().toISOString(),
          aud: 'authenticated',
          role: 'authenticated'
        };
        
        // Store in localStorage to persist across sessions
        localStorage.setItem('veridica_user', JSON.stringify(mockUser));
        localStorage.setItem('veridica_session', JSON.stringify({
          user: mockUser,
          access_token: 'mock_token_' + Date.now(),
          expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        }));
        
        // Set the user immediately
        setUser(mockUser as any);
        setSession({
          user: mockUser,
          access_token: 'mock_token_' + Date.now(),
          expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000)
        } as any);
        
        return { 
          data: { user: mockUser, session: null }, 
          error: null 
        };
      } catch (error) {
        return { error: error as Error, data: null };
      }
    } else {
      // Full mode - use Supabase (requires Pro plan)
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        });

        if (!error && data.user) {
          // Create a user profile in the users table
          const { error: profileError } = await supabase.from('users').insert([
            {
              id: data.user.id,
              username,
              email,
            },
          ]);

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }
        }

        return { data, error };
      } catch (error) {
        return { error: error as Error, data: null };
      }
    }
  };

  const signOut = async () => {
    const deploymentMode = import.meta.env.VITE_DEPLOYMENT_MODE;
    
    if (deploymentMode === 'blockchain-only') {
      // Clear localStorage and state
      localStorage.removeItem('veridica_user');
      localStorage.removeItem('veridica_session');
      setUser(null);
      setSession(null);
    } else {
      // Full mode - use Supabase
      await supabase.auth.signOut();
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { data, error };
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });
      return { data, error };
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}