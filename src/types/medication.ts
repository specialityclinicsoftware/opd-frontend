export interface Medication {
  medicineName: string;
  dosage: string;       // e.g., "500mg"
  frequency: string;    // e.g., "TDS" (3x), "BD" (2x)
  duration: string;     // e.g., "7 days"
  route: string;        // Oral/IV/Topical
  instructions?: string;
  timing?: string;
  // New timing structure for ERP-style prescription
  morning?: boolean;
  afternoon?: boolean;
  evening?: boolean;
  dinner?: boolean;
  beforeMeal?: boolean;
  afterMeal?: boolean;
}

export interface MedicationHistory {
  _id: string;
  patientId: string;
  visitId: string;
  prescribedDate: Date;
  consultingDoctor: string;
  diagnosis?: string;
  medications: Medication[];
  notes?: string;
}

export interface MedicationFormData {
  patientId: string;
  visitId: string;
  prescribedDate: Date;
  consultingDoctor: string;
  diagnosis?: string;
  medications: Medication[];
  notes?: string;
}
