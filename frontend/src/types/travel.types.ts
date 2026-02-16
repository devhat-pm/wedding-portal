// Guest travel info interface
export interface GuestTravelInfo {
  id: string;
  guest_id: string;
  arrival_date?: string;
  arrival_time?: string;
  arrival_flight_number?: string;
  arrival_airport?: string;
  departure_date?: string;
  departure_time?: string;
  departure_flight_number?: string;
  needs_pickup?: boolean;
  needs_dropoff?: boolean;
  special_requirements?: string;
  created_at?: string;
  updated_at?: string;
}

// Legacy alias
export type TravelInfo = GuestTravelInfo;

// Travel info form state
export interface GuestTravelInfoForm {
  arrival_date?: string;
  arrival_time?: string;
  arrival_flight_number?: string;
  arrival_airport?: string;
  departure_date?: string;
  departure_time?: string;
  departure_flight_number?: string;
  needs_pickup?: boolean;
  needs_dropoff?: boolean;
  special_requirements?: string;
}

// Travel info create/update request
export interface GuestTravelInfoUpdate {
  arrival_date?: string;
  arrival_time?: string;
  arrival_flight_number?: string;
  arrival_airport?: string;
  departure_date?: string;
  departure_time?: string;
  departure_flight_number?: string;
  needs_pickup?: boolean;
  needs_dropoff?: boolean;
  special_requirements?: string;
}

// Legacy aliases
export type TravelInfoForm = GuestTravelInfoForm;
export type TravelInfoUpdate = GuestTravelInfoUpdate;
