export type SupplierType =
  | 'Electronics'
  | 'Cardboard'
  | 'Textiles'
  | 'Adhesives'
  | 'Mechanical'
  | 'Soldering'
  | 'Packaging'
  | 'General';

export type SupplierMaterialCategory =
  | 'Cardboard'
  | 'Electronics'
  | 'Mechanical'
  | 'Textiles'
  | 'Adhesives'
  | 'Consumables'
  | 'Soldering'
  | 'Packaging'
  | 'Other';

export interface SupplierAddress {
  street: string;
  exteriorNumber: string;
  interiorNumber?: string | null;
  neighborhood: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  references?: string | null;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  legalName: string;
  taxId: string;
  contactName: string;
  email: string;
  phone?: string | null;
  address: SupplierAddress;
  supplierType: SupplierType;
  materialCategories: SupplierMaterialCategory[];
  leadTimeDays: number;
  paymentTerms: string;
  notes: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface SupplierRequest {
  code: string;
  name: string;
  legalName: string;
  taxId: string;
  contactName: string;
  email: string;
  phone?: string | null;
  address: SupplierAddress;
  supplierType: SupplierType;
  materialCategories: SupplierMaterialCategory[];
  leadTimeDays: number;
  paymentTerms: string;
  notes: string;
}

export interface SupplierUpdateRequest
  extends SupplierRequest {
  isActive: boolean;
}
