import apiClient from './api';
import type { Visit, VisitFormData, ApiResponse } from '../types';

// Backend response format (actual)
interface BackendVisitListResponse {
  success: boolean;
  count?: number;
  visits?: Visit[];
  message?: string;
}

interface BackendVisitResponse {
  success: boolean;
  visit?: Visit;
  message?: string;
}

export const visitService = {
  // Create new visit
  create: async (visitData: VisitFormData): Promise<ApiResponse<Visit>> => {
    const response = await apiClient.post<BackendVisitResponse>('/api/visits/', visitData);
    return {
      success: response.data.success,
      message: response.data.message || 'Visit created successfully',
      data: response.data.visit!,
    };
  },

  // Get all visits for a patient
  getByPatient: async (patientId: string): Promise<ApiResponse<Visit[]>> => {
    const response = await apiClient.get<BackendVisitListResponse>(`/api/visits/patient/${patientId}`);
    return {
      success: response.data.success,
      message: response.data.message || 'Visits fetched successfully',
      data: response.data.visits || [],
    };
  },

  // Get latest visit for a patient
  getLatest: async (patientId: string): Promise<ApiResponse<Visit>> => {
    const response = await apiClient.get<BackendVisitResponse>(`/api/visits/patient/${patientId}/latest`);
    return {
      success: response.data.success,
      message: response.data.message || 'Latest visit fetched successfully',
      data: response.data.visit!,
    };
  },

  // Get complete patient history
  getHistory: async (patientId: string): Promise<ApiResponse<Visit[]>> => {
    const response = await apiClient.get<BackendVisitListResponse>(`/api/visits/patient/${patientId}/history`);
    return {
      success: response.data.success,
      message: response.data.message || 'History fetched successfully',
      data: response.data.visits || [],
    };
  },

  // Get specific visit
  getById: async (id: string): Promise<ApiResponse<Visit>> => {
    const response = await apiClient.get<BackendVisitResponse>(`/api/visits/${id}`);
    return {
      success: response.data.success,
      message: response.data.message || 'Visit fetched successfully',
      data: response.data.visit!,
    };
  },

  // Update visit
  update: async (id: string, visitData: Partial<VisitFormData>): Promise<ApiResponse<Visit>> => {
    const response = await apiClient.put<BackendVisitResponse>(`/api/visits/${id}`, visitData);
    return {
      success: response.data.success,
      message: response.data.message || 'Visit updated successfully',
      data: response.data.visit!,
    };
  },

  // Delete visit
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<{ success: boolean; message?: string }>(`/api/visits/${id}`);
    return {
      success: response.data.success,
      message: response.data.message || 'Visit deleted successfully',
      data: null,
    };
  },

  // Get pending visits (awaiting doctor review)
  getPendingVisits: async (): Promise<ApiResponse<Visit[]>> => {
    const response = await apiClient.get<BackendVisitListResponse>('/api/visits/pending');
    return {
      success: response.data.success,
      message: response.data.message || 'Pending visits fetched successfully',
      data: response.data.visits || [],
    };
  },
};
