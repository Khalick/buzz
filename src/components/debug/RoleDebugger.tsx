"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

const RoleDebugger = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkUserRole = async () => {
    if (!user) {
      setDebugInfo({ error: 'No user logged in' });
      return;
    }

    setLoading(true);
    try {
      // Get latest user data from DB
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: { session } } = await supabase.auth.getSession();

      setDebugInfo({
        id: user.id,
        email: user.email,
        metadata: user.user_metadata,
        role: userData?.role,
        dbUser: userData,
        session: {
          expires_at: session?.expires_at,
          token_type: session?.token_type
        }
      });
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setDebugInfo({ error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const forceTokenRefresh = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) throw error;
      alert('Session refreshed! Try accessing admin pages again.');
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert('Error refreshing session: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Role Debugger</h2>
          <p className="text-gray-600">Please log in first to debug your role.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Role Debugger</h2>

        <div className="space-y-4">
          <button
            onClick={checkUserRole}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check Current Role'}
          </button>

          <button
            onClick={forceTokenRefresh}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 ml-2"
          >
            {loading ? 'Refreshing...' : 'Force Session Refresh'}
          </button>

          {debugInfo && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold mb-2">Debug Information:</h3>
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap bg-gray-50 p-3 rounded border">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-medium text-yellow-800">Current Status:</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  <strong>Role:</strong> {debugInfo.role || 'user'}<br />
                  <strong>Is Admin:</strong> {debugInfo.role === 'admin' ? 'YES' : 'NO'}<br />
                  {debugInfo.role === 'admin' && (
                    <span className="text-green-600">✅ You should have admin access!</span>
                  )}
                  {debugInfo.role !== 'admin' && (
                    <span className="text-red-600">❌ You don't have admin access</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleDebugger;