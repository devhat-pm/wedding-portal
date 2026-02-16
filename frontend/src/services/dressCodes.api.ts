import api from './api';
import {
  DressCode,
  DressCodeCreate,
  DressCodeUpdate,
  SuccessResponse,
} from '../types';

// Get all dress codes
export const getDressCodes = async (): Promise<DressCode[]> => {
  const response = await api.get<DressCode[]>('/api/admin/dress-codes');
  return response.data;
};

// Get single dress code by ID
export const getDressCode = async (id: string): Promise<DressCode> => {
  const response = await api.get<DressCode>(`/api/admin/dress-codes/${id}`);
  return response.data;
};

// Create new dress code
export const createDressCode = async (data: DressCodeCreate): Promise<DressCode> => {
  const response = await api.post<DressCode>('/api/admin/dress-codes', data);
  return response.data;
};

// Update dress code
export const updateDressCode = async (id: string, data: DressCodeUpdate): Promise<DressCode> => {
  const response = await api.put<DressCode>(`/api/admin/dress-codes/${id}`, data);
  return response.data;
};

// Delete dress code
export const deleteDressCode = async (id: string): Promise<SuccessResponse> => {
  const response = await api.delete<SuccessResponse>(`/api/admin/dress-codes/${id}`);
  return response.data;
};

// Upload dress code images
export const uploadDressCodeImages = async (id: string, files: File[]): Promise<DressCode> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post<DressCode>(`/api/admin/dress-codes/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
