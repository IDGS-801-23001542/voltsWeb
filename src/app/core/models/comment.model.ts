export type CommentApprovalFilter = 'all' | 'approved' | 'pending';
export type CommentRatingFilter = 'all' | 1 | 2 | 3 | 4 | 5;

export interface Comment {
  id: string; fullName: string; email: string; message: string; rating: number;
  isApproved: boolean; userId?: string | null; customerId?: string | null;
  saleId?: string | null; saleFolio?: string | null; productId?: string | null;
  productName?: string | null; assemblyMode?: 'ReadyToUse' | 'DiyKit' | 'WorkshopAssist' | null;
  isVerifiedPurchase: boolean; createdAt: string; updatedAt?: string | null; isDeleted: boolean;
}
export interface CommentCreateRequest {
  fullName: string; email: string; message: string; rating: number;
  saleId?: string | null; productId?: string | null;
}
export interface CommentApprovalRequest { isApproved: boolean; }


