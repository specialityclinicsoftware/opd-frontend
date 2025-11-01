export interface Vitals {
  pulseRate?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  spO2?: number;
  temperature?: number;
}

export interface GeneralExamination {
  pallor?: boolean;
  icterus?: boolean;
  clubbing?: boolean;
  cyanosis?: boolean;
  lymphadenopathy?: boolean;
}

export interface SystemicExamination {
  cvs?: string; // Cardiovascular
  rs?: string;  // Respiratory
  pa?: string;  // Per Abdomen
  cns?: string; // Central Nervous System
}

export interface BloodInvestigation {
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  testDate: Date;
}

// Two-Stage Sequential Flow Statuses
export type VisitStatus =
  | 'draft'            // Draft visit being created
  | 'pending'          // Initial visit created, awaiting nurse
  | 'with-nurse'       // Nurse is working on pre-consultation
  | 'pre_consultation_complete' // Pre-consultation complete
  | 'ready-for-doctor' // Nurse completed, awaiting doctor
  | 'with-doctor'      // Doctor is working on consultation
  | 'completed'        // Doctor finalized the visit
  | 'cancelled';       // Visit was cancelled

export interface VisitAudit {
  enteredBy: {
    nurseId?: string;
    nurseName?: string;
    doctorId?: string;
    doctorName?: string;
  };
  timestamps: {
    nurseCompletedAt?: Date;
    doctorCompletedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  };
  isNurseAssistedVisit: boolean;
}

export interface Visit {
  _id: string;
  patientId: string;
  hospitalId: string;
  visitDate: Date;
  status: VisitStatus;

  // Staff references
  nurseId?: string;
  doctorId?: string;

  // Stage 1: Nurse Pre-Consultation Data
  vitals?: Vitals;
  chiefComplaints?: string;
  pastHistory?: string;
  familyHistory?: string;
  maritalHistory?: string;
  generalExamination?: GeneralExamination;
  bloodInvestigations?: BloodInvestigation[];

  // Stage 2: Doctor Consultation Data
  systemicExamination?: SystemicExamination;
  diagnosis?: string;
  treatment?: string;
  investigation?: string;
  advice?: string;
  reviewDate?: Date;

  // Timestamps
  preConsultationCompletedAt?: Date;
  consultationCompletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  // Legacy field for backward compatibility
  consultingDoctor?: string;
  audit?: VisitAudit;
}

export interface VisitFormData {
  patientId: string;
  visitDate: Date;
  consultingDoctor: string;
  vitals?: Vitals;
  chiefComplaints?: string;
  pastHistory?: string;
  familyHistory?: string;
  maritalHistory?: string;
  generalExamination?: GeneralExamination;
  systemicExamination?: SystemicExamination;
  diagnosis?: string;
  treatment?: string;
  investigation?: string;
  advice?: string;
  reviewDate?: Date;
  bloodInvestigations?: BloodInvestigation[];
  status?: VisitStatus;
  audit?: VisitAudit;
}

// Two-Stage Workflow: Nurse Pre-Consultation Data
export interface PreConsultationData {
  vitals?: Vitals;
  chiefComplaints?: string;
  pastHistory?: string;
  familyHistory?: string;
  maritalHistory?: string;
  generalExamination?: GeneralExamination;
  bloodInvestigations?: BloodInvestigation[];
}

// Two-Stage Workflow: Doctor Consultation Data
export interface ConsultationData {
  systemicExamination?: SystemicExamination;
  diagnosis?: string;
  treatment?: string;
  investigation?: string;
  advice?: string;
  reviewDate?: Date;
}

// Queue Item interfaces for Nurse and Doctor views
export interface NurseQueueItem {
  _id: string;
  patientId: {
    _id: string;
    name: string;
    phoneNumber: string;
    age: number;
    gender: string;
  };
  visitDate: Date;
  status: VisitStatus;
  createdAt: Date;
}

export interface DoctorQueueItem {
  _id: string;
  patientId: {
    _id: string;
    name: string;
    phoneNumber: string;
    age: number;
    gender: string;
  };
  nurseId?: {
    _id: string;
    name: string;
  };
  visitDate: Date;
  status: VisitStatus;
  vitals?: Vitals;
  chiefComplaints?: string;
  preConsultationCompletedAt?: Date;
  createdAt: Date;
}

// Populated Visit type for when patientId is populated
export interface PopulatedVisit extends Omit<Visit, 'patientId'> {
  patientId: {
    _id: string;
    name: string;
    phoneNumber: string;
    age?: number;
    gender?: string;
  } | string;
}
