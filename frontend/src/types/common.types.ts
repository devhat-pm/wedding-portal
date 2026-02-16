// Generic paginated response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// API Error interface
export interface ApiError {
  detail: string;
  error_code?: string;
  status_code?: number;
  timestamp?: string;
  errors?: Record<string, string>;
}

// Success response
export interface SuccessResponse {
  message: string;
  data?: Record<string, unknown>;
}

// Pagination params for requests
export interface PaginationParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Message response
export interface MessageResponse {
  message: string;
}

// User types for auth
export interface User {
  id: string;
  email: string;
  name: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: string;
  is_active: boolean;
  is_verified?: boolean;
  avatar_url?: string;
  last_login?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserCreate {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  name?: string;
  phone?: string;
}

export interface UserUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface LoginCredentials {
  email: string;
  username?: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
  expires_in?: number;
  user?: User;
}

// Invitation types - matches backend InvitationResponse
export interface Invitation {
  id: string;
  guest_id: string;
  event_id?: string;
  invitation_code?: string;
  code: string;
  is_sent?: boolean;
  sent_date?: string;
  sent_at?: string;
  sent_method?: string;
  is_delivered?: boolean;
  delivered_date?: string;
  is_opened?: boolean;
  opened_date?: string;
  opened_at?: string;
  notes?: string;
  guest_name?: string;
  event_name?: string;
  qr_code?: string;
  created_at: string;
  updated_at?: string;
}

export interface InvitationCreate {
  guest_id: string;
  event_id: string;
  notes?: string;
}

export interface InvitationUpdate {
  is_sent?: boolean;
  sent_method?: string;
  is_delivered?: boolean;
  is_opened?: boolean;
  notes?: string;
  sent_at?: string;
  opened_at?: string;
}

// Guest group types
export interface GuestGroup {
  id: string;
  name: string;
  description?: string;
  guest_count: number;
  created_at: string;
}

export interface GuestGroupCreate {
  name: string;
  description?: string;
}

export interface GuestGroupUpdate {
  name?: string;
  description?: string;
}

