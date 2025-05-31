import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function TestSupabase() {
  const [status, setStatus] = useState<string>('Testing connection...');

  useEffect(() => {
    async function testConnection() {
      try {
        // Try to get the current user - a simple way to test the connection
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        setStatus('✅ Supabase connection successful! Session check completed.');
        console.log('Connection test result:', { data });
      } catch (error) {
        setStatus(`❌ Connection failed: ${error.message}`);
        console.error('Connection test error:', error);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Supabase Connection Test
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {status}
          </p>
        </div>
      </div>
    </div>
  );
} 