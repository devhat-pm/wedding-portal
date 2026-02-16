import api from './api';
import {
  FoodMenu,
  FoodMenuCreate,
  FoodMenuUpdate,
  GuestFoodPreference,
  SuccessResponse,
} from '../types';

// Get all food menus
export const getFoodMenus = async (): Promise<FoodMenu[]> => {
  const response = await api.get<FoodMenu[]>('/api/admin/food-menu');
  return response.data;
};

// Get single food menu by ID
export const getFoodMenu = async (id: string): Promise<FoodMenu> => {
  const response = await api.get<FoodMenu>(`/api/admin/food-menu/${id}`);
  return response.data;
};

// Create new food menu
export const createFoodMenu = async (data: FoodMenuCreate): Promise<FoodMenu> => {
  const response = await api.post<FoodMenu>('/api/admin/food-menu', data);
  return response.data;
};

// Update food menu
export const updateFoodMenu = async (id: string, data: FoodMenuUpdate): Promise<FoodMenu> => {
  const response = await api.put<FoodMenu>(`/api/admin/food-menu/${id}`, data);
  return response.data;
};

// Delete food menu
export const deleteFoodMenu = async (id: string): Promise<SuccessResponse> => {
  const response = await api.delete<SuccessResponse>(`/api/admin/food-menu/${id}`);
  return response.data;
};

// Get guest food preferences
export const getGuestFoodPreferences = async (): Promise<GuestFoodPreference[]> => {
  const response = await api.get<GuestFoodPreference[]>('/api/admin/food-menu/guest-preferences');
  return response.data;
};

// Export guest food preferences to Excel
export const exportGuestFoodPreferences = async (): Promise<Blob> => {
  const response = await api.get('/api/admin/food-menu/guest-preferences', {
    params: { export: true },
    responseType: 'blob',
  });
  return response.data;
};
