import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Include credentials in requests
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid auth state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Success handler
export const handleApiSuccess = (message) => {
  toast.success(message);
};

// Error handler
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  const message = error.response?.data?.message || error.message || defaultMessage;
  toast.error(message);
  return Promise.reject(error);
};

// Auth API
export const auth = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  verify: () => api.get('/auth/verify'),
  check: () => api.get('/auth/check')
};

// Courses API
export const courses = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`)
};

// Enrollments API
export const enrollments = {
  create: (courseId) => api.post(`/enrollments/${courseId}`),
  getMyEnrollments: () => api.get('/enrollments/me'),
  updateProgress: (enrollmentId, progress) => 
    api.put(`/enrollments/${enrollmentId}/progress`, { progress })
};

// Payments API
export const payments = {
  create: (data) => api.post('/payments/collect', data),
  getHistory: () => api.get('/payments/history')
};

export default api; 