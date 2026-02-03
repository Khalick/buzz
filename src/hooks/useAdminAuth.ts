'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      if (authLoading) return;

      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data?.role === 'admin') {
          setIsAdmin(true);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [user, authLoading, router]);

  return { isAdmin, isLoading, loading: isLoading, isAdminLoading: isLoading, user };
};
