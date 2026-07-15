export interface PersonName {
  firstNames: string;
  paternalLastName: string;
  maternalLastName?: string | null;
  fullName?: string;
}

export interface Address {
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

export interface EntityStatusUpdateRequest {
  isActive: boolean;
}

export function formatAddress(address?: Address | null): string {
  if (!address) {
    return 'No registrada';
  }

  const number = [
    address.exteriorNumber,
    address.interiorNumber
      ? `Int. ${address.interiorNumber}`
      : ''
  ].filter(Boolean).join(' ');

  return [
    `${address.street} ${number}`.trim(),
    address.neighborhood,
    `C.P. ${address.postalCode}`,
    address.city,
    address.state,
    address.country
  ].filter(Boolean).join(', ');
}
