export interface Notification {
  id: string; userId: string; userName: string; title: string; message: string;
  type: string; priority: string; module: string;
  entityType?: string | null; entityId?: string | null; entityFolio?: string | null;
  route?: string | null; isRead: boolean; readAt?: string | null; expiresAt?: string | null;
  createdAt: string; updatedAt?: string | null; isDeleted: boolean;
}
export interface NotificationCreateRequest {
  userId?: string | null; targetRole?: string | null; title: string; message: string;
  type: string; priority: string; module: string; route?: string | null;
}
