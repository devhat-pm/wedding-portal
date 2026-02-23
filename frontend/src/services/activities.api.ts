import api from './api';
import {
  Activity,
  ActivityWithCount,
  ActivityCreate,
  ActivityUpdate,
  GuestRegistration,
  SuccessResponse,
} from '../types';

// Get all activities
export const getActivities = async (): Promise<ActivityWithCount[]> => {
  const response = await api.get<ActivityWithCount[]>('/api/admin/activities');
  return response.data;
};

// Get single activity by ID
export const getActivity = async (id: string): Promise<Activity> => {
  const response = await api.get<Activity>(`/api/admin/activities/${id}`);
  return response.data;
};

// Create new activity
export const createActivity = async (data: ActivityCreate): Promise<Activity> => {
  const response = await api.post<Activity>('/api/admin/activities', data);
  return response.data;
};

// Update activity
export const updateActivity = async (id: string, data: ActivityUpdate): Promise<Activity> => {
  const response = await api.put<Activity>(`/api/admin/activities/${id}`, data);
  return response.data;
};

// Delete activity
export const deleteActivity = async (id: string): Promise<SuccessResponse> => {
  const response = await api.delete<SuccessResponse>(`/api/admin/activities/${id}`);
  return response.data;
};

// Upload activity image
export const uploadActivityImage = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<{ url: string }>('/api/admin/activities/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Get activity registrations
export const getActivityRegistrations = async (activityId: string): Promise<GuestRegistration[]> => {
  const response = await api.get<GuestRegistration[]>(
    `/api/admin/activities/${activityId}/registrations`
  );
  return response.data;
};
