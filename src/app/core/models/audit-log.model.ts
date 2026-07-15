export interface PaginatedResult<T> { items: T[]; total: number; page: number; pageSize: number; totalPages: number; }
export interface AuditLog {
  id: string; userId?: string | null; userName: string; roleName: string; actorType: string;
  area: string; module: string; action: string; entityType: string; entityId?: string | null;
  entityFolio?: string | null; result: string; description: string; httpMethod: string;
  path: string; statusCode: number; durationMs: number; ipAddress?: string | null;
  userAgent?: string | null; correlationId: string; requestData?: string | null;
  responseData?: string | null; createdAt: string;
}
export interface AuditLogQuery { search?: string; module?: string; action?: string; from?: string; to?: string; page: number; pageSize: number; }
