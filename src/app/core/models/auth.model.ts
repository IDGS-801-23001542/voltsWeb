import type { Address } from './common.model';
import type { InstitutionType } from './institution.model';

export type UserRole = string;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterClientRequest {
  firstNames: string;
  paternalLastName: string;
  maternalLastName?: string | null;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string | null;
}


export interface RegisterInstitutionRequest {
  institutionName: string;
  institutionType: InstitutionType;
  firstNames: string;
  paternalLastName: string;
  maternalLastName?: string | null;
  email: string;
  phone?: string | null;
  position?: string | null;
  estimatedStudents?: number | null;
  address?: Address | null;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  fullName: string;
  firstNames: string;
  paternalLastName: string;
  maternalLastName?: string | null;
  email: string;
  roleName: UserRole;
  userType: string | number;
  profileId?: string | null;
  permissions: string[];
  mustChangePassword?: boolean;
  requiresTwoFactor?: boolean;
  requiresTwoFactorSetup?: boolean;
  twoFactorChallengeId?: string | null;
  twoFactorSecret?: string | null;
  twoFactorProvisioningUri?: string | null;
  recoveryCodes?: string[];
  twoFactorMethod?: 'Totp' | 'EmailOtp' | null;
  profileImageUrl?: string | null;
}

export interface TwoFactorVerifyRequest {
  challengeId: string;
  code: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
