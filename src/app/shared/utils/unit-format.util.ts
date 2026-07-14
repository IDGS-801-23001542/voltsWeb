export interface UnitAwareValue {
  unitSymbol: string;
  unitAllowsDecimals: boolean;
  unitDecimalPlaces: number;
}

export function quantityStep(
  item?: UnitAwareValue | null
): string {
  if (!item || !item.unitAllowsDecimals) {
    return '1';
  }

  return (
    1 / 10 ** item.unitDecimalPlaces
  ).toString();
}

export function formatQuantity(
  value: number,
  item: UnitAwareValue
): string {
  return Number(value).toLocaleString(
    'es-MX',
    {
      minimumFractionDigits: 0,
      maximumFractionDigits:
        item.unitAllowsDecimals
          ? item.unitDecimalPlaces
          : 0
    }
  );
}

export function isValidQuantity(
  value: number,
  item: UnitAwareValue,
  positiveRequired = true
): boolean {
  if (!Number.isFinite(value)) {
    return false;
  }

  if (
    positiveRequired
      ? value <= 0
      : value < 0
  ) {
    return false;
  }

  if (
    !item.unitAllowsDecimals &&
    !Number.isInteger(value)
  ) {
    return false;
  }

  const text = value.toString();
  const decimalPlaces =
    text.includes('.')
      ? text.split('.')[1].length
      : 0;

  return (
    decimalPlaces <=
    item.unitDecimalPlaces
  );
}
