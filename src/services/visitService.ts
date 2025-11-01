import apiClient from './api';
import type { Visit, VisitFormData, ApiResponse, PopulatedVisit } from '../types';

// Backend response format (actual)
interface BackendVisitListResponse {
  success: boolean;
  count?: number;
  visits?: Visit[];
  data?: {
    count?: number;
    visits?: Visit[];
  };
  message?: string;
}

interface BackendVisitResponse {
  success: boolean;
  visit?: Visit;
  data?: {
    visit?: Visit;
  };
  message?: string;
}

export const visitService = {
  // Create new visit
  create: async (visitData: VisitFormData): Promise<ApiResponse<Visit>> => {
    const response = await apiClient.post<BackendVisitResponse>('/api/visits/', visitData);
    // Handle both response formats: { visit: ... } and { data: { visit: ... } }
    const visit = response.data.data?.visit || response.data.visit;
    return {
      success: response.data.success,
      message: response.data.message || 'Visit created successfully',
      data: visit!,
    };
  },

  // Get all visits for a patient
  getByPatient: async (patientId: string): Promise<ApiResponse<Visit[]>> => {
    const response = await apiClient.get<BackendVisitListResponse>(
      `/api/visits/patient/${patientId}`
    );
    return {
      success: response.data.success,
      message: response.data.message || 'Visits fetched successfully',
      data: response.data.visits || [],
    };
  },

  // Get latest visit for a patient
  getLatest: async (patientId: string): Promise<ApiResponse<Visit>> => {
    const response = await apiClient.get<BackendVisitResponse>(
      `/api/visits/patient/${patientId}/latest`
    );
    // Handle both response formats: { visit: ... } and { data: { visit: ... } }
    const visit = response.data.data?.visit || response.data.visit;
    return {
      success: response.data.success,
      message: response.data.message || 'Latest visit fetched successfully',
      data: visit!,
    };
  },

  // Get complete patient history
  getHistory: async (patientId: string): Promise<ApiResponse<Visit[]>> => {
    const response = await apiClient.get<BackendVisitListResponse>(
      `/api/visits/patient/${patientId}/history`
    );
    return {
      success: response.data.success,
      message: response.data.message || 'History fetched successfully',
      data: response.data.visits || [],
    };
  },

  // Get specific visit
  getById: async (id: string): Promise<ApiResponse<Visit>> => {
    const response = await apiClient.get<BackendVisitResponse>(`/api/visits/${id}`);
    // Handle both response formats: { visit: ... } and { data: { visit: ... } }
    const visit = response.data.data?.visit || response.data.visit;
    return {
      success: response.data.success,
      message: response.data.message || 'Visit fetched successfully',
      data: visit!,
    };
  },

  // Update visit
  update: async (id: string, visitData: Partial<VisitFormData>): Promise<ApiResponse<Visit>> => {
    const response = await apiClient.put<BackendVisitResponse>(`/api/visits/${id}`, visitData);
    // Handle both response formats: { visit: ... } and { data: { visit: ... } }
    const visit = response.data.data?.visit || response.data.visit;
    return {
      success: response.data.success,
      message: response.data.message || 'Visit updated successfully',
      data: visit!,
    };
  },

  // Delete visit
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<{ success: boolean; message?: string }>(
      `/api/visits/${id}`
    );
    return {
      success: response.data.success,
      message: response.data.message || 'Visit deleted successfully',
      data: null,
    };
  },

  // Get pending visits (awaiting doctor review)
  getPendingVisits: async (hospitalId: string): Promise<ApiResponse<Visit[]>> => {
    const response = await apiClient.get(
      `/api/hospitals/${hospitalId}/visits/workflow?status=ready-for-doctor`
    );
    // The workflow endpoint returns data directly as an array
    return {
      success: response.data.success,
      message: response.data.message || 'Pending visits fetched successfully',
      data: response.data.data || [],
    };
  },

  // Workflow API: Submit pre-consultation data
  submitPreConsultation: async (
    visitId: string,
    preConsultationData: Partial<VisitFormData>
  ): Promise<ApiResponse<Visit>> => {
    const response = await apiClient.post<BackendVisitResponse>(
      `/api/visits/workflow/${visitId}/pre-consultation`,
      preConsultationData
    );
    // Handle both response formats: { visit: ... } and { data: { visit: ... } }
    const visit = response.data.data?.visit || response.data.visit;
    return {
      success: response.data.success,
      message: response.data.message || 'Pre-consultation data saved successfully',
      data: visit!,
    };
  },

  // Workflow API: Submit consultation (diagnosis) data
  submitConsultation: async (
    visitId: string,
    consultationData: Partial<VisitFormData>
  ): Promise<ApiResponse<Visit>> => {
    const response = await apiClient.post<BackendVisitResponse>(
      `/api/visits/workflow/${visitId}/consultation`,
      consultationData
    );
    // Handle both response formats: { visit: ... } and { data: { visit: ... } }
    const visit = response.data.data?.visit || response.data.visit;
    return {
      success: response.data.success,
      message: response.data.message || 'Consultation completed successfully',
      data: visit!,
    };
  },

  // Get recent visits (last 10) for a hospital
  getRecentVisits: async (hospitalId: string): Promise<ApiResponse<PopulatedVisit[]>> => {
    const response = await apiClient.get<{
      success: boolean;
      message?: string;
      data: PopulatedVisit[];
    }>(`/api/hospitals/${hospitalId}/visits/workflow/recent`);
    // The API returns { success, message, data: [...] } where data is the array directly
    return {
      success: response.data.success,
      message: response.data.message || 'Recent visits fetched successfully',
      data: response.data.data,
    };
  },
};
