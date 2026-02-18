import api from './api';
import {
  Guest,
  GuestCreate,
  GuestUpdate,
  GuestListItem,
  PaginatedResponse,
  SuccessResponse,
} from '../types';
import type { RSVPStatus } from '../types';

interface GuestFilters {
  page?: number;
  page_size?: number;
  per_page?: number;
  search?: string;
  rsvp_status?: RSVPStatus;
  has_travel_info?: boolean;
  has_hotel_info?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Upload guests from Excel file
export const uploadGuestsExcel = async (file: File): Promise<{ created: number; created_count: number; skipped_count: number; errors: string[]; guests: GuestListItem[] }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<{ created: number; created_count: number; skipped_count: number; errors: string[]; guests: GuestListItem[] }>(
    '/api/admin/guests/upload-excel',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

// Get guests list with filters and pagination
export const getGuests = async (
  params: GuestFilters
): Promise<PaginatedResponse<GuestListItem>> => {
  const response = await api.get<PaginatedResponse<GuestListItem>>('/api/admin/guests', { params });
  return response.data;
};

// Get single guest by ID
export const getGuest = async (id: string): Promise<Guest> => {
  const response = await api.get<Guest>(`/api/admin/guests/${id}`);
  return response.data;
};

// Create new guest
export const createGuest = async (data: GuestCreate): Promise<Guest> => {
  const response = await api.post<Guest>('/api/admin/guests', data);
  return response.data;
};

// Update guest
export const updateGuest = async (id: string, data: GuestUpdate): Promise<Guest> => {
  const response = await api.put<Guest>(`/api/admin/guests/${id}`, data);
  return response.data;
};

// Delete guest
export const deleteGuest = async (id: string): Promise<SuccessResponse> => {
  const response = await api.delete<SuccessResponse>(`/api/admin/guests/${id}`);
  return response.data;
};

// Regenerate guest link
export const regenerateLink = async (id: string): Promise<{ unique_token: string; portal_url: string }> => {
  const response = await api.post<{ unique_token: string; portal_url: string }>(
    `/api/admin/guests/${id}/regenerate-link`
  );
  return response.data;
};

// Export guests to Excel
export const exportGuests = async (): Promise<Blob> => {
  const response = await api.get('/api/admin/guests/export', {
    responseType: 'blob',
  });
  return response.data;
};

// Export as object for convenient usage
export const guestsApi = {
  uploadGuestsExcel,
  getGuests,
  getGuest,
  createGuest,
  updateGuest,
  deleteGuest,
  regenerateLink,
  exportGuests,
};
