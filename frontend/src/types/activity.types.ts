// Activity interface
export interface Activity {
  id: string;
  wedding_id: string;
  activity_name: string;
  title: string;
  description?: string;
  event_day?: number;
  date_time?: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  location?: string;
  max_participants?: number;
  capacity?: number;
  registered_count?: number;
  current_participants?: number;
  is_optional?: boolean;
  is_featured?: boolean;
  requires_signup?: boolean;
  requires_registration?: boolean;
  image_url?: string;
  notes?: string;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

// Activity with count (for admin view)
export interface ActivityWithCount extends Activity {
  participant_count: number;
  total_attendees: number;
}

// Activity create/update
export interface ActivityCreate {
  activity_name?: string;
  title?: string;
  description?: string;
  date_time?: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  location?: string;
  max_participants?: number;
  capacity?: number;
  is_optional?: boolean;
  requires_signup?: boolean;
  requires_registration?: boolean;
  image_url?: string;
  notes?: string;
  display_order?: number;
}

export interface ActivityUpdate {
  activity_name?: string;
  title?: string;
  description?: string;
  date_time?: string;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  location?: string;
  max_participants?: number;
  capacity?: number;
  is_optional?: boolean;
  requires_signup?: boolean;
  requires_registration?: boolean;
  image_url?: string;
  notes?: string;
  display_order?: number;
}

// Guest activity registration interface
export interface GuestActivityRegistration {
  id: string;
  guest_id: string;
  activity_id: string;
  number_of_participants: number;
  notes?: string;
  registered_at: string;
}

// Guest activity registration form
export interface ActivityRegistrationForm {
  activity_id: string;
  number_of_participants: number;
  notes?: string;
}

// Guest registration info (for admin view)
export interface GuestRegistration {
  guest_id: string;
  guest_name: string;
  guest_email?: string;
  number_of_participants: number;
  notes?: string;
  registered_at?: string;
}
