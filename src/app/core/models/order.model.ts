export type OrderStatus =
  | 'PendingConfirmation'
  | 'AwaitingProduction'
  | 'ReadyForSale'
  | 'Sold'
  | 'Cancelled';

export interface OrderDetail {
  productId: string;
  productName: string;
  productImageUrl?: string | null;
  requestedQuantity: number;
  reservedQuantity: number;
  pendingQuantity: number;
  unitPrice: number;
  subtotal: number;
  unitCostSnapshot: number;
  totalCostSnapshot: number;
  estimatedProfit: number;
  estimatedMarginPercentage: number;
  minimumMarginSnapshot: number;
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
  assemblyMode: 'ReadyToUse' | 'DiyKit' | 'WorkshopAssist';
  status: OrderStatus;
  paymentStatus: 'Pending' | 'Paid';
  paymentMethod: 'Simulated' | string;
  paidAt?: string | null;
  paymentReference?: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  estimatedCost: number;
  estimatedProfit: number;
  estimatedMarginPercentage: number;
  hasMarginWarning: boolean;
  details: OrderDetail[];
  productionOrderIds: string[];
  confirmedAt?: string | null;
  readyForSaleAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}


