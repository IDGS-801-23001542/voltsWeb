export type ProductCommercialStatus =
  | 'Available'
  | 'ComingSoon'
  | 'Unavailable'
  | 'Discontinued';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;

  categoryId: string;
  categoryName: string;
  category: string;

  species: string;
  breed: string;

  commercialStatus: ProductCommercialStatus;

  canBePurchased: boolean;
  canBeProduced: boolean;

  imageUrl?: string | null;

  finishedStock: number;
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

export type ProductStatusFilter =
  | 'all'
  | ProductCommercialStatus;
