export interface SaleDetail {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  unitCostSnapshot: number;
  totalCostSnapshot: number;
  grossProfit: number;
  grossMarginPercentage: number;
  minimumMarginSnapshot: number;
}

export interface Sale {
  id: string;
  folio: string;
  orderId: string;
  orderFolio: string;
  quoteId: string;
  quoteFolio: string;
  recipientType: 'Customer' | 'Institution';
  customerId?: string | null;
  institutionId?: string | null;
  recipientName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  commercialPlanId: string;
  commercialPlanName: string;
  commercialPackageId: string;
  commercialPackageName: string;
  assemblyMode: 'ReadyToUse' | 'DiyKit' | 'WorkshopAssist';
  saleDate: string;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  costOfGoodsSold: number;
  grossProfit: number;
  grossMarginPercentage: number;
  hasMarginWarning: boolean;
  details: SaleDetail[];
  licenseIds: string[];
}


