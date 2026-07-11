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

export type WasteAction =
  | 'Reuse'
  | 'Sell'
  | 'Recycle'
  | 'Repair'
  | 'Discard';

export type WasteStatus =
  | 'Available'
  | 'PartiallyUsed'
  | 'Consumed'
  | 'Sold'
  | 'Recycled'
  | 'Reworked'
  | 'Discarded';

export interface Waste {
  id: string;

  rawMaterialId: string;
  rawMaterialCode: string;
  rawMaterialName: string;
  unit: string;

  productionOrderId?: string | null;
  productionFolio?: string | null;

  quantityGenerated: number;
  availableQuantity: number;

  classification: WasteClassification;
  destination: WasteDestination;
  status: WasteStatus;

  unitCost: number;
  estimatedCost: number;
  estimatedRecoveryValue: number;
  recoveredValue: number;

  reason: string;
  notes: string;

  wasteDate: string;

  createdAt: string;
  updatedAt?: string | null;
  isDeleted: boolean;
}

export interface WasteSummary {
  totalRecords: number;
  availableRecords: number;
  estimatedWasteCost: number;
  estimatedRecoveryValue: number;
  recoveredValue: number;
  reusableQuantity: number;
  sellableQuantity: number;
}

export interface WasteCreateRequest {
  rawMaterialId: string;
  quantity: number;
  classification: WasteClassification;
  destination: WasteDestination;
  reason: string;
  notes: string;
  estimatedRecoveryValue: number;
}

export interface WasteDispositionRequest {
  quantity: number;
  action: WasteAction;
  recoveredValue: number;
  notes: string;
}
