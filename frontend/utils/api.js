import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRedirecting = false;

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Clear token
      localStorage.removeItem('token');
      
      // Prevent multiple redirects
      if (!isRedirecting) {
        isRedirecting = true;
        
        // Only redirect if we're not already on an auth page
        const currentPath = window.location.pathname;
        if (!['/login', '/register'].includes(currentPath)) {
          window.location.href = '/login';
        }
        
        // Reset redirect flag after a delay
        setTimeout(() => {
          isRedirecting = false;
        }, 1000);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
};

// Courses API
export const courses = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
  getMyCourses: () => api.get('/courses/my-courses'),
};

// Progress API
export const progress = {
  getCourseProgress: (courseId) => 
    api.get(`/progress/course/${courseId}`),
  updateProgress: (courseId, data) => 
    api.post(`/progress/course/${courseId}`, data),
  getOverallProgress: () => 
    api.get('/progress/overall'),
  markLessonComplete: (courseId, lessonId) => 
    api.post(`/progress/course/${courseId}/lesson/${lessonId}/complete`),
  getLeaderboard: () => 
    api.get('/progress/leaderboard'),
};

// Enrollment API
export const enrollments = {
  getMyEnrollments: () => 
    api.get('/enrollments/me'),
  getEnrollmentStatus: (courseId) => 
    api.get(`/enrollments/status/${courseId}`),
  withdrawEnrollment: (courseId) => 
    api.delete(`/enrollments/${courseId}`),
  updateEnrollmentStatus: (courseId, status) => 
    api.put(`/enrollments/${courseId}/status`, { status }),
};

// Error handler utility
export const handleApiError = (error, customMessage = 'Something went wrong') => {
  const message = error.response?.data?.message || customMessage;
  toast.error(message);
  return Promise.reject(error);
};

// Success handler utility
export const handleApiSuccess = (message) => {
  toast.success(message);
};

export default api; 