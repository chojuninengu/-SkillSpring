import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getCourses, enrollInCourse } from '../../utils/api';
import toast from 'react-hot-toast';

export default function Courses() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCourses();
  }, [category, page]);

  const fetchCourses = async () => {
    try {
      const response = await getCourses({
        category: category || undefined,
        page,
        limit: 9
      });
      setCourses(response.data);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await enrollInCourse(courseId);
      toast.success('Successfully enrolled in course!');
      router.push('/dashboard');
    } catch (error) {
      if (error.response?.status === 401) {
        router.push('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to enroll in course');
      }
    }
  };

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

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
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
                      ${course.price}
                    </span>
                  </div>
                  <button
                    onClick={() => handleEnroll(course.id)}
                    className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {courses.length > 0 && (
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
                  disabled={courses.length < 9}
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