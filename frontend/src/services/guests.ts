import api from './api';
import {
  Guest,
  GuestCreate,
  GuestUpdate,
  GuestListItem,
  GuestGroup,
  GuestGroupCreate,
  GuestGroupUpdate,
  PaginatedResponse,
  GuestFilters,
  MessageResponse,
  RSVPStatus,
} from '../types';

// Guest Groups
export const getGuestGroups = async (): Promise<GuestGroup[]> => {
  const response = await api.get<GuestGroup[]>('/guests/groups');
  return response.data;
};

export const getGuestGroup = async (id: string): Promise<GuestGroup> => {
  const response = await api.get<GuestGroup>(`/guests/groups/${id}`);
  return response.data;
};

export const createGuestGroup = async (data: GuestGroupCreate): Promise<GuestGroup> => {
  const response = await api.post<GuestGroup>('/guests/groups', data);
  return response.data;
};

export const updateGuestGroup = async (id: string, data: GuestGroupUpdate): Promise<GuestGroup> => {
  const response = await api.patch<GuestGroup>(`/guests/groups/${id}`, data);
  return response.data;
};

export const deleteGuestGroup = async (id: string): Promise<MessageResponse> => {
  const response = await api.delete<MessageResponse>(`/guests/groups/${id}`);
  return response.data;
};

// Guests
interface GetGuestsParams {
  page?: number;
  per_page?: number;
  page_size?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  rsvp_status?: RSVPStatus;
  has_travel_info?: boolean;
  has_hotel_info?: boolean;
  side?: string;
  relation?: string;
  is_vip?: boolean;
  group_id?: string;
  has_plus_one?: boolean;
}

export const getGuests = async (
  params: GetGuestsParams = {}
): Promise<PaginatedResponse<GuestListItem>> => {
  const searchParams = new URLSearchParams();

  searchParams.append('page', (params.page || 1).toString());
  searchParams.append('page_size', (params.per_page || params.page_size || 20).toString());

  if (params.sortBy) searchParams.append('sort_by', params.sortBy);
  if (params.sortOrder) searchParams.append('sort_order', params.sortOrder);
  if (params.search) searchParams.append('search', params.search);
  if (params.rsvp_status) searchParams.append('rsvp_status', params.rsvp_status);
  if (params.side) searchParams.append('side', params.side);
  if (params.relation) searchParams.append('relation', params.relation);
  if (params.is_vip !== undefined) searchParams.append('is_vip', params.is_vip.toString());
  if (params.group_id) searchParams.append('group_id', params.group_id);
  if (params.has_plus_one !== undefined) searchParams.append('has_plus_one', params.has_plus_one.toString());
  if (params.has_travel_info !== undefined) searchParams.append('has_travel_info', params.has_travel_info.toString());
  if (params.has_hotel_info !== undefined) searchParams.append('has_hotel_info', params.has_hotel_info.toString());

  const response = await api.get<PaginatedResponse<GuestListItem>>(`/admin/guests?${searchParams.toString()}`);
  return response.data;
};

export const getGuest = async (id: string | number): Promise<Guest> => {
  const response = await api.get<Guest>(`/admin/guests/${id}`);
  return response.data;
};

export const createGuest = async (data: GuestCreate): Promise<Guest> => {
  const response = await api.post<Guest>('/admin/guests', data);
  return response.data;
};

export const updateGuest = async (id: string | number, data: GuestUpdate): Promise<Guest> => {
  const response = await api.patch<Guest>(`/admin/guests/${id}`, data);
  return response.data;
};

export const deleteGuest = async (id: string | number): Promise<MessageResponse> => {
  const response = await api.delete<MessageResponse>(`/admin/guests/${id}`);
  return response.data;
};

export const bulkUpdateRSVP = async (
  guestIds: string[],
  rsvpStatus: RSVPStatus
): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>('/guests/bulk-rsvp', {
    guest_ids: guestIds,
    rsvp_status: rsvpStatus,
  });
  return response.data;
};

export const exportGuestsToExcel = async (): Promise<Blob> => {
  const response = await api.get('/guests/export/excel', {
    responseType: 'blob',
  });
  return response.data;
};

export const getGuestImportTemplate = async (): Promise<Blob> => {
  const response = await api.get('/guests/import/template', {
    responseType: 'blob',
  });
  return response.data;
};

export const importGuestsFromExcel = async (file: File): Promise<MessageResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<MessageResponse>('/guests/import/excel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
