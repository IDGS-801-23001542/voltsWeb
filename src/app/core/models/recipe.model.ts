export interface Recipe {
  id: string;
  code: string;

  productId: string;
  productName: string;

  version: number;
  notes: string;

  estimatedUnitCost: number;

  details: RecipeDetail[];

  isActive: boolean;
  isDeleted: boolean;

  createdAt: string;
  updatedAt?: string | null;
}

export interface RecipeDetail {
  rawMaterialId: string;
  rawMaterialCode: string;
  rawMaterialName: string;
  unit: string;

  quantityRequired: number;
  wastePercentage: number;
  acceptsRecoveredWaste: boolean;

  estimatedUnitCost: number;
  estimatedSubtotal: number;
}

export interface RecipeRequest {
  productId: string;
  version: number;
  notes: string;
  isActive: boolean;
  details: RecipeDetailRequest[];
}

export interface RecipeDetailRequest {
  rawMaterialId: string;
  quantityRequired: number;
  wastePercentage: number;
  acceptsRecoveredWaste: boolean;
}
