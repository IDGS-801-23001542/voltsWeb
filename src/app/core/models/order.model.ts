export type OrderStatus =
  | 'PendingConfirmation'
  | 'AwaitingProduction'
  | 'ReadyForSale'
  | 'Sold'
  | 'Cancelled';

export interface OrderDetail {
  productId: string;
  productName: string;
  requestedQuantity: number;
  reservedQuantity: number;
  pendingQuantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  folio: string;
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
  status: OrderStatus;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  details: OrderDetail[];
  productionOrderIds: string[];
  confirmedAt?: string | null;
  readyForSaleAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}
