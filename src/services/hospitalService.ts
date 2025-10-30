import apiClient from './api';
import type { User } from './userService';

export interface Hospital {
  _id: string;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  registrationNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHospitalInput {
  hospitalName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phoneNumber: string;
  email: string;
  registrationNumber: string;
}

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface ICreateHospital {
  hospital: CreateHospitalInput;
  admin: CreateAdminInput;
}

export interface UpdateHospitalInput {
  name?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  registrationNumber?: string;
}

const hospitalService = {
  // Get all hospitals (super admin only)
  getAllHospitals: async (): Promise<Hospital[]> => {
    const response = await apiClient.get(`/api/admin/hospitals`);
    return response.data;
  },

  // Get single hospital
  getHospital: async (hospitalId: string): Promise<Hospital> => {
    const response = await apiClient.get(`/api/hospitals/${hospitalId}`);
    return response.data;
  },

  // Create new hospital with admin (super admin only)
  createHospital: async (data: ICreateHospital): Promise<{ hospital: Hospital; admin: User }> => {
    const response = await apiClient.post(`/api/admin/hospitals`, data);
    return response.data;
  },

  // Update hospital
  updateHospital: async (hospitalId: string, data: UpdateHospitalInput): Promise<Hospital> => {
    const response = await apiClient.put(`/api/hospitals/${hospitalId}`, data);
    return response.data;
  },

  // Activate hospital
  activateHospital: async (hospitalId: string): Promise<Hospital> => {
    const response = await apiClient.post(`/api/hospitals/${hospitalId}/activate`, {});
    return response.data;
  },

  // Deactivate hospital
  deactivateHospital: async (hospitalId: string): Promise<Hospital> => {
    const response = await apiClient.post(`/api/hospitals/${hospitalId}/deactivate`, {});
    return response.data;
  },
};

export default hospitalService;
