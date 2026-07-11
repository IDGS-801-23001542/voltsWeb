export interface QuoteRequest {
  fullName: string;
  email: string;
  phone?: string;
  institutionName?: string;
  planName: string;
  quantity: number;
  unitPrice: number;
  shipping: number;
  notes?: string;
}
