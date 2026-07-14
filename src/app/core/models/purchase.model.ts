export interface Purchase {
  id: string;
  folio: string;
  invoiceNumber?: string | null;

  supplierId: string;
  supplierCode: string;
  supplierName: string;

  purchaseDate: string;

  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;

  status: 'Completed';
  notes: string;

  details: PurchaseDetail[];

  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PurchaseDetail {
  rawMaterialId: string;
  rawMaterialCode: string;
  rawMaterialName: string;

  unitOfMeasureId: string;
  unitCode: string;
  unitName: string;
  unitSymbol: string;
  unitAllowsDecimals: boolean;
  unitDecimalPlaces: number;

  unit: string;

  quantity: number;
  unitCost: number;
  subtotal: number;

  previousStock: number;
  newStock: number;

  previousAverageCost: number;
  newAverageCost: number;
}

export interface PurchaseCreateRequest {
  supplierId: string;
  invoiceNumber?: string | null;
  purchaseDate?: string | null;
  tax: number;
  shippingCost: number;
  notes: string;
  details: PurchaseDetailRequest[];
}

export interface PurchaseDetailRequest {
  rawMaterialId: string;
  quantity: number;
  unitCost: number;
}

export interface PurchaseSummary {
  totalPurchases: number;
  purchasesThisMonth: number;
  totalInvested: number;
  investedThisMonth: number;
  averagePurchaseValue: number;
  suppliersUsed: number;
}
