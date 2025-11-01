export const UserRole = {
  SUPER_ADMIN: 'super_admin',
  HOSPITAL_ADMIN: 'hospital_admin',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  RECEPTIONIST: 'receptionist',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export interface User {
  _id: string;
  id?: string; // Alias for _id for compatibility
  name: string;
  email: string;
  role: UserRoleType;
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
