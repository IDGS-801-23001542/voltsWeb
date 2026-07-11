export interface ContactRequest {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}
