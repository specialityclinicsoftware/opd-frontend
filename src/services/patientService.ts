import apiClient from './api';
import type { Patient, PatientFormData, ApiResponse } from '../types';

// Backend response format (actual)
interface BackendPatientListResponse {
  success: boolean;
  count?: number;
  patients?: Patient[];
  message?: string;
}

interface BackendPatientResponse {
  success: boolean;
  patient?: Patient;
  message?: string;
}

export const patientService = {
  // Register new patient
  register: async (patientData: PatientFormData): Promise<ApiResponse<Patient>> => {
    const response = await apiClient.post<ApiResponse<BackendPatientResponse>>('/api/patients/register', patientData);
    return {
      success: response.data.success,
      message: response.data.message || 'Patient registered successfully',
      data: response.data.data.patient!,
    };
  },

  // Get all patients
  getAll: async (): Promise<ApiResponse<Patient[]>> => {
    const response = await apiClient.get<ApiResponse<BackendPatientListResponse>>('/api/patients/');
    return {
      success: response.data.success,
      message: response.data.message || 'Patients fetched successfully',
      data: response.data.data.patients || [],
    };
  },

  // Search by phone number
  searchByPhone: async (phoneNumber: string): Promise<ApiResponse<Patient>> => {
    const response = await apiClient.get<ApiResponse<BackendPatientResponse>>(`/api/patients/search?phoneNumber=${phoneNumber}`);
    return {
      success: response.data.success,
      message: response.data.message || 'Patient found',
      data: response.data.data.patient!,
    };
  },

  // Search patients by name or phone
  search: async (query: string): Promise<ApiResponse<Patient[]>> => {
    const response = await apiClient.get<ApiResponse<BackendPatientListResponse>>(`/api/patients/search?q=${encodeURIComponent(query)}`);
    return {
      success: response.data.success,
      message: response.data.message || 'Search completed',
      data: response.data.data.patients || [],
    };
  },

  // Get patient by ID
  getById: async (id: string): Promise<ApiResponse<Patient>> => {
    const response = await apiClient.get<ApiResponse<BackendPatientResponse>>(`/api/patients/${id}`);
    return {
      success: response.data.success,
      message: response.data.message || 'Patient fetched successfully',
      data: response.data.data.patient!,
    };
  },

  // Update patient
  update: async (id: string, patientData: Partial<PatientFormData>): Promise<ApiResponse<Patient>> => {
    const response = await apiClient.put<ApiResponse<BackendPatientResponse>>(`/api/patients/${id}`, patientData);
    return {
      success: response.data.success,
      message: response.data.message || 'Patient updated successfully',
      data: response.data.data.patient!,
    };
  },

  // Delete patient
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<{ success: boolean; message?: string }>>(`/api/patients/${id}`);
    return {
      success: response.data.success,
      message: response.data.message || 'Patient deleted successfully',
      data: null,
    };
  },
};
