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

export type WasteStatus =
  | 'Available'
  | 'PartiallyUsed'
  | 'Consumed'
  | 'Sold'
  | 'Recycled'
  | 'Reworked'
  | 'Discarded';

export type WasteAction =
  | 'Reuse'
  | 'Sell'
  | 'Recycle'
  | 'Repair'
  | 'Discard';

export interface Waste {
  id: string;
  productionOrderId?: string | null;
  productionFolio?: string | null;
  productId?: string | null;
  productName?: string | null;

  rawMaterialId: string;
  rawMaterialCode: string;
  rawMaterialName: string;

  unitOfMeasureId: string;
  unitCode: string;
  unitName: string;
  unitSymbol: string;
  unitAllowsDecimals: boolean;
  unitDecimalPlaces: number;

  quantityGenerated: number;
  availableQuantity: number;
  classification: WasteClassification;
  destination: WasteDestination;
  status: WasteStatus;
  estimatedCost: number;
  estimatedRecoveryValue: number;
  recoveredValue: number;
  reason: string;
  notes: string;
  wasteDate: string;
}

export interface WasteSummary {
  totalRecords: number;
  availableRecords: number;
  estimatedWasteCost: number;
  recoveredValue: number;
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
