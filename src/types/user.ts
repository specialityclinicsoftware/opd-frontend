export type UserRole = 'super_admin' | 'hospital_admin' | 'doctor' | 'nurse' | 'receptionist';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  hospitalId: string;
  specialization?: string;
  licenseNumber?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
