import api from './api';
import {
  GuestPortalData,
  GuestRSVP,
  TravelInfoUpdate,
  HotelInfoUpdate,
  GuestDressPreferenceUpdate,
  GuestFoodPreferenceUpdate,
  ActivityRegistrationForm,
  MediaUploadResponse,
  MediaListResponse,
  SuccessResponse,
} from '../types';

// Get complete portal data
export const getPortalData = async (token: string): Promise<GuestPortalData> => {
  const response = await api.get<GuestPortalData>(`/api/guest/${token}`);
  return response.data;
};

// Update RSVP
export const updateRSVP = async (
  token: string,
  data: GuestRSVP
): Promise<{
  id: string;
  full_name: string;
  rsvp_status: string;
  phone?: string;
  country?: string;
  number_of_attendees: number;
  special_requests?: string;
  rsvp_submitted_at?: string;
}> => {
  const response = await api.put(`/api/guest/${token}/rsvp`, data);
  return response.data;
};

// Update travel information
export const updateTravel = async (
  token: string,
  data: TravelInfoUpdate
): Promise<{
  id: string;
  arrival_date?: string;
  arrival_time?: string;
  arrival_flight_number?: string;
  arrival_airport?: string;
  departure_date?: string;
  departure_time?: string;
  departure_flight_number?: string;
  needs_pickup: boolean;
  needs_dropoff: boolean;
  special_requirements?: string;
}> => {
  const response = await api.put(`/api/guest/${token}/travel`, data);
  return response.data;
};

// Update hotel information
export const updateHotel = async (
  token: string,
  data: HotelInfoUpdate
): Promise<{
  id: string;
  suggested_hotel_id?: string;
  custom_hotel_name?: string;
  custom_hotel_address?: string;
  check_in_date?: string;
  check_out_date?: string;
  room_type?: string;
  number_of_rooms: number;
  special_requests?: string;
  booking_confirmation?: string;
}> => {
  const response = await api.put(`/api/guest/${token}/hotel`, data);
  return response.data;
};

// Update dress preference
export const updateDressPreference = async (
  token: string,
  data: GuestDressPreferenceUpdate
): Promise<{
  id: string;
  dress_code_id: string;
  planned_outfit_description?: string;
  color_choice?: string;
  needs_shopping_assistance: boolean;
  notes?: string;
}> => {
  const response = await api.put(`/api/guest/${token}/dress-preference`, data);
  return response.data;
};

// Update food preference
export const updateFoodPreference = async (
  token: string,
  data: GuestFoodPreferenceUpdate
): Promise<{
  id: string;
  dietary_restrictions?: string[];
  allergies?: string;
  cuisine_preferences?: string;
  special_requests?: string;
  meal_size_preference?: string;
}> => {
  const response = await api.put(`/api/guest/${token}/food-preference`, data);
  return response.data;
};

// Register for activity
export const registerActivity = async (
  token: string,
  activityId: string,
  data: ActivityRegistrationForm
): Promise<{
  id: string;
  activity_id: string;
  activity_name: string;
  number_of_participants: number;
  notes?: string;
  registered_at: string;
}> => {
  const response = await api.post(
    `/api/guest/${token}/activities/${activityId}/register`,
    data
  );
  return response.data;
};

// Unregister from activity
export const unregisterActivity = async (
  token: string,
  activityId: string
): Promise<SuccessResponse> => {
  const response = await api.delete<SuccessResponse>(
    `/api/guest/${token}/activities/${activityId}/unregister`
  );
  return response.data;
};

// Upload media file
export const uploadMedia = async (
  token: string,
  file: File,
  data?: { caption?: string; event_tag?: string }
): Promise<MediaUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  if (data?.caption) {
    formData.append('caption', data.caption);
  }
  if (data?.event_tag) {
    formData.append('event_tag', data.event_tag);
  }

  const response = await api.post<MediaUploadResponse>(
    `/api/guest/${token}/media/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

// Get guest's own media
export const getMyMedia = async (token: string): Promise<MediaListResponse> => {
  const response = await api.get<MediaListResponse>(`/api/guest/${token}/media`);
  return response.data;
};

// Delete guest's own media
export const deleteMedia = async (token: string, mediaId: string): Promise<SuccessResponse> => {
  const response = await api.delete<SuccessResponse>(`/api/guest/${token}/media/${mediaId}`);
  return response.data;
};
