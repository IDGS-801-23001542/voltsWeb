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
  status: ProductionStatus;
  quantityPlanned: number;
  quantityCompleted: number;
  quantityDefective: number;
  estimatedMaterialCost: number;
  actualMaterialCost: number;
  hasShortages: boolean;
  materials: ProductionMaterial[];
  notes: string;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
}

export interface ProductionMaterial {
  rawMaterialId: string;
  rawMaterialCode: string;
  rawMaterialName: string;

  unitOfMeasureId: string;
  unitCode: string;
  unitName: string;
  unitSymbol: string;
  unitAllowsDecimals: boolean;
  unitDecimalPlaces: number;

  quantityPerUnit: number;
  wastePercentage: number;
  requiredQuantity: number;
  issuedQuantity: number;
  availableStock: number;
  shortageQuantity: number;
  unitCost: number;
  totalCost: number;
}

export interface ProductionCreateRequest {
  productId: string;
  quantity: number;
  notes: string;
}

export interface ProductionCompleteWasteRequest {
  rawMaterialId: string;
  quantity: number;
  classification: WasteClassification;
  destination: WasteDestination;
  estimatedRecoveryValue: number;
  notes: string;
}

export interface ProductionCompleteRequest {
  quantityCompleted: number;
  quantityDefective: number;
  notes: string;
  wastes: ProductionCompleteWasteRequest[];
}

export interface ProductionCancelRequest {
  reason: string;
}
