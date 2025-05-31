import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../utils/supabaseAuth';
import { getEnrollments, updateCourseProgress } from '../utils/supabaseDb';
import ProtectedRoute from '../components/ProtectedRoute';
import { toast } from 'react-toastify';

interface Enrollment {
  id: string;
  progress: number;
  courses: {
    id: string;
    title: string;
    description: string;
  };
}

export default function Dashboard() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);

      const enrollmentsData = await getEnrollments(userData.id);
      setEnrollments(enrollmentsData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (enrollmentId: string, progress: number) => {
    try {
      await updateCourseProgress(enrollmentId, progress);
      toast.success('Progress updated successfully');
      
      // Refresh enrollments to show updated progress
      const userData = await getCurrentUser();
      const enrollmentsData = await getEnrollments(userData.id);
      setEnrollments(enrollmentsData);
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  // Don't render anything on the server
  if (!mounted) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">My Dashboard</h1>
            {loading ? (
              <div className="mt-2 h-4 bg-gray-200 rounded animate-pulse w-48"></div>
            ) : (
              <p className="mt-2 text-sm text-gray-700">
                Welcome back, {user?.user_metadata?.name || 'Student'}!
              </p>
            )}
          </div>
          <div className="mt-4 sm:mt-0">
            <a
              href="/courses"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Browse Courses
            </a>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Your Courses</h2>
          {loading ? (
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white shadow rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : enrollments.length > 0 ? (
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {enrollment.courses.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {enrollment.courses.description}
                  </p>
                  <div className="mt-4">
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
                            Progress
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-primary-600">
                            {enrollment.progress}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200">
                        <div
                          style={{ width: `${enrollment.progress}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 bg-white shadow rounded-lg p-6 text-center text-gray-500">
              You haven't enrolled in any courses yet.
              <div className="mt-4">
                <a
                  href="/courses"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                  Browse Courses
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 