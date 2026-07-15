export type UserRole =
  | 'Admin'
  | 'Employee'
  | 'Client'
  | 'Institution';

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
}
