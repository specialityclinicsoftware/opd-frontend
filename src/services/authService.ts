import apiClient from './api';
import type {
  ApiResponse,
  LoginCredentials,
  LoginResponse,
  User,
  ChangePasswordRequest
} from '../types';

/**
 * Authentication Service
 * Handles login, logout, token refresh, and user authentication
 */
const authService = {
  /**
   * Login with email and password
   * Returns user data and JWT tokens
   */
  login: async (credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: async (refreshToken: string): Promise<ApiResponse<{
    accessToken: string;
  }>> => {
    const response = await apiClient.post('/api/auth/refresh-token', { refreshToken });
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  /**
   * Logout (invalidate tokens)
   */
  logout: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/api/auth/logout');
    return response.data;
  },

  /**
   * Change password for current user
   */
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/api/auth/change-password', data);
    return response.data;
  },
};

export default authService;
