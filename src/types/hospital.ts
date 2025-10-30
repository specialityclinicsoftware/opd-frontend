export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise';

export interface Hospital {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactNumber: string;
  email: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStartDate: Date;
  subscriptionEndDate: Date;
  settings: HospitalSettings;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HospitalSettings {
  timezone: string;
  currency: string;
  dateFormat: string;
  allowNurseEdit: boolean;
  requireDoctorApproval: boolean;
  enableSMS: boolean;
  enableEmail: boolean;
}

export interface HospitalFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactNumber: string;
  email: string;
  subscriptionPlan: SubscriptionPlan;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}
