import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type {
  Guest,
  GuestTravelInfo,
  GuestHotelPreference,
  GuestDressPreference,
  GuestFoodPreference,
  Wedding,
  DressCode,
  FoodMenu,
  Activity,
  SuggestedHotel,
  GuestActivityRegistration,
} from '../types';

// ============================================
// Types
// ============================================

export interface GuestPortalData {
  guest: Guest;
  wedding: Wedding;
  travel_info?: GuestTravelInfo;
  hotel_preference?: GuestHotelPreference;
  dress_preferences?: GuestDressPreference[];
  food_preference?: GuestFoodPreference;
  activity_registrations?: GuestActivityRegistration[];
  // Wedding content
  dress_codes: DressCode[];
  food_menus: FoodMenu[];
  activities: Activity[];
  suggested_hotels: SuggestedHotel[];
}

export interface SectionCompletion {
  rsvp: boolean;
  travel: boolean;
  hotel: boolean;
  dress: boolean;
  food: boolean;
  activities: boolean;
}

// ============================================
// API Functions (to be replaced with actual API calls)
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const fetchGuestPortalData = async (token: string): Promise<GuestPortalData> => {
  const response = await fetch(`${API_BASE_URL}/guest/${token}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('INVALID_TOKEN');
    }
    throw new Error('Failed to fetch portal data');
  }

  return response.json();
};

const updateGuestRSVP = async (token: string, data: Partial<Guest>): Promise<Guest> => {
  const response = await fetch(`${API_BASE_URL}/guest/${token}/rsvp`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to update RSVP');
  return response.json();
};

const updateGuestTravel = async (token: string, data: Partial<GuestTravelInfo>): Promise<GuestTravelInfo> => {
  const response = await fetch(`${API_BASE_URL}/guest/${token}/travel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to update travel info');
  return response.json();
};

const updateGuestHotel = async (token: string, data: Partial<GuestHotelPreference>): Promise<GuestHotelPreference> => {
  const response = await fetch(`${API_BASE_URL}/guest/${token}/hotel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to update hotel preference');
  return response.json();
};

const updateGuestDress = async (
  token: string,
  dressCodeId: number,
  data: Partial<GuestDressPreference>
): Promise<GuestDressPreference> => {
  const response = await fetch(`${API_BASE_URL}/guest/${token}/dress/${dressCodeId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to update dress preference');
  return response.json();
};

const updateGuestFood = async (token: string, data: Partial<GuestFoodPreference>): Promise<GuestFoodPreference> => {
  const response = await fetch(`${API_BASE_URL}/guest/${token}/food`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to update food preference');
  return response.json();
};

const registerForActivity = async (
  token: string,
  activityId: number,
  data: { number_of_participants: number; notes?: string }
): Promise<GuestActivityRegistration> => {
  const response = await fetch(`${API_BASE_URL}/guest/${token}/activities/${activityId}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to register for activity');
  return response.json();
};

const unregisterFromActivity = async (token: string, activityId: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/guest/${token}/activities/${activityId}/unregister`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('Failed to unregister from activity');
};

// ============================================
// Custom Hook
// ============================================

interface UseGuestPortalOptions {
  token: string;
  enabled?: boolean;
}

export function useGuestPortal({ token, enabled = true }: UseGuestPortalOptions) {
  const queryClient = useQueryClient();
  const queryKey = ['guestPortal', token];

  // ============================================
  // Main Query
  // ============================================

  const {
    data: portalData,
    isLoading,
    error,
    refetch,
    isError,
  } = useQuery({
    queryKey,
    queryFn: () => fetchGuestPortalData(token),
    enabled: enabled && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on invalid token
      if (error.message === 'INVALID_TOKEN') return false;
      return failureCount < 2;
    },
  });

  // ============================================
  // Calculate Section Completion
  // ============================================

  const sectionCompletion: SectionCompletion = {
    rsvp: portalData?.guest?.rsvp_status !== 'pending',
    travel: !!portalData?.travel_info,
    hotel: !!portalData?.hotel_preference,
    dress: (portalData?.dress_preferences?.length || 0) > 0,
    food: !!portalData?.food_preference,
    activities: (portalData?.activity_registrations?.length || 0) > 0,
  };

  const completedSections = Object.values(sectionCompletion).filter(Boolean).length;
  const totalSections = Object.keys(sectionCompletion).length;
  const completionPercentage = Math.round((completedSections / totalSections) * 100);

  // ============================================
  // Mutations with Optimistic Updates
  // ============================================

  // Update RSVP
  const updateRSVPMutation = useMutation({
    mutationFn: (data: Partial<Guest>) => updateGuestRSVP(token, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<GuestPortalData>(queryKey);

      // Optimistic update
      queryClient.setQueryData<GuestPortalData>(queryKey, (old) => {
        if (!old) return old;
        return { ...old, guest: { ...old.guest, ...newData } };
      });

      return { previousData };
    },
    onError: (_err, _newData, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      message.error('Failed to update RSVP. Please try again.');
    },
    onSuccess: () => {
      message.success('RSVP updated successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Update Travel Info
  const updateTravelMutation = useMutation({
    mutationFn: (data: Partial<GuestTravelInfo>) => updateGuestTravel(token, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<GuestPortalData>(queryKey);

      queryClient.setQueryData<GuestPortalData>(queryKey, (old) => {
        if (!old) return old;
        return { ...old, travel_info: { ...old.travel_info, ...newData } as GuestTravelInfo };
      });

      return { previousData };
    },
    onError: (_err, _newData, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      message.error('Failed to save travel information.');
    },
    onSuccess: () => {
      message.success('Travel information saved!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Update Hotel Preference
  const updateHotelMutation = useMutation({
    mutationFn: (data: Partial<GuestHotelPreference>) => updateGuestHotel(token, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<GuestPortalData>(queryKey);

      queryClient.setQueryData<GuestPortalData>(queryKey, (old) => {
        if (!old) return old;
        return { ...old, hotel_preference: { ...old.hotel_preference, ...newData } as GuestHotelPreference };
      });

      return { previousData };
    },
    onError: (_err, _newData, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      message.error('Failed to save hotel preference.');
    },
    onSuccess: () => {
      message.success('Hotel preference saved!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Update Dress Preference
  const updateDressMutation = useMutation({
    mutationFn: ({ dressCodeId, data }: { dressCodeId: number; data: Partial<GuestDressPreference> }) =>
      updateGuestDress(token, dressCodeId, data),
    onMutate: async ({ dressCodeId, data }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<GuestPortalData>(queryKey);

      queryClient.setQueryData<GuestPortalData>(queryKey, (old) => {
        if (!old) return old;
        const existingPrefs = old.dress_preferences || [];
        const existingIndex = existingPrefs.findIndex((p) => p.dress_code_id === dressCodeId);

        let newPrefs;
        if (existingIndex >= 0) {
          newPrefs = [...existingPrefs];
          newPrefs[existingIndex] = { ...newPrefs[existingIndex], ...data };
        } else {
          newPrefs = [...existingPrefs, { ...data, dress_code_id: dressCodeId } as GuestDressPreference];
        }

        return { ...old, dress_preferences: newPrefs };
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      message.error('Failed to save dress preference.');
    },
    onSuccess: () => {
      message.success('Dress preference saved!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Update Food Preference
  const updateFoodMutation = useMutation({
    mutationFn: (data: Partial<GuestFoodPreference>) => updateGuestFood(token, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<GuestPortalData>(queryKey);

      queryClient.setQueryData<GuestPortalData>(queryKey, (old) => {
        if (!old) return old;
        return { ...old, food_preference: { ...old.food_preference, ...newData } as GuestFoodPreference };
      });

      return { previousData };
    },
    onError: (_err, _newData, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      message.error('Failed to save food preferences.');
    },
    onSuccess: () => {
      message.success('Food preferences saved!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Register for Activity
  const registerActivityMutation = useMutation({
    mutationFn: ({ activityId, data }: { activityId: number; data: { number_of_participants: number; notes?: string } }) =>
      registerForActivity(token, activityId, data),
    onMutate: async ({ activityId, data }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<GuestPortalData>(queryKey);

      queryClient.setQueryData<GuestPortalData>(queryKey, (old) => {
        if (!old) return old;
        const existingRegs = old.activity_registrations || [];
        const newReg: GuestActivityRegistration = {
          id: Date.now(), // Temporary ID
          guest_id: old.guest.id,
          activity_id: activityId,
          number_of_participants: data.number_of_participants,
          notes: data.notes,
          registered_at: new Date().toISOString(),
        };
        return {
          ...old,
          activity_registrations: [...existingRegs.filter((r) => r.activity_id !== activityId), newReg],
        };
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      message.error('Failed to register for activity.');
    },
    onSuccess: () => {
      message.success('Registered for activity!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Unregister from Activity
  const unregisterActivityMutation = useMutation({
    mutationFn: (activityId: number) => unregisterFromActivity(token, activityId),
    onMutate: async (activityId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<GuestPortalData>(queryKey);

      queryClient.setQueryData<GuestPortalData>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          activity_registrations: (old.activity_registrations || []).filter(
            (r) => r.activity_id !== activityId
          ),
        };
      });

      return { previousData };
    },
    onError: (_err, _activityId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      message.error('Failed to unregister from activity.');
    },
    onSuccess: () => {
      message.success('Unregistered from activity.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // ============================================
  // Return Values
  // ============================================

  return {
    // Data
    portalData,
    isLoading,
    error,
    isError,
    isInvalidToken: error?.message === 'INVALID_TOKEN',

    // Completion tracking
    sectionCompletion,
    completionPercentage,

    // Mutations
    updateRSVP: updateRSVPMutation.mutateAsync,
    isUpdatingRSVP: updateRSVPMutation.isPending,

    updateTravelInfo: updateTravelMutation.mutateAsync,
    isUpdatingTravel: updateTravelMutation.isPending,

    updateHotelPreference: updateHotelMutation.mutateAsync,
    isUpdatingHotel: updateHotelMutation.isPending,

    updateDressPreference: (dressCodeId: number, data: Partial<GuestDressPreference>) =>
      updateDressMutation.mutateAsync({ dressCodeId, data }),
    isUpdatingDress: updateDressMutation.isPending,

    updateFoodPreference: updateFoodMutation.mutateAsync,
    isUpdatingFood: updateFoodMutation.isPending,

    registerForActivity: (activityId: number, data: { number_of_participants: number; notes?: string }) =>
      registerActivityMutation.mutateAsync({ activityId, data }),
    isRegisteringActivity: registerActivityMutation.isPending,

    unregisterFromActivity: unregisterActivityMutation.mutateAsync,
    isUnregisteringActivity: unregisterActivityMutation.isPending,

    // Refresh
    refreshPortalData: refetch,
  };
}

export default useGuestPortal;
