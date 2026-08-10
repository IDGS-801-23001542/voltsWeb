

export type LicenseStatus =
  | 'Available'
  | 'Active'
  | 'Expired'
  | 'Revoked';

export interface License {
  id: string;
  licenseCode: string;
  saleId: string;
  saleFolio: string;
  orderId: string;
  orderFolio: string;
  saleDetailId: string;
  productId: string;
  productName: string;
  productImageUrl?: string | null;
  commercialPlanId: string;
  commercialPlanName: string;
  commercialPackageId: string;
  commercialPackageName: string;
  recipientType: 'Customer' | 'Institution';
  customerId?: string | null;
  institutionId?: string | null;
  recipientName: string;
  recipientEmail?: string;
  status: LicenseStatus;
  warrantyStartDate: string;
  warrantyEndDate: string;
  activationDate?: string | null;
  expirationDate?: string | null;
  assignedToName?: string | null;
  assignedToEmail?: string | null;
  assignedMemberId?: string | null;
  deviceId?: string | null;
  deviceSerialNumber?: string | null;
  createdAt: string;
}
