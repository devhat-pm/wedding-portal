// RSVP Status - const object for runtime values and type for type checking
export const RSVPStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  DECLINED: 'declined',
  TENTATIVE: 'maybe',
  // lowercase aliases
  pending: 'pending',
  confirmed: 'confirmed',
  declined: 'declined',
  maybe: 'maybe',
} as const;
export type RSVPStatus = 'pending' | 'confirmed' | 'declined' | 'maybe';

// Guest Side - const object for runtime values and type for type checking
export const GuestSide = {
  BRIDE: 'bride',
  GROOM: 'groom',
  BOTH: 'both',
  // lowercase aliases
  bride: 'bride',
  groom: 'groom',
  both: 'both',
} as const;
export type GuestSide = 'bride' | 'groom' | 'both';

// Guest Relation - const object for runtime values
export const GuestRelation = {
  FAMILY: 'family',
  FRIEND: 'friend',
  COLLEAGUE: 'colleague',
  NEIGHBOR: 'neighbor',
  OTHER: 'other',
  // lowercase aliases
  family: 'family',
  friend: 'friend',
  colleague: 'colleague',
  neighbor: 'neighbor',
  other: 'other',
} as const;
export type GuestRelation = 'family' | 'friend' | 'colleague' | 'neighbor' | 'other';

// Guest interface with all fields
export interface Guest {
  id: string;
  wedding_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  country_of_origin?: string;
  country?: string;
  unique_token: string;
  rsvp_status: RSVPStatus;
  rsvp_submitted_at?: string;
  number_of_attendees: number;
  number_of_guests?: number;
  dietary_restrictions?: string;
  special_requests?: string;
  guest_side?: 'bride' | 'groom' | 'both';
  is_vip?: boolean;
  table_number?: string;
  notes?: string;
  last_accessed_at?: string;
  created_at: string;
  updated_at: string;
  // Related data (optional, loaded when fetching full details)
  travel_info?: TravelInfo;
  hotel_info?: HotelInfo;
  dress_preferences?: GuestDressPreference[];
  food_preferences?: GuestFoodPreference;
  activity_registrations?: GuestActivityRegistration[];
  registered_activities?: string[];
  media_uploads?: MediaUpload[];
}

// Guest RSVP update
export interface GuestRSVP {
  rsvp_status: RSVPStatus;
  phone?: string;
  country?: string;
  number_of_attendees?: number;
  number_of_guests?: number;
  dietary_restrictions?: string;
  special_requests?: string;
}

// Guest list item for admin list (lighter version)
export interface GuestListItem {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  country_of_origin?: string;
  country?: string;
  rsvp_status: RSVPStatus;
  number_of_attendees: number;
  number_of_guests?: number;
  guest_side?: 'bride' | 'groom' | 'both';
  is_vip?: boolean;
  table_number?: string;
  unique_token: string;
  has_travel_info?: boolean;
  has_hotel_info?: boolean;
  travel_info_submitted?: boolean;
  hotel_info_submitted?: boolean;
  last_accessed_at?: string;
  created_at?: string;
  guest_link?: string;
}

// Guest create
export interface GuestCreate {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  country_of_origin?: string;
  country?: string;
  guest_side?: 'bride' | 'groom' | 'both';
  is_vip?: boolean;
  table_number?: string;
  notes?: string;
  number_of_attendees?: number;
  number_of_guests?: number;
}

// Guest update
export interface GuestUpdate {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  country_of_origin?: string;
  country?: string;
  rsvp_status?: RSVPStatus;
  number_of_attendees?: number;
  number_of_guests?: number;
  dietary_restrictions?: string;
  special_requests?: string;
  guest_side?: 'bride' | 'groom' | 'both';
  is_vip?: boolean;
  table_number?: string;
  notes?: string;
}

// Guest info in portal data
export interface GuestInfo {
  id: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  country_of_origin?: string;
  country?: string;
  rsvp_status?: RSVPStatus;
  number_of_attendees: number;
  number_of_guests?: number;
  dietary_restrictions?: string;
  special_requests?: string;
  guest_side?: 'bride' | 'groom' | 'both';
  is_vip?: boolean;
  table_number?: string;
}

// Guest filters for admin list
export interface GuestFilters {
  search?: string;
  rsvp_status?: RSVPStatus;
  guest_side?: 'bride' | 'groom' | 'both';
  side?: 'bride' | 'groom' | 'both';
  relation?: string;
  is_vip?: boolean;
  group_id?: string;
  has_plus_one?: boolean;
  has_travel_info?: boolean;
  has_hotel_info?: boolean;
}

// ============================================
// Guest Portal Data Types (inline to avoid circular imports)
// ============================================

import { TravelInfo } from './travel.types';
import { HotelInfo, SuggestedHotel } from './hotel.types';
import { DressCode, GuestDressPreference } from './dress.types';
import { FoodMenu, GuestFoodPreference } from './food.types';
import { Activity, GuestActivityRegistration } from './activity.types';
import { MediaUpload } from './media.types';
import { WeddingPublicInfo } from './wedding.types';

// Dress code with guest preference
export interface DressCodeWithPreference extends DressCode {
  guest_preference?: GuestDressPreference | null;
}

// Activity with registration status
export interface ActivityWithRegistration extends Activity {
  is_registered: boolean;
  registration?: GuestActivityRegistration | null;
}

// Complete guest portal data returned from GET /{token}
export interface GuestPortalData {
  guest: GuestInfo;
  wedding: WeddingPublicInfo;
  travel_info: TravelInfo | null;
  hotel_info: HotelInfo | null;
  suggested_hotels: SuggestedHotel[];
  dress_codes: DressCodeWithPreference[];
  food_menus: FoodMenu[];
  food_preference: GuestFoodPreference | null;
  activities: ActivityWithRegistration[];
  media_uploads: MediaUpload[];
}
