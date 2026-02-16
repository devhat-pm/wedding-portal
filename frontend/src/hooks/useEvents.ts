import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventCoverImage,
} from '../services/events';
import type { EventCreate, EventUpdate } from '../types';
import { message } from 'antd';

export const useEvents = (isActive?: boolean, eventType?: string) => {
  return useQuery({
    queryKey: ['events', isActive, eventType],
    queryFn: () => getEvents(isActive, eventType),
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => getEvent(id),
    enabled: !!id,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EventCreate) => createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      message.success('Event created successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.detail || 'Failed to create event');
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EventUpdate }) => updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
      message.success('Event updated successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.detail || 'Failed to update event');
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      message.success('Event deleted successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.detail || 'Failed to delete event');
    },
  });
};

export const useUploadEventCoverImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => uploadEventCoverImage(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
      message.success('Cover image uploaded successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.detail || 'Failed to upload cover image');
    },
  });
};
