import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://opd-backend-xvid.onrender.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for JWT token and logging
apiClient.interceptors.request.use(
  config => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

    // Add JWT token to requests
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => {
    console.log(
      `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
      response.data
    );
    return response;
  },
  error => {
    console.error('❌ API Error:', error.response?.data || error.message);
    console.error('Error details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export default apiClient;
