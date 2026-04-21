import axios from 'axios';

/**
 * Axios instance with base configuration
 * Includes automatic token attachment and error handling
 */
const isProduction = import.meta.env.PROD;

const axiosInstance = axios.create({
  // HARDCODE the Railway link for production to bypass Vercel variable issues
  baseURL: isProduction 
    ? 'https://echo-ai-production-df05.up.railway.app/api' 
    : 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, 
});
/**
 * Request interceptor
 * Attaches JWT token to all requests if available
 */
axiosInstance.interceptors.request.use(
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

/**
 * Response interceptor
 * Handles common error cases like token expiration
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login/register page
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
