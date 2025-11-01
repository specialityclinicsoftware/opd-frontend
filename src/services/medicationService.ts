import apiClient from './api';
import type { MedicationHistory, PrescriptionFormData, ApiResponse } from '../types';

// Backend response format (actual)
interface BackendMedicationListResponse {
  success: boolean;
  data: { count?: number; medications?: MedicationHistory[] };
  message?: string;
}

interface BackendMedicationResponse {
  success: boolean;
  data: { medicationHistory: MedicationHistory; deductedItems?: number };
  message: string;
}

export const medicationService = {
  // Add prescription
  create: async (medicationData: PrescriptionFormData): Promise<ApiResponse<MedicationHistory>> => {
    const response = await apiClient.post<BackendMedicationResponse>(
      '/api/medications',
      medicationData
    );
    return {
      success: response.data.success,
      message: response.data.message || 'Prescription created successfully',
      data: response.data.data.medicationHistory,
    };
  },

  // Get all prescriptions for a patient
  getByPatient: async (patientId: string): Promise<ApiResponse<MedicationHistory[]>> => {
    const response = await apiClient.get<BackendMedicationListResponse>(
      `/api/medications/patient/${patientId}`
    );
    return {
      success: response.data.success,
      message: response.data.message || 'Prescriptions fetched successfully',
      data: response.data.data.medications || [],
    };
  },

  // Get recent prescriptions (default 5)
  getRecent: async (
    patientId: string,
    limit: number = 5
  ): Promise<ApiResponse<MedicationHistory[]>> => {
    const response = await apiClient.get<BackendMedicationListResponse>(
      `/api/medications/patient/${patientId}/recent?limit=${limit}`
    );
    return {
      success: response.data.success,
      message: response.data.message || 'Recent prescriptions fetched successfully',
      data: response.data.data.medications || [],
    };
  },

  // Get medications for specific visit
  getByVisit: async (visitId: string): Promise<ApiResponse<MedicationHistory>> => {
    const response = await apiClient.get<BackendMedicationResponse>(
      `/api/medications/visit/${visitId}`
    );
    return {
      success: response.data.success,
      message: response.data.message || 'Medication fetched successfully',
      data: response.data.data.medicationHistory,
    };
  },

  // Get medication record
  getById: async (id: string): Promise<ApiResponse<MedicationHistory>> => {
    const response = await apiClient.get<BackendMedicationResponse>(`/api/medications/${id}`);
    return {
      success: response.data.success,
      message: response.data.message || 'Medication fetched successfully',
      data: response.data.data.medicationHistory,
    };
  },

  // Update prescription
  update: async (
    id: string,
    medicationData: Partial<PrescriptionFormData>
  ): Promise<ApiResponse<MedicationHistory>> => {
    const response = await apiClient.put<BackendMedicationResponse>(
      `/api/medications/${id}`,
      medicationData
    );
    return {
      success: response.data.success,
      message: response.data.message || 'Prescription updated successfully',
      data: response.data.data.medicationHistory,
    };
  },

  // Delete prescription
  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<{ success: boolean; message?: string }>(
      `/api/medications/${id}`
    );
    return {
      success: response.data.success,
      message: response.data.message || 'Prescription deleted successfully',
      data: null,
    };
  },

  // Create prescription with billing (deducts from inventory)
  createWithBilling: async (
    medicationData: PrescriptionFormData
  ): Promise<ApiResponse<MedicationHistory>> => {
    const response = await apiClient.post<BackendMedicationResponse>(
      '/api/medications/billing',
      medicationData
    );
    return {
      success: response.data.success,
      message: response.data.message || 'Prescription saved and billed successfully',
      data: response.data.data.medicationHistory,
    };
  },
};
