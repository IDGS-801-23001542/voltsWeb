export type ProductionStatus =
  | 'Created'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled';

export type WasteClassification =
  | 'Reusable'
  | 'Recyclable'
  | 'Sellable'
  | 'Rework'
  | 'FinalWaste';

export type WasteDestination =
  | 'Pending'
  | 'Reuse'
  | 'Sell'
  | 'Recycle'
  | 'Repair'
  | 'Discard';

export interface ProductionOrder {
  id: string;
  folio: string;

  productId: string;
  productName: string;

  recipeId: string;
  recipeCode: string;
  recipeVersion: number;

  quantityPlanned: number;
  quantityCompleted: number;
  quantityDefective: number;

  status: ProductionStatus;

  estimatedMaterialCost: number;
  actualMaterialCost: number;

  materials: ProductionMaterial[];

  notes: string;

  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;

  createdAt: string;
  updatedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;

  isDeleted: boolean;
}

export interface ProductionMaterial {
  rawMaterialId: string;
  rawMaterialCode: string;
  rawMaterialName: string;
  unit: string;

  quantityPerUnit: number;
  wastePercentage: number;

  requiredQuantity: number;
  issuedQuantity: number;

  unitCost: number;
  totalCost: number;
}

export interface ProductionCreateRequest {
  productId: string;
  quantity: number;
  notes: string;
}

export interface ProductionCompleteRequest {
  quantityCompleted: number;
  quantityDefective: number;
  notes: string;
  wastes: ProductionWasteRequest[];
}

export interface ProductionWasteRequest {
  rawMaterialId: string;
  quantity: number;
  classification: WasteClassification;
  destination: WasteDestination;
  estimatedRecoveryValue: number;
  notes: string;
}

export interface ProductionCancelRequest {
  reason: string;
}
