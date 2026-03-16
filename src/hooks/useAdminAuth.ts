'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface AdminAuthResult {
  isAdmin: boolean;
  isLoading: boolean;
  loading: boolean; // Alias for isLoading for withAuth.tsx
  isAdminLoading: boolean; // Alias for isLoading for backward compatibility
  user: any;
}

export const useAdminAuth = (): AdminAuthResult => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (authLoading) return;

      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data?.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [user, authLoading]);

  return { isAdmin, isLoading, loading: isLoading, isAdminLoading: isLoading, user };
};
