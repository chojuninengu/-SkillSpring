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

interface PaymentFormData {
  phoneNumber: string;
}

export default function Courses() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [paymentFormData, setPaymentFormData] = useState<PaymentFormData>({
    phoneNumber: '',
  });

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

  const handleEnroll = async (course: Course) => {
    try {
      setEnrolling(course.id);
      setSelectedCourse(course);
      
      // Check if user is authenticated by making a request to a protected endpoint
      const authCheckResponse = await fetch('http://localhost:3001/api/auth/check', {
        credentials: 'include'
      });

      if (!authCheckResponse.ok) {
        // Not authenticated, redirect to login
        router.push(`/login?redirect=/courses/${course.id}`);
        return;
      }

      // User is authenticated, show payment modal
      setShowPaymentModal(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to start enrollment process');
    } finally {
      setEnrolling(null);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      const response = await fetch('http://localhost:3001/api/payments/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId: selectedCourse.id,
          amount: selectedCourse.price,
          phoneNumber: paymentFormData.phoneNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Payment successful! You are now enrolled in the course.');
        setShowPaymentModal(false);
        router.push('/dashboard');
      } else {
        toast.error(data.message || 'Payment failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
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
                onClick={() => handleEnroll(course)}
                disabled={enrolling === course.id}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enrolling === course.id ? 'Processing...' : 'Enroll Now'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedCourse && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Complete Payment</h2>
            <p className="mb-4">
              Course: {selectedCourse.title}<br />
              Amount: {selectedCourse.price_formatted}
            </p>
            <form onSubmit={handlePaymentSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Money Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Enter your mobile money number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={paymentFormData.phoneNumber}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, phoneNumber: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Pay Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 