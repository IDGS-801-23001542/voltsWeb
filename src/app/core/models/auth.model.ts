export type UserRole = 'Admin' | 'Employee' | 'Client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterClientRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  fullName: string;
  email: string;
  roleName: UserRole;
}
