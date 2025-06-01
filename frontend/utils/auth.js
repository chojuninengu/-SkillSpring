import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const signIn = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Login failed');
    }

    const { token, user } = response.data.data;

    // Store the token and user data
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    // Set default auth header for future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    return { token, user };
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const signOut = () => {
  // Clear auth data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Remove auth header
  delete axios.defaults.headers.common['Authorization'];
  
  // Force reload to clear any cached state
  window.location.href = '/login';
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const isAuthenticated = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;

    // Verify token with backend
    const response = await axios.get(`${API_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.success;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

// Add axios interceptors for handling auth errors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear invalid auth state
      signOut();
    }
    return Promise.reject(error);
  }
);

// Add request interceptor to always include token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
); 