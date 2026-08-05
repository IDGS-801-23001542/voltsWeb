export type RecipeStatus =
  | 'Draft'
  | 'Active'
  | 'Archived';

export interface Recipe {
  id: string;
  code: string;

  productId: string;
  productName: string;

  version: number;

  status: RecipeStatus;
  isActive: boolean;

  estimatedUnitCost: number;

  notes: string;

  details: RecipeDetail[];

  isDeleted: boolean;

  createdAt: string;
  updatedAt?: string | null;
}

export interface RecipeDetail {
  rawMaterialId: string;
  rawMaterialCode: string;
  rawMaterialName: string;

  unitOfMeasureId: string;
  unitCode: string;
  unitName: string;
  unitSymbol: string;

  unitAllowsDecimals: boolean;
  unitDecimalPlaces: number;

  /**
   * Campo de compatibilidad enviado por el backend.
   * Actualmente contiene el símbolo de la unidad.
   */
  unit: string;

  /**
   * Cantidad neta requerida para fabricar
   * una unidad del producto.
   */
  quantityRequired: number;

  /**
   * Porcentaje de merma esperado.
   */
  wastePercentage: number;

  /**
   * Cantidad requerida después de aplicar
   * el porcentaje de merma.
   *
   * Corresponde a:
   * RecipeDetail.TotalQuantityPerUnit
   */
  totalQuantityPerUnit: number;

  acceptsRecoveredWaste: boolean;

  /**
   * Costo promedio unitario de la materia prima
   * capturado cuando se construyó la receta.
   *
   * Corresponde a:
   * RecipeDetail.EstimatedUnitCost
   */
  estimatedUnitCost: number;

  /**
   * Costo estimado de este componente:
   *
   * totalQuantityPerUnit × estimatedUnitCost
   */
  estimatedSubtotal: number;
}

export interface RecipeDetailRequest {
  rawMaterialId: string;

  quantityRequired: number;

  wastePercentage: number;

  acceptsRecoveredWaste: boolean;
}

export interface RecipeRequest {
  productId: string;

  version: number;

  status: RecipeStatus;

  notes: string;

  details: RecipeDetailRequest[];
}



