"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isReady: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isReady: false,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // On mount, quietly check if there's an existing session
  useEffect(() => {
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (session?.user) {
          const admin = await verifyAdmin(session.user.id);
          if (admin) {
            setUser(session.user);
            setIsAdmin(true);
            setIsReady(true);
          }
        }
      })
      .catch(() => {
        // Supabase unreachable — login page is already showing, do nothing
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        setIsAdmin(false);
        setIsReady(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function verifyAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      if (error) return false;
      return data?.role === 'admin';
    } catch {
      return false;
    }
  }

  async function signIn(email: string, password: string): Promise<{ error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };

      if (!data.user) return { error: 'Sign-in failed. Please try again.' };

      // Verify this user is an admin
      const admin = await verifyAdmin(data.user.id);
      if (!admin) {
        await supabase.auth.signOut();
        return { error: 'Access denied. This account does not have admin privileges.' };
      }

      setUser(data.user);
      setIsAdmin(true);
      setIsReady(true);
      return { error: null };
    } catch {
      return { error: 'Could not connect to the server. Please try again.' };
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setIsReady(false);
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, isReady, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
