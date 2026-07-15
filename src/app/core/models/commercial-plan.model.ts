export type SupportLevel = 'Basic' | 'Standard' | 'Priority' | 'Premium';

export interface CommercialPlan {
  id: string;
  name: string;
  code: string;
  description: string;
  audience: string;
  warrantyMonths: number;
  supportLevel: SupportLevel;
  includesTraining: boolean;
  includesDocumentation: boolean;
  includesUpdates: boolean;
  displayOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CommercialPlanCreateRequest {
  name: string;
  code: string;
  description: string;
  audience: string;
  warrantyMonths: number;
  supportLevel: SupportLevel;
  includesTraining: boolean;
  includesDocumentation: boolean;
  includesUpdates: boolean;
  displayOrder: number;
}

export interface CommercialPlanUpdateRequest extends CommercialPlanCreateRequest {
  isActive: boolean;
}
