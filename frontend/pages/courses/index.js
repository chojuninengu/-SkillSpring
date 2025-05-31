import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { courses, enrollments, handleApiError, handleApiSuccess } from '../../utils/api';

// Helper function to format price from cents to dollars
const formatPrice = (cents) => {
  return `$${(cents / 100).toFixed(2)}`;
};

export default function Courses() {
  const router = useRouter();
  const [courseList, setCourseList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCourses();
  }, [category, page]);

  const fetchCourses = async () => {
    try {
      const response = await courses.getAll({
        category: category || undefined,
        page,
        limit: 9
      });
      setCourseList(response.data);
    } catch (error) {
      handleApiError(error, 'Failed to load courses');
      setCourseList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId);
    try {
      await courses.enroll(courseId);
      handleApiSuccess('Successfully enrolled in course!');
      
      // Check enrollment status
      const status = await enrollments.getEnrollmentStatus(courseId);
      if (status.data.status === 'active') {
        router.push('/dashboard');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        router.push('/login');
      } else {
        handleApiError(error, 'Failed to enroll in course');
      }
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Available Courses</h1>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>

          {courseList && courseList.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courseList.map((course) => (
                <div key={course.id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-500 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">By {course.mentor_name}</span>
                      <span className="text-lg font-medium text-gray-900">
                        {formatPrice(course.price)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrolling === course.id}
                      className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No courses found.</p>
            </div>
          )}

          {courseList && courseList.length > 0 && (
            <div className="mt-6 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-md bg-white shadow disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">{page}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={courseList.length < 9}
                  className="px-3 py-1 rounded-md bg-white shadow disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 