import apiClient from './api';
import type {
  ApiResponse,
  Visit,
  NurseQueueItem,
  DoctorQueueItem,
  PreConsultationData,
  ConsultationData
} from '../types';

/**
 * Visit Workflow Service - Two-Stage Sequential Flow
 * Handles nurse pre-consultation and doctor consultation workflows
 */
const visitWorkflowService = {
  // ========================================
  // NURSE WORKFLOWS
  // ========================================

  /**
   * Get the nurse queue (pending visits waiting for pre-consultation)
   * Status: 'pending' or 'with-nurse'
   */
  getNurseQueue: async (): Promise<ApiResponse<NurseQueueItem[]>> => {
    const response = await apiClient.get('/api/visits/workflow/nurse/queue');
    return response.data;
  },

  /**
   * Start pre-consultation (Nurse picks up a pending visit)
   * Changes status from 'pending' to 'with-nurse'
   */
  startPreConsultation: async (visitId: string): Promise<ApiResponse<Visit>> => {
    const response = await apiClient.post(`/api/visits/workflow/nurse/${visitId}/start`);
    return response.data;
  },

  /**
   * Update pre-consultation data (Nurse fills in vitals, complaints, history)
   * Status remains 'with-nurse'
   */
  updatePreConsultation: async (
    visitId: string,
    data: PreConsultationData
  ): Promise<ApiResponse<Visit>> => {
    const response = await apiClient.put(`/api/visits/workflow/nurse/${visitId}/update`, data);
    return response.data;
  },

  /**
   * Complete pre-consultation (Nurse finishes and sends to doctor)
   * Changes status from 'with-nurse' to 'ready-for-doctor'
   */
  completePreConsultation: async (visitId: string): Promise<ApiResponse<Visit>> => {
    const response = await apiClient.post(`/api/visits/workflow/nurse/${visitId}/complete`);
    return response.data;
  },

  // ========================================
  // DOCTOR WORKFLOWS
  // ========================================

  /**
   * Get the doctor queue (visits ready for consultation)
   * Status: 'ready-for-doctor' or 'with-doctor'
   */
  getDoctorQueue: async (): Promise<ApiResponse<DoctorQueueItem[]>> => {
    const response = await apiClient.get('/api/visits/workflow/doctor/queue');
    return response.data;
  },

  /**
   * Start consultation (Doctor picks up a ready visit)
   * Changes status from 'ready-for-doctor' to 'with-doctor'
   */
  startConsultation: async (visitId: string): Promise<ApiResponse<Visit>> => {
    const response = await apiClient.post(`/api/visits/workflow/doctor/${visitId}/start`);
    return response.data;
  },

  /**
   * Update consultation data (Doctor adds examination, diagnosis, treatment)
   * Status remains 'with-doctor'
   */
  updateConsultation: async (
    visitId: string,
    data: ConsultationData
  ): Promise<ApiResponse<Visit>> => {
    const response = await apiClient.put(`/api/visits/workflow/doctor/${visitId}/update`, data);
    return response.data;
  },

  /**
   * Finalize visit (Doctor completes the consultation)
   * Changes status from 'with-doctor' to 'completed'
   */
  finalizeVisit: async (visitId: string): Promise<ApiResponse<Visit>> => {
    const response = await apiClient.post(`/api/visits/workflow/doctor/${visitId}/finalize`);
    return response.data;
  },

  // ========================================
  // COMMON OPERATIONS
  // ========================================

  /**
   * Get a single visit by ID (with all details)
   */
  getVisitById: async (visitId: string): Promise<ApiResponse<Visit>> => {
    const response = await apiClient.get(`/api/visits/workflow/${visitId}`);
    return response.data;
  },

  /**
   * Cancel a visit (before it's completed)
   * Changes status to 'cancelled'
   */
  cancelVisit: async (
    visitId: string,
    reason: string
  ): Promise<ApiResponse<Visit>> => {
    const response = await apiClient.post(`/api/visits/workflow/${visitId}/cancel`, { reason });
    return response.data;
  },

  /**
   * Get all visits for a patient
   */
  getPatientVisits: async (patientId: string): Promise<ApiResponse<Visit[]>> => {
    const response = await apiClient.get(`/api/visits/workflow/patient/${patientId}`);
    return response.data;
  },

  /**
   * Get all visits for the hospital (with optional filters)
   */
  getHospitalVisits: async (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    nurseId?: string;
    doctorId?: string;
  }): Promise<ApiResponse<Visit[]>> => {
    const response = await apiClient.get('/api/visits/workflow/hospital', { params });
    return response.data;
  },

  /**
   * Create a new visit (receptionist creates initial visit)
   * Initial status: 'pending'
   */
  createVisit: async (data: {
    patientId: string;
    visitDate: Date;
  }): Promise<ApiResponse<Visit>> => {
    const response = await apiClient.post('/api/visits/workflow', data);
    return response.data;
  },
};

export default visitWorkflowService;
