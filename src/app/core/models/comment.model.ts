export type CommentApprovalFilter =
  | 'all'
  | 'approved'
  | 'pending';

export type CommentRatingFilter =
  | 'all'
  | 1
  | 2
  | 3
  | 4
  | 5;

export interface Comment {
  id: string;

  fullName: string;
  email: string;
  message: string;

  rating: number;
  isApproved: boolean;

  createdAt: string;
  updatedAt?: string | null;

  createdBy?: string | null;
  updatedBy?: string | null;

  isDeleted: boolean;
}

export interface CommentCreateRequest {
  fullName: string;
  email: string;
  message: string;
  rating: number;
}

export interface CommentApprovalRequest {
  isApproved: boolean;
}
