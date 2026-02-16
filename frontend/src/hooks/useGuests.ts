import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGuests,
  getGuest,
  createGuest,
  updateGuest,
  deleteGuest,
  bulkUpdateRSVP,
  getGuestGroups,
  createGuestGroup,
  updateGuestGroup,
  deleteGuestGroup,
} from '../services/guests';
import type {
  GuestCreate,
  GuestUpdate,
  GuestFilters,
  RSVPStatus,
} from '../types';
import { message } from 'antd';

// Guest Queries
export const useGuests = (
  page: number = 1,
  pageSize: number = 20,
  sortBy: string = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc',
  filters?: GuestFilters
) => {
  return useQuery({
    queryKey: ['guests', page, pageSize, sortBy, sortOrder, filters],
    queryFn: () => getGuests(page, pageSize, sortBy, sortOrder, filters),
  });
};

export const useGuest = (id: string) => {
  return useQuery({
    queryKey: ['guest', id],
    queryFn: () => getGuest(id),
    enabled: !!id,
  });
};

// Guest Mutations
export const useCreateGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GuestCreate) => createGuest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      message.success('Guest created successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.detail || 'Failed to create guest');
    },
  });
};

export const useUpdateGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: GuestUpdate }) => updateGuest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['guest'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      message.success('Guest updated successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.detail || 'Failed to update guest');
    },
  });
};

export const useDeleteGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGuest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      message.success('Guest deleted successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.detail || 'Failed to delete guest');
    },
  });
};

export const useBulkUpdateRSVP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ guestIds, status }: { guestIds: string[]; status: RSVPStatus }) =>
      bulkUpdateRSVP(guestIds, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      message.success(data.message);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.detail || 'Failed to update RSVP status');
    },
  });
};

// Guest Group Queries
export const useGuestGroups = () => {
  return useQuery({
    queryKey: ['guestGroups'],
    queryFn: getGuestGroups,
  });
};

// Guest Group Mutations
export const useCreateGuestGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GuestGroupCreate) => createGuestGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestGroups'] });
      message.success('Group created successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.detail || 'Failed to create group');
    },
  });
};

export const useUpdateGuestGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: GuestGroupUpdate }) => updateGuestGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestGroups'] });
      message.success('Group updated successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.detail || 'Failed to update group');
    },
  });
};

export const useDeleteGuestGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGuestGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestGroups'] });
      message.success('Group deleted successfully');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.detail || 'Failed to delete group');
    },
  });
};
