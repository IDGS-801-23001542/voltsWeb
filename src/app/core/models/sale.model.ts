export interface SaleDetail {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
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
  saleDate: string;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  details: SaleDetail[];
  licenseIds: string[];
}
