export type RawMaterialCategory =
  | 'Cardboard'
  | 'Electronics'
  | 'Mechanical'
  | 'Textiles'
  | 'Adhesives'
  | 'Consumables'
  | 'Soldering'
  | 'Packaging'
  | 'Other';

export type StockMovementType =
  | 'Entry'
  | 'Exit'
  | 'Adjustment';

export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  description: string;
  category: RawMaterialCategory;
  unit: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  averageCost: number;
  lastPurchaseCost: number;
  isRecycled: boolean;
  isReusable: boolean;
  requiresPurchase: boolean;
  storageLocation: string;
  preferredSupplierId?: string | null;
  preferredSupplierName?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface RawMaterialRequest {
  code: string;
  name: string;
  description: string;
  category: RawMaterialCategory;
  unit: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  averageCost: number;
  lastPurchaseCost: number;
  isRecycled: boolean;
  isReusable: boolean;
  requiresPurchase: boolean;
  storageLocation: string;
  preferredSupplierId?: string | null;
  preferredSupplierName?: string | null;
}

export interface RawMaterialUpdateRequest
  extends RawMaterialRequest {
  isActive: boolean;
}

export interface RawMaterialSummary {
  totalMaterials: number;
  activeMaterials: number;
  lowStockMaterials: number;
  outOfStockMaterials: number;
  recycledMaterials: number;
  reusableMaterials: number;
  totalInventoryValue: number;
}

export interface RawMaterialStockAdjustment {
  movementType: StockMovementType;
  quantity: number;
  reason: string;
  unitCost?: number | null;
  referenceType: string;
  referenceId?: string | null;
}

export interface RawMaterialMovement {
  id: string;
  rawMaterialId: string;
  rawMaterialCode: string;
  rawMaterialName: string;
  movementType: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  unit: string;
  reason: string;
  referenceType: string;
  referenceId?: string | null;
  unitCost: number;
  totalCost: number;
  movementDate: string;
}
