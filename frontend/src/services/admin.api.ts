import api from './api';
import {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminInfo,
  Wedding,
  WeddingCreate,
  WeddingUpdate,
  DashboardStats,
} from '../types';

// Login
export const login = async (credentials: AdminLoginRequest): Promise<AdminLoginResponse> => {
  const response = await api.post<AdminLoginResponse>('/api/admin/auth/login', credentials);
  return response.data;
};

// Register new wedding
export const register = async (data: WeddingCreate): Promise<AdminLoginResponse> => {
  const response = await api.post<AdminLoginResponse>('/api/admin/auth/register', data);
  return response.data;
};

// Get current admin info
export const getMe = async (): Promise<AdminInfo> => {
  const response = await api.get<AdminInfo>('/api/admin/auth/me');
  return response.data;
};

// Change password
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>('/api/admin/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return response.data;
};

// Get wedding details
export const getWedding = async (): Promise<Wedding> => {
  const response = await api.get<Wedding>('/api/admin/wedding');
  return response.data;
};

// Update wedding details
export const updateWedding = async (data: WeddingUpdate): Promise<Wedding> => {
  const response = await api.put<Wedding>('/api/admin/wedding', data);
  return response.data;
};

// Upload cover image (accepts FormData or File)
export const uploadCoverImage = async (data: FormData | File): Promise<Wedding> => {
  let formData: FormData;

  if (data instanceof File) {
    formData = new FormData();
    formData.append('file', data);
  } else {
    formData = data;
  }

  const response = await api.post<Wedding>('/api/admin/wedding/cover-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Upload story image (accepts FormData or File)
export const uploadStoryImage = async (data: FormData | File): Promise<Wedding> => {
  let formData: FormData;

  if (data instanceof File) {
    formData = new FormData();
    formData.append('file', data);
  } else {
    formData = data;
  }

  const response = await api.post<Wedding>('/api/admin/wedding/story-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Upload couple image (accepts FormData or File)
export const uploadCoupleImage = async (data: FormData | File): Promise<Wedding> => {
  let formData: FormData;

  if (data instanceof File) {
    formData = new FormData();
    formData.append('file', data);
  } else {
    formData = data;
  }

  const response = await api.post<Wedding>('/api/admin/wedding/couple-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>('/api/admin/wedding/dashboard-stats');
  return response.data;
};

// Export as object for convenient usage
export const adminApi = {
  login,
  register,
  getMe,
  changePassword,
  getWedding,
  updateWedding,
  uploadCoverImage,
  uploadStoryImage,
  uploadCoupleImage,
  getDashboardStats,
};
