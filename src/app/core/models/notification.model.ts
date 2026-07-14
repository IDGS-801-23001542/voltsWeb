export interface Notification {
  id: string;

  userId: string;

  title: string;
  message: string;

  isRead: boolean;

  createdAt: string;
  updatedAt?: string | null;

  createdBy?: string | null;
  updatedBy?: string | null;

  isDeleted: boolean;
}

export interface NotificationCreateRequest {
  userId: string;
  title: string;
  message: string;
}
