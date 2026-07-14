export type ProductCommercialStatus =
  | 'Available'
  | 'ComingSoon'
  | 'Unavailable'
  | 'Discontinued';

export type ProductStatusFilter =
  | 'all'
  | ProductCommercialStatus;

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName: string;
  category?: string | null;
  species: string;
  breed: string;
  commercialStatus: ProductCommercialStatus;
  canBePurchased: boolean;
  canBeProduced: boolean;
  imageUrl?: string | null;

  physicalStock: number;
  reservedStock: number;
  availableStock: number;
  minimumFinishedStock: number;

  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface ProductCreateRequest {
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: string;
  species: string;
  breed: string;
  commercialStatus: ProductCommercialStatus;
  canBePurchased: boolean;
  canBeProduced: boolean;
  imageUrl?: string | null;
  minimumFinishedStock: number;
}

export interface ProductUpdateRequest
  extends ProductCreateRequest {
  isActive: boolean;
}

export interface ProductStockAdjustmentRequest {
  quantity: number;
  reason: string;
}
