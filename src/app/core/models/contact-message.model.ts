export type ContactMessageStatus =
  | 'New'
  | 'InProgress'
  | 'Responded'
  | 'Closed';

export type ContactMessageStatusFilter =
  | 'all'
  | ContactMessageStatus;

export interface ContactMessage {
  id: string;

  fullName: string;
  email: string;
  phone?: string | null;

  subject: string;
  message: string;

  status: ContactMessageStatus;

  createdAt: string;
  updatedAt?: string | null;

  createdBy?: string | null;
  updatedBy?: string | null;

  isDeleted: boolean;
}

export interface ContactCreateRequest {
  fullName: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}

export interface ContactStatusRequest {
  status: ContactMessageStatus;
}
