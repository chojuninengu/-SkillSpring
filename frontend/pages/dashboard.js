import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser, isAuthenticated } from '../utils/auth';

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const currentUser = getCurrentUser();
    if (currentUser?.role !== 'student') {
      router.push('/login');
      return;
    }

    setUser(currentUser);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user?.name}!
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Student Dashboard
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Enrolled Courses Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Enrolled Courses
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  0
                </dd>
              </div>
            </div>

            {/* Completed Courses Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Completed Courses
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  0
                </dd>
              </div>
            </div>

            {/* Progress Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Overall Progress
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  0%
                </dd>
              </div>
            </div>
          </div>

          {/* Browse Courses Button */}
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => router.push('/courses')}
            >
              Browse Courses
            </button>
          </div>

          {/* Enrolled Courses List */}
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Your Courses</h2>
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
              <div className="p-4 text-center text-gray-500">
                No courses enrolled yet
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 