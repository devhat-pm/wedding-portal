import api from './api';
import {
  SuggestedHotel,
  SuggestedHotelCreate,
  SuggestedHotelUpdate,
  SuccessResponse,
} from '../types';

// Get all suggested hotels
export const getHotels = async (): Promise<SuggestedHotel[]> => {
  const response = await api.get<SuggestedHotel[]>('/api/admin/hotels');
  return response.data;
};

// Get single hotel by ID
export const getHotel = async (id: string): Promise<SuggestedHotel> => {
  const response = await api.get<SuggestedHotel>(`/api/admin/hotels/${id}`);
  return response.data;
};

// Create new suggested hotel
export const createHotel = async (data: SuggestedHotelCreate): Promise<SuggestedHotel> => {
  const response = await api.post<SuggestedHotel>('/api/admin/hotels', data);
  return response.data;
};

// Update suggested hotel
export const updateHotel = async (id: string, data: SuggestedHotelUpdate): Promise<SuggestedHotel> => {
  const response = await api.put<SuggestedHotel>(`/api/admin/hotels/${id}`, data);
  return response.data;
};

// Delete suggested hotel
export const deleteHotel = async (id: string): Promise<SuccessResponse> => {
  const response = await api.delete<SuccessResponse>(`/api/admin/hotels/${id}`);
  return response.data;
};

// Reorder hotels - sends hotel_ids array, backend accepts both formats
export const reorderHotels = async (hotelIds: string[]): Promise<SuccessResponse> => {
  const response = await api.put<SuccessResponse>('/api/admin/hotels/reorder', {
    hotel_ids: hotelIds,
  });
  return response.data;
};
