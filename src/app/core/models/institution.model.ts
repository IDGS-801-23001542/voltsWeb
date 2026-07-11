export type InstitutionType =
  | 'Escuela'
  | 'Preparatoria'
  | 'Universidad'
  | 'Guardería'
  | 'Centro educativo'
  | 'Asociación'
  | 'Fundación'
  | 'Otro';

export type InstitutionStatusFilter =
  | 'all'
  | 'active'
  | 'inactive';

export type InstitutionTypeFilter =
  | 'all'
  | InstitutionType;

export interface Institution {
  id: string;

  name: string;

  contactName: string;

  email: string;

  phone?: string | null;

  address?: string | null;

  institutionType: InstitutionType;

  isActive: boolean;

  isDeleted: boolean;

  createdAt: string;

  updatedAt?: string | null;

  createdBy?: string | null;

  updatedBy?: string | null;
}

export interface InstitutionCreateRequest {
  name: string;

  contactName: string;

  email: string;

  phone?: string | null;

  address?: string | null;

  institutionType: InstitutionType;
}

export interface InstitutionUpdateRequest
  extends InstitutionCreateRequest {
  isActive: boolean;
}
