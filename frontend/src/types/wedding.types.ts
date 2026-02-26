// Wedding interface with all fields
export interface Wedding {
  id: string;
  couple_names: string;
  wedding_date?: string;
  venue_name?: string;
  venue_address?: string;
  venue_city?: string;
  venue_country?: string;
  welcome_message?: string;
  invitation_message_template?: string;
  cover_image_url?: string;
  theme_color_primary?: string;
  theme_color_secondary?: string;
  admin_email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Wedding public info for guest view
export interface WeddingPublicInfo {
  id: string;
  couple_names: string;
  wedding_date?: string;
  venue_name?: string;
  venue_address?: string;
  venue_city?: string;
  venue_country?: string;
  welcome_message?: string;
  cover_image_url?: string;
  theme_color_primary?: string;
  theme_color_secondary?: string;
}

// Wedding create for registration
export interface WeddingCreate {
  admin_email: string;
  admin_password: string;
  couple_names: string;
  wedding_date?: string;
  venue_name?: string;
  venue_address?: string;
  venue_city?: string;
  venue_country?: string;
  welcome_message?: string;
}

export interface WeddingUpdate {
  couple_names?: string;
  wedding_date?: string;
  venue_name?: string;
  venue_address?: string;
  venue_city?: string;
  venue_country?: string;
  welcome_message?: string;
  invitation_message_template?: string;
  cover_image_url?: string;
  theme_color_primary?: string;
  theme_color_secondary?: string;
  is_active?: boolean;
}

// Admin info
export interface AdminInfo {
  id: string;
  email: string;
  wedding_id: string;
}

// Admin authentication
export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  access_token: string;
  token_type: string;
  admin_id: string;
  wedding_id: string;
}

// Recent activity item
export interface RecentActivityItem {
  guest_name: string;
  action: string;
  action_type: string;
  time: string;
  detail?: string;
}

// Dashboard statistics
export interface DashboardStats {
  total_guests: number;
  confirmed_rsvps: number;
  pending_rsvps: number;
  declined_rsvps: number;
  travel_info_submitted: number;
  hotel_info_submitted: number;
  activity_registrations: number;
  media_pending_approval: number;
  recent_activity?: RecentActivityItem[];
  // Additional stats for dashboard
  confirmed_guests?: number;
  pending_guests?: number;
  declined_guests?: number;
  total_attending?: number;
  average_party_size?: number;
  vip_guests?: number;
  bride_side_guests?: number;
  groom_side_guests?: number;
  // Legacy fields for compatibility
  attending?: number;
  not_attending?: number;
  pending?: number;
  total_attendees?: number;
}
