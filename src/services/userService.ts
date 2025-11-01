import apiClient from './api';

export type UserRole = 'super_admin' | 'hospital_admin' | 'doctor' | 'nurse' | 'receptionist';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  hospitalId?: string;
  phoneNumber?: string;
  specialization?: string;
  licenseNumber?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phoneNumber?: string;
  specialization?: string;
  licenseNumber?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phoneNumber?: string;
  specialization?: string;
  licenseNumber?: string;
  role?: UserRole;
}

const userService = {
  // Get all users for a hospital
  getHospitalUsers: async (hospitalId: string): Promise<User[]> => {
    const response = await apiClient.get(`/api/hospitals/${hospitalId}/users`);
    return response.data.data;
  },

  // Get doctors for a hospital
  getHospitalDoctors: async (hospitalId: string): Promise<User[]> => {
    const response = await apiClient.get(`/api/hospitals/${hospitalId}/doctors`);
    return response.data.data;
  },

  // Get nurses for a hospital
  getHospitalNurses: async (hospitalId: string): Promise<User[]> => {
    const response = await apiClient.get(`/api/hospitals/${hospitalId}/nurses`);
    return response.data.data;
  },

  // Get single user
  getUser: async (userId: string): Promise<User> => {
    const response = await apiClient.get(`/api/users/${userId}`);
    return response.data.data;
  },

  // Create new user
  createUser: async (hospitalId: string, data: CreateUserInput): Promise<User> => {
    const response = await apiClient.post(`/api/hospitals/${hospitalId}/users`, data);
    return response.data.data;
  },

  // Update user
  updateUser: async (userId: string, data: UpdateUserInput): Promise<User> => {
    const response = await apiClient.put(`/api/users/${userId}`, data);
    return response.data.data;
  },

  // Activate user
  activateUser: async (userId: string): Promise<User> => {
    const response = await apiClient.post(`/api/users/${userId}/activate`, {});
    return response.data.data;
  },

  // Deactivate user
  deactivateUser: async (userId: string): Promise<User> => {
    const response = await apiClient.post(`/api/users/${userId}/deactivate`, {});
    return response.data.data;
  },

  // Delete user (soft delete)
  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/api/users/${userId}`);
  },
};

export default userService;
