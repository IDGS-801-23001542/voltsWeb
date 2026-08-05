import {
  Address,
  PersonName
} from './common.model';

export type CustomerStatusFilter =
  | 'all'
  | 'active'
  | 'inactive';

export interface PortalAccountRequest {
  createPortalAccount: boolean;
  autoGeneratePassword: boolean;
  temporaryPassword?: string | null;
}

export interface PortalAccountCredentials {
  created: boolean;
  email: string;
  temporaryPassword: string;
  mustChangePassword: boolean;
}

export interface EntityWithPortalAccount<T> {
  entity: T;
  portalAccount?: PortalAccountCredentials | null;
}

export interface Customer {
  id: string;
  name: PersonName;
  fullName: string;
  email: string;
  phone?: string | null;
  address?: Address | null;
  profileImageUrl?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface CustomerCreateRequest
  extends PortalAccountRequest {
  name: PersonName;
  email: string;
  phone?: string | null;
  address?: Address | null;
  profileImageUrl?: string | null;
}

export interface CustomerUpdateRequest {
  name: PersonName;
  email: string;
  phone?: string | null;
  address?: Address | null;
  profileImageUrl?: string | null;
  isActive: boolean;
}


