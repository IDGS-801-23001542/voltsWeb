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

export interface Supplier {
  id: string;
  code: string;
  name: string;
  legalName: string;
  taxId: string;
  contactName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
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
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
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
