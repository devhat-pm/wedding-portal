import api from './api';
import {
  Event,
  EventCreate,
  EventUpdate,
  MessageResponse,
} from '../types';

export const getEvents = async (
  isActive?: boolean,
  eventType?: string
): Promise<Event[]> => {
  const params = new URLSearchParams();
  if (isActive !== undefined) params.append('is_active', isActive.toString());
  if (eventType) params.append('event_type', eventType);

  const response = await api.get<Event[]>(`/events?${params.toString()}`);
  return response.data;
};

export const getEvent = async (id: string): Promise<Event> => {
  const response = await api.get<Event>(`/events/${id}`);
  return response.data;
};

export const createEvent = async (data: EventCreate): Promise<Event> => {
  const response = await api.post<Event>('/events', data);
  return response.data;
};

export const updateEvent = async (id: string, data: EventUpdate): Promise<Event> => {
  const response = await api.patch<Event>(`/events/${id}`, data);
  return response.data;
};

export const deleteEvent = async (id: string): Promise<MessageResponse> => {
  const response = await api.delete<MessageResponse>(`/events/${id}`);
  return response.data;
};

export const uploadEventCoverImage = async (id: string, file: File): Promise<Event> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<Event>(`/events/${id}/cover-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getEventStats = async (id: string): Promise<{
  total_invitations: number;
  sent_invitations: number;
  confirmed_guests: number;
}> => {
  const response = await api.get(`/events/${id}/stats`);
  return response.data;
};
