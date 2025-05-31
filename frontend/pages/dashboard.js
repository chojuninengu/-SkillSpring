import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, courses, progress, enrollments, handleApiError } from '../utils/api';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [courseList, setCourseList] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [overallProgress, setOverallProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          userResponse,
          coursesResponse,
          enrollmentsResponse,
          progressResponse
        ] = await Promise.all([
          auth.getCurrentUser(),
          courses.getAll({ limit: 5 }),
          enrollments.getMyEnrollments(),
          progress.getOverallProgress()
        ]);

        setUser(userResponse.data);
        setCourseList(coursesResponse.data);
        setEnrolledCourses(enrollmentsResponse.data);
        setOverallProgress(progressResponse.data);
      } catch (error) {
        handleApiError(error, 'Failed to load dashboard data');
        if (error.response?.status === 401) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
              <p className="mt-2 text-3xl font-semibold text-primary-600">
                {enrolledCourses.length}
              </p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">Completed Courses</h3>
              <p className="mt-2 text-3xl font-semibold text-green-600">
                {overallProgress?.completedCourses || 0}
              </p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">Overall Progress</h3>
              <p className="mt-2 text-3xl font-semibold text-blue-600">
                {overallProgress?.overallPercentage || 0}%
              </p>
            </div>
          </div>

          {/* Enrolled Courses */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
              <button
                onClick={() => router.push('/courses')}
                className="text-primary-600 hover:text-primary-700"
              >
                View all
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map((enrollment) => (
                <div key={enrollment.course_id} className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {enrollment.course.title}
                  </h3>
                  <p className="mt-1 text-gray-500 line-clamp-2">
                    {enrollment.course.description}
                  </p>
                  <div className="mt-4">
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block text-primary-600">
                            Progress: {enrollment.progress || 0}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-100">
                        <div
                          style={{ width: `${enrollment.progress || 0}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                        ></div>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/courses/${enrollment.course_id}`)}
                      className="mt-2 w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Continue Learning
                    </button>
                  </div>
                </div>
              ))}
              {enrolledCourses.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  You haven't enrolled in any courses yet.{' '}
                  <button
                    onClick={() => router.push('/courses')}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Browse courses
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Available Courses */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recommended Courses</h2>
              <button
                onClick={() => router.push('/courses')}
                className="text-primary-600 hover:text-primary-700"
              >
                View all
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courseList.map((course) => (
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