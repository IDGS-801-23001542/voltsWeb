
export type DocumentationType =
  | 'Manual'
  | 'QuickGuide'
  | 'Firmware'
  | 'Video'
  | 'AndroidApp'
  | 'EducationalResource'
  | 'Warranty'
  | 'Other';

export type DocumentationTypeFilter =
  | 'all'
  | DocumentationType;

export type DocumentationVisibilityFilter =
  | 'all'
  | 'public'
  | 'private';

export type DocumentationStatusFilter =
  | 'all'
  | 'active'
  | 'inactive';

export interface Documentation {
  id: string;

  title: string;
  documentType: DocumentationType;
  description: string;

  fileUrl: string;
  version: string;
  productIds: string[];

  isPublic: boolean;
  isActive: boolean;

  createdAt: string;
  updatedAt?: string | null;

  createdBy?: string | null;
  updatedBy?: string | null;

  isDeleted: boolean;
}

export interface DocumentationCreateRequest {
  title: string;
  documentType: DocumentationType;
  description: string;
  fileUrl: string;
  version: string;
  productIds: string[];
  isPublic: boolean;
}

export interface DocumentationUpdateRequest
  extends DocumentationCreateRequest {
  isActive: boolean;
}
