import { useState } from 'react';
import { createDefaultMentor } from '../utils/createDefaultMentor';
import { toast } from 'react-toastify';

export default function SetupMentor() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSetup = async () => {
    setLoading(true);
    try {
      const user = await createDefaultMentor();
      setStatus('success');
      toast.success('Default mentor account created successfully!');
    } catch (error: any) {
      setStatus('error');
      toast.error(error.message || 'Failed to create default mentor account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Setup Default Mentor Account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                This will create a default mentor account with the following credentials:
              </p>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm font-mono">Username: mentor</p>
                <p className="text-sm font-mono">Password: 679687021</p>
              </div>
            </div>

            <div>
              <button
                onClick={handleSetup}
                disabled={loading || status === 'success'}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : status === 'success' ? 'Account created!' : 'Create default mentor account'}
              </button>
            </div>

            {status === 'success' && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Account created successfully! You can now{' '}
                  <a href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                    login
                  </a>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 