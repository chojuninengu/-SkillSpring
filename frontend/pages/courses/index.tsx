import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  price_formatted: string;
  mentor_name: string;
  category: string;
  enrolled_students: number;
}

export default function Courses() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [category, setCategory] = useState('');

  useEffect(() => {
    loadCourses();
  }, [category]);

  const loadCourses = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/courses${category ? `?category=${category}` : ''}`);
      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrolling(courseId);
      // Redirect to login if not authenticated
      router.push(`/login?redirect=/courses/${courseId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Available Courses</h1>
          <p className="mt-2 text-sm text-gray-700">
            Browse through our selection of courses and enroll in the ones that interest you.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            <option value="Programming">Programming</option>
            <option value="Marketing">Marketing</option>
            <option value="Design">Design</option>
            <option value="Business">Business</option>
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
          >
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{course.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">By {course.mentor_name}</span>
                <span className="text-lg font-medium text-gray-900">{course.price_formatted}</span>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {course.enrolled_students} student{course.enrolled_students !== 1 ? 's' : ''} enrolled
              </div>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <button
                onClick={() => handleEnroll(course.id)}
                disabled={enrolling === course.id}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enrolling === course.id ? 'Processing...' : 'Enroll Now'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 