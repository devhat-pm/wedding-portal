import api from './api';
import {
  MediaUpload,
  AdminMediaListResponse,
  MediaFilters,
  SuccessResponse,
} from '../types';

// Get media list with filters and pagination
export const getMedia = async (params: MediaFilters): Promise<AdminMediaListResponse> => {
  const response = await api.get<AdminMediaListResponse>('/api/admin/media', { params });
  return response.data;
};

// Approve media
export const approveMedia = async (mediaId: string): Promise<MediaUpload> => {
  const response = await api.put<MediaUpload>(`/api/admin/media/${mediaId}/approve`);
  return response.data;
};

// Reject/delete media
export const rejectMedia = async (mediaId: string): Promise<SuccessResponse> => {
  const response = await api.put<SuccessResponse>(`/api/admin/media/${mediaId}/reject`);
  return response.data;
};

// Download all approved media as zip
export const downloadAllMedia = async (): Promise<Blob> => {
  const response = await api.get('/api/admin/media/download-all', {
    responseType: 'blob',
  });
  return response.data;
};
