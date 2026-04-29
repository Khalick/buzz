"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
        router.push('/login?error=auth_failed');
        return;
      }

      if (session?.user) {
        // Ensure public.users row exists (fallback for edge cases)
        try {
          const user = session.user;
          await supabase.from('users').upsert(
            {
              id: user.id,
              email: user.email || '',
              display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
              role: 'user',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id', ignoreDuplicates: true }
          );
        } catch (err) {
          console.error('User profile upsert error (non-fatal):', err);
        }
        router.push('/admin');
      } else {
        router.push('/login');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
