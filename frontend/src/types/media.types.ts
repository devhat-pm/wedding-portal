// File type enum
export enum FileType {
  IMAGE = 'image',
  VIDEO = 'video',
}

// Media status type
export type MediaStatus = 'pending' | 'approved' | 'rejected';

// Guest media interface (for admin gallery)
export interface GuestMedia {
  id: string;
  guest_id: string;
  media_type: 'photo' | 'video';
  file_type?: string;
  file_url: string;
  thumbnail_url?: string;
  caption?: string;
  status?: MediaStatus;
  is_approved?: boolean;
  uploaded_at: string;
  reviewed_at?: string;
  approved_at?: string;
  guest_name?: string;
}

// Media upload interface
export interface MediaUpload {
  id: string;
  guest_id: string;
  file_name: string;
  file_type: FileType | string;
  file_url: string;
  thumbnail_url?: string;
  file_size: number;
  caption?: string;
  event_tag?: string;
  is_approved: boolean;
  uploaded_at: string;
  approved_at?: string;
  guest_name?: string;
}

// Media upload form
export interface MediaUploadForm {
  file: File;
  caption?: string;
  event_tag?: string;
}

// Media upload response
export interface MediaUploadResponse {
  id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  thumbnail_url?: string;
  file_size: number;
  caption?: string;
  event_tag?: string;
  is_approved: boolean;
  uploaded_at: string;
}

// Media list response (for guest portal)
export interface MediaListResponse {
  items: MediaUpload[];
  total: number;
}

// Media list response (for admin - paginated)
export interface AdminMediaListResponse {
  items: GuestMedia[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// Media filters for admin
export interface MediaFilters {
  status?: MediaStatus;
  guest_id?: string;
  event_tag?: string;
  media_type?: 'photo' | 'video';
  file_type?: string;
  page?: number;
  page_size?: number;
}
