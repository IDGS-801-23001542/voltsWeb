export type SupportTicketStatus =
  | 'Open'
  | 'InProgress'
  | 'Resolved'
  | 'Closed';

export type SupportTicketPriority =
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Urgent';

export type SupportTicketStatusFilter =
  | 'all'
  | SupportTicketStatus;

export type SupportTicketPriorityFilter =
  | 'all'
  | SupportTicketPriority;

export interface SupportTicket {
  id: string;

  customerId: string;
  customerName: string;

  email: string;

  subject: string;
  description: string;

  priority: SupportTicketPriority;
  status: SupportTicketStatus;

  createdAt: string;
  updatedAt?: string | null;

  createdBy?: string | null;
  updatedBy?: string | null;

  isDeleted: boolean;
}

export interface SupportTicketCreateRequest {
  customerId?: string | null;
  email: string;
  subject: string;
  description: string;
  priority: SupportTicketPriority;
}

export interface SupportTicketStatusRequest {
  status: SupportTicketStatus;
}
