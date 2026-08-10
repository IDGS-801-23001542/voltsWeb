export type DonationStatus = 'Pending' | 'Received' | 'Rejected';

export interface DonationMaterialOption {
  id: string;
  code: string;
  name: string;
  unitCode: string;
  unitName: string;
  unitSymbol: string;
  unitAllowsDecimals: boolean;
  unitDecimalPlaces: number;
}

export interface DonationItem {
  rawMaterialId: string;
  rawMaterialCode: string;
  rawMaterialName: string;
  unitOfMeasureId: string;
  unitCode: string;
  unitName: string;
  unitSymbol: string;
  unitAllowsDecimals: boolean;
  unitDecimalPlaces: number;
  quantity: number;
  receivedQuantity: number;
}

export interface Donation {
  id: string;
  folio: string;
  donorUserId?: string | null;
  donorName: string;
  donorEmail: string;
  donorPhone?: string | null;
  notes?: string | null;
  status: DonationStatus;
  items: DonationItem[];
  receivedAt?: string | null;
  receivedBy?: string | null;
  rejectedAt?: string | null;
  rejectedBy?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
}

export interface DonationCreateRequest {
  donorName: string;
  donorEmail: string;
  donorPhone?: string | null;
  notes?: string | null;
  items: Array<{
    rawMaterialId: string;
    quantity: number;
  }>;
}
