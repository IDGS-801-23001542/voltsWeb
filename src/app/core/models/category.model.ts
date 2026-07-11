export interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CategoryCreateRequest {
  name: string;
  description: string;
}

export interface CategoryUpdateRequest
  extends CategoryCreateRequest {
  isActive: boolean;
}

export type CategoryStatusFilter =
  | 'all'
  | 'active'
  | 'inactive';
