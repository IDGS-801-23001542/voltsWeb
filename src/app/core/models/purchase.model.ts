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

  status: string;
  notes: string;

  details: PurchaseDetail[];

  createdAt: string;
  createdBy?: string | null;
}

export interface PurchaseDetail {
  rawMaterialId: string;
  rawMaterialCode: string;
  rawMaterialName: string;
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
