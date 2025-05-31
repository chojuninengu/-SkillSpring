import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser, getCourses } from '../utils/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, coursesResponse] = await Promise.all([
          getCurrentUser(),
          getCourses({ limit: 5 })
        ]);
        setUser(userResponse.data);
        setCourses(coursesResponse.data);
      } catch (error) {
        toast.error('Failed to load dashboard data');
        if (error.response?.status === 401) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="mt-1 text-gray-500">
              You're logged in as a {user?.role}.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">Enrolled Courses</h3>
              <p className="mt-2 text-3xl font-semibold text-primary-600">0</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">Completed Courses</h3>
              <p className="mt-2 text-3xl font-semibold text-green-600">0</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">Hours Learned</h3>
              <p className="mt-2 text-3xl font-semibold text-blue-600">0</p>
            </div>
          </div>

          {/* Recent Courses */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Courses</h2>
              <button
                onClick={() => router.push('/courses')}
                className="text-primary-600 hover:text-primary-700"
              >
                View all
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div key={course.id} className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                  <p className="mt-1 text-gray-500 line-clamp-2">{course.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">By {course.mentor_name}</span>
                    <button
                      onClick={() => router.push(`/courses/${course.id}`)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Learn more
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 