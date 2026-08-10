
export interface CommercialPackageItem {
  productId: string;
  productName: string;
  productImageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CommercialPackage {
  id: string;
  commercialPlanId: string;
  commercialPlanName: string;
  name: string;
  code: string;
  description: string;
  price: number;
  referencePrice: number;
  savings: number;
  items: CommercialPackageItem[];
  displayOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CommercialPackageItemRequest {
  productId: string;
  quantity: number;
}

export interface CommercialPackageCreateRequest {
  commercialPlanId: string;
  name: string;
  code: string;
  description: string;
  price: number;
  items: CommercialPackageItemRequest[];
  displayOrder: number;
}

export interface CommercialPackageUpdateRequest extends CommercialPackageCreateRequest {
  isActive: boolean;
}



