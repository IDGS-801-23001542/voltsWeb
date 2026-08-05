import {
  Address,
  PersonName
} from './common.model';

import {
  PortalAccountRequest
} from './customer.model';

export type InstitutionType =
  | 'Kindergarten'
  | 'ElementarySchool'
  | 'MiddleSchool'
  | 'HighSchool'
  | 'University'
  | 'TrainingCenter'
  | 'Association'
  | 'Foundation'
  | 'Government'
  | 'Company'
  | 'Other';

export type InstitutionStatusFilter =
  | 'all'
  | 'active'
  | 'inactive';

export type InstitutionTypeFilter =
  | 'all'
  | InstitutionType;

export interface InstitutionResponsible {
  name: PersonName;
  email: string;
  phone?: string | null;
  position?: string | null;
}

export interface Institution {
  id: string;
  name: string;
  institutionType: InstitutionType;
  responsible: InstitutionResponsible;
  address?: Address | null;
  estimatedStudents?: number | null;
  notes?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface InstitutionCreateRequest
  extends PortalAccountRequest {
  name: string;
  institutionType: InstitutionType;
  responsible: InstitutionResponsible;
  address?: Address | null;
  estimatedStudents?: number | null;
  notes?: string | null;
}

export interface InstitutionUpdateRequest {
  name: string;
  institutionType: InstitutionType;
  responsible: InstitutionResponsible;
  address?: Address | null;
  estimatedStudents?: number | null;
  notes?: string | null;
  isActive: boolean;
}

export const INSTITUTION_TYPE_OPTIONS: ReadonlyArray<{
  value: InstitutionType;
  label: string;
}> = [
  { value: 'Kindergarten', label: 'Guardería' },
  { value: 'ElementarySchool', label: 'Primaria' },
  { value: 'MiddleSchool', label: 'Secundaria' },
  { value: 'HighSchool', label: 'Preparatoria' },
  { value: 'University', label: 'Universidad' },
  { value: 'TrainingCenter', label: 'Centro de capacitación' },
  { value: 'Association', label: 'Asociación' },
  { value: 'Foundation', label: 'Fundación' },
  { value: 'Government', label: 'Gobierno' },
  { value: 'Company', label: 'Empresa' },
  { value: 'Other', label: 'Otro' }
];

export function institutionTypeLabel(
  type: InstitutionType
): string {
  return INSTITUTION_TYPE_OPTIONS.find(
    option => option.value === type
  )?.label ?? type;
}



