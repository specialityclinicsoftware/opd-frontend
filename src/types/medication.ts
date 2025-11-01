export interface MedicationTiming {
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
}

export interface MedicationMeal {
  beforeMeal: boolean;
  afterMeal: boolean;
}

export interface Medication {
  medicineName: string;
  dosage: string;
  days: number;
  timing: MedicationTiming;
  meal: MedicationMeal;
}

export interface MedicationHistory {
  _id?: string;
  hospitalId: string;
  patientId: string;
  visitId: string;
  prescribedDate: Date;
  doctorId: string;
  consultingDoctor: string;
  diagnosis?: string;
  medications: Medication[];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PrescriptionFormData {
  hospitalId: string;
  patientId: string;
  visitId: string;
  prescribedDate: Date;
  doctorId: string;
  consultingDoctor: string;
  diagnosis?: string;
  medications: Medication[];
  notes?: string;
}
