export type UpdatePlatform =
  | 'Android'
  | 'Firmware'
  | 'Web'
  | 'General'
  | 'iOS';

export type UpdatePlatformFilter =
  | 'all'
  | UpdatePlatform;

export type UpdatePublicationFilter =
  | 'all'
  | 'published'
  | 'draft';

export interface UpdateNews {
  id: string;

  title: string;
  content: string;

  version: string;
  platform: UpdatePlatform;

  publishDate: string;
  isPublished: boolean;

  createdAt: string;
  updatedAt?: string | null;

  createdBy?: string | null;
  updatedBy?: string | null;

  isDeleted: boolean;
}

export interface UpdateNewsCreateRequest {
  title: string;
  content: string;
  version: string;
  platform: UpdatePlatform;
  isPublished: boolean;
}

export interface UpdateNewsUpdateRequest
  extends UpdateNewsCreateRequest {
}
