import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { courses, enrollments, payments } from '../../utils/api';

// Helper function to format price from cents to dollars
const formatPrice = (cents) => {
  return `$${(cents / 100).toFixed(2)}`;
};

export default function Courses() {
  const router = useRouter();
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courses.getAll();
      setCourseList(response.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (course) => {
    try {
      setEnrolling(course.id);
      setSelectedCourse(course);

      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        router.push(`/login?redirect=/courses`);
        return;
      }

      // Show payment modal
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error starting enrollment:', error);
      toast.error(error.message || 'Failed to start enrollment process');
    } finally {
      setEnrolling(null);
    }
  };

  const handlePayment = async () => {
    if (!selectedCourse) return;

    try {
      // Create payment
      const paymentResponse = await payments.create({
        courseId: selectedCourse.id
      });

      if (paymentResponse.data.success) {
        toast.success('Successfully enrolled in course!');
        setShowPaymentModal(false);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed');
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
          <h1 className="text-3xl font-bold text-gray-900">Available Courses</h1>
          <p className="mt-2 text-sm text-gray-700">
            Enroll in a course to start learning
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courseList.map((course) => (
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
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Confirm Enrollment
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    You are about to enroll in <strong>{selectedCourse.title}</strong>
                  </p>
                  <p className="mt-2 text-lg font-medium text-gray-900">
                    Price: {selectedCourse.price_formatted}
                  </p>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={handlePayment}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm"
                >
                  Confirm & Pay
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 