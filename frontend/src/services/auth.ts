import api from './api';
import {
  User,
  UserCreate,
  UserUpdate,
  LoginCredentials,
  Token,
  MessageResponse,
} from '../types';

export const login = async (credentials: LoginCredentials): Promise<Token> => {
  const formData = new URLSearchParams();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);

  const response = await api.post<Token>('/users/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

export const register = async (data: UserCreate): Promise<User> => {
  const response = await api.post<User>('/users/register', data);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/users/me');
  return response.data;
};

export const updateCurrentUser = async (data: UserUpdate): Promise<User> => {
  const response = await api.patch<User>('/users/me', data);
  return response.data;
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>('/users/me/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return response.data;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/users');
  return response.data;
};

export const deleteUser = async (id: string): Promise<MessageResponse> => {
  const response = await api.delete<MessageResponse>(`/users/${id}`);
  return response.data;
};
