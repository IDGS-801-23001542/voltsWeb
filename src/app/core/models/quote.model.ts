export type QuoteRecipientType =
  | 'Customer'
  | 'Institution';

export type QuoteStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled'
  | 'Converted';

export interface QuoteDetail {
  productId: string;
  productName: string;
  quantityPerPackage: number;
  totalQuantity: number;
  unitPrice: number;
  subtotal: number;
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
  commercialPlanId: string;
  commercialPlanName: string;
  commercialPackageId: string;
  commercialPackageName: string;
  packageQuantity: number;
  packageUnitPrice: number;
  details: QuoteDetail[];
  subtotal: number;
  discount: number;
  taxRate: number;
  tax: number;
  shipping: number;
  total: number;
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
