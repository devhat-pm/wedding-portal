// Suggested hotel interface
export interface SuggestedHotel {
  id: string;
  wedding_id: string;
  hotel_name: string;
  name: string;
  address?: string;
  phone?: string;
  website_url?: string;
  website?: string;
  booking_link?: string;
  booking_url?: string;
  distance_from_venue?: string;
  price_range?: string;
  star_rating?: number;
  description?: string;
  amenities?: string[];
  image_urls?: string[];
  image_url?: string;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Suggested hotel create/update
export interface SuggestedHotelCreate {
  hotel_name?: string;
  name?: string;
  address?: string;
  phone?: string;
  website_url?: string;
  website?: string;
  booking_link?: string;
  booking_url?: string;
  distance_from_venue?: string;
  price_range?: string;
  star_rating?: number;
  description?: string;
  amenities?: string[];
  image_urls?: string[];
  image_url?: string;
  notes?: string;
  display_order?: number;
}

export interface SuggestedHotelUpdate {
  hotel_name?: string;
  name?: string;
  address?: string;
  phone?: string;
  website_url?: string;
  website?: string;
  booking_link?: string;
  booking_url?: string;
  distance_from_venue?: string;
  price_range?: string;
  star_rating?: number;
  description?: string;
  amenities?: string[];
  image_urls?: string[];
  image_url?: string;
  notes?: string;
  display_order?: number;
}

// Guest hotel preference interface
export interface GuestHotelPreference {
  id: string;
  guest_id: string;
  suggested_hotel_id?: string;
  custom_hotel_name?: string;
  custom_hotel_address?: string;
  check_in_date?: string;
  check_out_date?: string;
  room_type?: string;
  number_of_rooms?: number;
  special_requests?: string;
  booking_confirmation?: string;
  suggested_hotel?: SuggestedHotel;
}

// Hotel preference form state
export interface GuestHotelPreferenceForm {
  suggested_hotel_id?: string;
  custom_hotel_name?: string;
  custom_hotel_address?: string;
  check_in_date?: string;
  check_out_date?: string;
  room_type?: string;
  number_of_rooms?: number;
  special_requests?: string;
  booking_confirmation?: string;
}

// Hotel preference update request
export interface GuestHotelPreferenceUpdate {
  suggested_hotel_id?: string;
  custom_hotel_name?: string;
  custom_hotel_address?: string;
  check_in_date?: string;
  check_out_date?: string;
  room_type?: string;
  number_of_rooms?: number;
  special_requests?: string;
  booking_confirmation?: string;
}

// HotelInfo type alias (same as GuestHotelPreference)
export type HotelInfo = GuestHotelPreference;

// HotelInfoUpdate type alias
export type HotelInfoUpdate = GuestHotelPreferenceUpdate;
