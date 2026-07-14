export interface UnitOfMeasure {
  id: string;

  code: string;

  singularName: string;
  pluralName: string;

  symbol: string;

  allowsDecimals: boolean;
  decimalPlaces: number;

  isActive: boolean;
  isDeleted: boolean;

  createdAt: string;
  updatedAt?: string | null;
}

export interface UnitOfMeasureCreateRequest {
  code: string;

  singularName: string;
  pluralName: string;

  symbol: string;

  allowsDecimals: boolean;
  decimalPlaces: number;
}

export interface UnitOfMeasureUpdateRequest
  extends UnitOfMeasureCreateRequest {
  isActive: boolean;
}
