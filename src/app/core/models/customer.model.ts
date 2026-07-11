export type CustomerType =
  | 'Individual'
  | 'Institutional';

export type CustomerStatusFilter =
  | 'all'
  | 'active'
  | 'inactive';

export type CustomerTypeFilter =
  | 'all'
  | CustomerType;

export interface Customer {
  id: string;

  customerType: CustomerType;

  fullName: string;

  institutionName?: string | null;

  email: string;

  phone?: string | null;

  address?: string | null;

  isActive: boolean;

  isDeleted: boolean;

  createdAt: string;

  updatedAt?: string | null;

  createdBy?: string | null;

  updatedBy?: string | null;
}

export interface CustomerCreateRequest {
  customerType: CustomerType;

  fullName: string;

  institutionName?: string | null;

  email: string;

  phone?: string | null;

  address?: string | null;
}

export interface CustomerUpdateRequest
  extends CustomerCreateRequest {
  isActive: boolean;
}
