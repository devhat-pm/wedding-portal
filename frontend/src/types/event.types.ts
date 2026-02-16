// Event interface - matches backend EventResponse
export interface Event {
  id: string;
  name: string;
  title?: string;
  name_arabic?: string;
  description?: string;
  description_arabic?: string;
  event_type: string;
  start_datetime: string;
  end_datetime?: string;
  venue_name?: string;
  venue_name_arabic?: string;
  address?: string;
  address_arabic?: string;
  city?: string;
  country?: string;
  map_url?: string;
  max_capacity?: number;
  dress_code?: string;
  dress_code_arabic?: string;
  is_main_event: boolean;
  is_active: boolean;
  cover_image?: string;
  cover_image_url?: string;
  is_upcoming?: boolean;
  confirmed_guests_count?: number;
  total_invitations?: number;
  display_order?: number;
  created_at: string;
  updated_at: string;
}

// Event create
export interface EventCreate {
  name: string;
  title?: string;
  name_arabic?: string;
  event_type: string;
  start_datetime: string;
  end_datetime?: string;
  venue_name?: string;
  venue_name_arabic?: string;
  address?: string;
  city?: string;
  country?: string;
  map_url?: string;
  max_capacity?: number;
  dress_code?: string;
  description?: string;
  cover_image?: string;
  is_main_event?: boolean;
}

// Event update
export interface EventUpdate {
  name?: string;
  title?: string;
  name_arabic?: string;
  event_type?: string;
  start_datetime?: string;
  end_datetime?: string;
  venue_name?: string;
  venue_name_arabic?: string;
  address?: string;
  city?: string;
  country?: string;
  map_url?: string;
  max_capacity?: number;
  dress_code?: string;
  description?: string;
  cover_image?: string;
  is_main_event?: boolean;
  is_active?: boolean;
}
