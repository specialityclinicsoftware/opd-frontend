export interface Patient {
  _id: string;
  name: string;
  phoneNumber: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  registrationDate: Date;
}

export interface PatientFormData {
  name: string;
  phoneNumber: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
}
