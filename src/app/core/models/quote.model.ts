export type QuoteRecipientType =
  | 'Customer'
  | 'Institution';

export type AssemblyMode =
  | 'ReadyToUse'
  | 'DiyKit'
  | 'WorkshopAssist';

export type QuoteStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled'
  | 'Converted';

export interface QuoteDetail {
  productId: string;
  productName: string;
  productImageUrl?: string | null;

  quantityPerPackage: number;
  totalQuantity: number;

  availableStockSnapshot: number;
  requiresProduction: boolean;

  unitPrice: number;
  subtotal: number;

  unitCostSnapshot: number;
  totalCostSnapshot: number;

  estimatedProfit: number;
  estimatedMarginPercentage: number;
  minimumMarginSnapshot: number;
}

export interface Quote {
  id: string;
  folio: string;

  recipientType: QuoteRecipientType;

  customerId?: string | null;
  institutionId?: string | null;

  recipientName: string;
  contactName: string;
  email: string;
  phone?: string | null;

  deliveryAddress?: import('./common.model').Address | null;

  commercialPlanId: string;
  commercialPlanName: string;

  commercialPackageId: string;
  commercialPackageName: string;

  assemblyMode: AssemblyMode;

  packageQuantity: number;
  packageUnitPrice: number;

  details: QuoteDetail[];

  subtotal: number;
  discount: number;
  assemblyDiscount: number;

  taxRate: number;
  tax: number;

  shipping: number;
  shippingPending: boolean;
  shippingCalculationType: string;

  deliveryMethod: string;
  deliveryEstimate: string;
  sameDayEligible: boolean;

  hasImmediateStock: boolean;
  stockMessage: string;

  total: number;

  estimatedCost: number;
  estimatedProfit: number;
  estimatedMarginPercentage: number;
  hasMarginWarning: boolean;

  validUntil: string;

  notes?: string | null;
  conditions?: string | null;

  status: QuoteStatus;

  convertedOrderId?: string | null;

  createdAt: string;
  updatedAt?: string | null;
}

export interface QuoteCreateRequest {
  recipientType: QuoteRecipientType;

  customerId?: string | null;
  institutionId?: string | null;

  contactName: string;
  email: string;
  phone?: string | null;

  commercialPackageId: string;

  assemblyMode: AssemblyMode;
  packageQuantity: number;

  notes?: string | null;
}

export interface QuoteBackofficeCreateRequest
  extends QuoteCreateRequest {
  discount: number;
  shipping: number;
  validityDays: number;
  conditions?: string | null;
}

export interface QuotePricingUpdateRequest {
  discount: number;
  shipping: number;
  validityDays: number;
  conditions?: string | null;
}
