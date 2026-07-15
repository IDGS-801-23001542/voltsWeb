export interface SystemLog {
  id: string;
  level: string;
  source: string;
  message: string;
  exceptionType?: string | null;
  stackTrace?: string | null;
  httpMethod: string;
  path: string;
  statusCode: number;
  userId?: string | null;
  userName?: string | null;
  roleName?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  correlationId: string;
  additionalData?: string | null;
  createdAt: string;
}

export interface SystemLogQuery {
  search?: string;
  level?: string;
  statusCode?: number | null;
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
}
