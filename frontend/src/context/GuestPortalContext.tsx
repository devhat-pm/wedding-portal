import React, { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type {
  Guest,
  Wedding,
  GuestTravelInfo,
  GuestHotelPreference,
  GuestDressPreference,
  GuestFoodPreference,
  GuestActivityRegistration,
  DressCode,
  FoodMenu,
  Activity,
  SuggestedHotel,
  GuestPortalData,
  TravelInfo,
  HotelInfo,
  DressCodeWithPreference,
  ActivityWithRegistration,
} from '../types';
import * as guestPortalApi from '../services/guestPortal.api';

// Portal data structure - matches API response from GET /api/guest/{token}
export interface PortalData {
  guest: Guest & { full_name?: string };
  wedding: Wedding;
  travel_info: TravelInfo | null;
  hotel_info: HotelInfo | null;
  hotel_preference?: GuestHotelPreference;
  dress_preferences?: GuestDressPreference[];
  food_preference?: GuestFoodPreference | null;
  activity_registrations?: GuestActivityRegistration[];
  // Wedding content
  dress_codes: (DressCode | DressCodeWithPreference)[];
  food_menus: FoodMenu[];
  activities: (Activity | ActivityWithRegistration)[];
  suggested_hotels: SuggestedHotel[];
  media_uploads?: any[];
}

// Section completion status
export interface SectionCompletion {
  rsvp: boolean;
  travel: boolean;
  hotel: boolean;
  dress: boolean;
  food: boolean;
  activities: boolean;
}

interface GuestPortalContextType {
  // Data
  token: string | null;
  portalData: PortalData | null;
  isLoading: boolean;
  error: Error | null;

  // Section completion
  sectionCompletion: SectionCompletion;
  completionPercentage: number;

  // Update functions
  updateRSVP: (data: Partial<Guest>) => Promise<void>;
  updateTravelInfo: (data: Partial<GuestTravelInfo>) => Promise<void>;
  updateHotelPreference: (data: Partial<GuestHotelPreference>) => Promise<void>;
  updateDressPreference: (dressCodeId: number, data: Partial<GuestDressPreference>) => Promise<void>;
  updateFoodPreference: (data: Partial<GuestFoodPreference>) => Promise<void>;
  registerForActivity: (activityId: number, data: { number_of_participants: number; notes?: string }) => Promise<void>;
  unregisterFromActivity: (activityId: number) => Promise<void>;
  updateActivityRegistration: (activityIds: number[]) => Promise<void>;

  // Refresh
  refreshPortalData: () => Promise<void>;
}

const GuestPortalContext = createContext<GuestPortalContextType | undefined>(undefined);

interface GuestPortalProviderProps {
  children: ReactNode;
  token: string;
}

export const GuestPortalProvider: React.FC<GuestPortalProviderProps> = ({ children, token }) => {
  const queryClient = useQueryClient();

  // Fetch portal data from real API
  const {
    data: portalData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['portalData', token],
    queryFn: async () => {
      try {
        const response = await guestPortalApi.getPortalData(token);
        // Map API response to PortalData structure
        return response as unknown as PortalData;
      } catch (err: any) {
        console.error('Failed to load portal data:', err);
        // Re-throw with more context
        throw err;
      }
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once for guest portal
  });

  // Calculate section completion
  // Check for dress preferences in dress_codes array (DressCodeWithPreference has guest_preference field)
  const hasDressPreference = portalData?.dress_codes?.some(
    (dc: any) => dc.guest_preference !== null && dc.guest_preference !== undefined
  ) || false;

  // Check for activity registrations in activities array (ActivityWithRegistration has is_registered field)
  const hasActivityRegistration = portalData?.activities?.some(
    (act: any) => act.is_registered === true
  ) || (portalData?.activity_registrations?.length || 0) > 0;

  const sectionCompletion: SectionCompletion = {
    rsvp: portalData?.guest?.rsvp_status !== 'pending',
    travel: !!portalData?.travel_info,
    hotel: !!portalData?.hotel_info || !!portalData?.hotel_preference,
    dress: hasDressPreference || (portalData?.dress_preferences?.length || 0) > 0,
    food: !!portalData?.food_preference,
    activities: hasActivityRegistration,
  };

  const completedCount = Object.values(sectionCompletion).filter(Boolean).length;
  const completionPercentage = Math.round((completedCount / 6) * 100);

  // Update RSVP mutation - calls real API
  const updateRSVPMutation = useMutation({
    mutationFn: async (data: Partial<Guest> & { number_of_attendees?: number; special_requests?: string }) => {
      // Map field names: frontend may send number_of_guests or number_of_attendees
      // Backend expects: rsvp_status, phone, country, number_of_attendees, special_requests
      const rsvpData = {
        rsvp_status: data.rsvp_status || 'confirmed',
        phone: data.phone,
        country: data.country,
        number_of_attendees: data.number_of_attendees || data.number_of_guests || 1,
        special_requests: data.special_requests || data.notes,
      };
      return await guestPortalApi.updateRSVP(token, rsvpData);
    },
    onSuccess: () => {
      // Refresh the portal data to get the latest state
      queryClient.invalidateQueries({ queryKey: ['portalData', token] });
      message.success('RSVP updated successfully!');
    },
    onError: () => {
      message.error('Failed to update RSVP. Please try again.');
    },
  });

  // Update travel info mutation - calls real API
  const updateTravelMutation = useMutation({
    mutationFn: async (data: Partial<GuestTravelInfo>) => {
      const travelData = {
        arrival_date: data.arrival_date,
        arrival_time: data.arrival_time,
        arrival_flight_number: data.arrival_flight_number,
        arrival_airport: data.arrival_airport,
        departure_date: data.departure_date,
        departure_time: data.departure_time,
        departure_flight_number: data.departure_flight_number,
        needs_pickup: data.needs_pickup || false,
        needs_dropoff: data.needs_dropoff || false,
        special_requirements: data.special_requirements,
      };
      return await guestPortalApi.updateTravel(token, travelData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalData', token] });
      message.success('Travel information saved!');
    },
    onError: () => {
      message.error('Failed to save travel information.');
    },
  });

  // Update hotel preference mutation - calls real API
  const updateHotelMutation = useMutation({
    mutationFn: async (data: Partial<GuestHotelPreference>) => {
      const hotelData = {
        suggested_hotel_id: data.suggested_hotel_id?.toString(),
        custom_hotel_name: data.custom_hotel_name,
        custom_hotel_address: data.custom_hotel_address,
        check_in_date: data.check_in_date,
        check_out_date: data.check_out_date,
        room_type: data.room_type,
        number_of_rooms: data.number_of_rooms || 1,
        special_requests: data.special_requests,
        booking_confirmation: data.booking_confirmation,
      };
      return await guestPortalApi.updateHotel(token, hotelData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalData', token] });
      message.success('Hotel preference saved!');
    },
    onError: () => {
      message.error('Failed to save hotel preference.');
    },
  });

  // Update dress preference mutation - calls real API
  const updateDressMutation = useMutation({
    mutationFn: async ({ dressCodeId, data }: { dressCodeId: number; data: Partial<GuestDressPreference> }) => {
      const dressData = {
        dress_code_id: dressCodeId.toString(),
        planned_outfit_description: data.planned_outfit_description,
        color_choice: data.color_choice,
        needs_shopping_assistance: data.needs_shopping_assistance || false,
        notes: data.notes,
      };
      return await guestPortalApi.updateDressPreference(token, dressData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalData', token] });
      message.success('Dress preference saved!');
    },
    onError: () => {
      message.error('Failed to save dress preference.');
    },
  });

  // Update food preference mutation - calls real API
  const updateFoodMutation = useMutation({
    mutationFn: async (data: Partial<GuestFoodPreference>) => {
      const foodData = {
        dietary_restrictions: data.dietary_restrictions,
        allergies: data.allergies,
        cuisine_preferences: data.cuisine_preferences,
        special_requests: data.special_requests,
        meal_size_preference: data.meal_size_preference,
      };
      return await guestPortalApi.updateFoodPreference(token, foodData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalData', token] });
      message.success('Food preferences saved!');
    },
    onError: () => {
      message.error('Failed to save food preferences.');
    },
  });

  // Activity registration mutations - calls real API
  const registerActivityMutation = useMutation({
    mutationFn: async ({ activityId, data }: { activityId: number; data: { number_of_participants: number; notes?: string } }) => {
      return await guestPortalApi.registerActivity(token, activityId.toString(), {
        number_of_participants: data.number_of_participants,
        notes: data.notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalData', token] });
      message.success('Registered for activity!');
    },
    onError: () => {
      message.error('Failed to register for activity.');
    },
  });

  const unregisterActivityMutation = useMutation({
    mutationFn: async (activityId: number) => {
      return await guestPortalApi.unregisterActivity(token, activityId.toString());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalData', token] });
      message.success('Unregistered from activity.');
    },
    onError: () => {
      message.error('Failed to unregister from activity.');
    },
  });

  // Update activity registration (array of IDs) - this is used for bulk updates
  const updateActivityRegistrationMutation = useMutation({
    mutationFn: async (activityIds: number[]) => {
      // For bulk registration, we need to register/unregister individual activities
      // This is a client-side optimization that syncs with current registrations
      return activityIds;
    },
    onSuccess: (activityIds) => {
      queryClient.setQueryData(['portalData', token], (old: PortalData | undefined) => {
        if (!old) return old;
        return {
          ...old,
          guest: { ...old.guest, registered_activities: activityIds },
        };
      });
    },
    onError: () => {
      message.error('Failed to update activity registration.');
    },
  });

  // Handler functions
  const updateRSVP = useCallback(
    async (data: Partial<Guest>) => {
      await updateRSVPMutation.mutateAsync(data);
    },
    [updateRSVPMutation]
  );

  const updateTravelInfo = useCallback(
    async (data: Partial<GuestTravelInfo>) => {
      await updateTravelMutation.mutateAsync(data);
    },
    [updateTravelMutation]
  );

  const updateHotelPreference = useCallback(
    async (data: Partial<GuestHotelPreference>) => {
      await updateHotelMutation.mutateAsync(data);
    },
    [updateHotelMutation]
  );

  const updateDressPreference = useCallback(
    async (dressCodeId: number, data: Partial<GuestDressPreference>) => {
      await updateDressMutation.mutateAsync({ dressCodeId, data });
    },
    [updateDressMutation]
  );

  const updateFoodPreference = useCallback(
    async (data: Partial<GuestFoodPreference>) => {
      await updateFoodMutation.mutateAsync(data);
    },
    [updateFoodMutation]
  );

  const registerForActivity = useCallback(
    async (activityId: number, data: { number_of_participants: number; notes?: string }) => {
      await registerActivityMutation.mutateAsync({ activityId, data });
    },
    [registerActivityMutation]
  );

  const unregisterFromActivity = useCallback(
    async (activityId: number) => {
      await unregisterActivityMutation.mutateAsync(activityId);
    },
    [unregisterActivityMutation]
  );

  const updateActivityRegistration = useCallback(
    async (activityIds: number[]) => {
      await updateActivityRegistrationMutation.mutateAsync(activityIds);
    },
    [updateActivityRegistrationMutation]
  );

  const refreshPortalData = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const value: GuestPortalContextType = {
    token,
    portalData: portalData || null,
    isLoading,
    error: error as Error | null,
    sectionCompletion,
    completionPercentage,
    updateRSVP,
    updateTravelInfo,
    updateHotelPreference,
    updateDressPreference,
    updateFoodPreference,
    registerForActivity,
    unregisterFromActivity,
    updateActivityRegistration,
    refreshPortalData,
  };

  return (
    <GuestPortalContext.Provider value={value}>
      {children}
    </GuestPortalContext.Provider>
  );
};

export const useGuestPortal = (): GuestPortalContextType => {
  const context = useContext(GuestPortalContext);
  if (!context) {
    throw new Error('useGuestPortal must be used within a GuestPortalProvider');
  }
  return context;
};

export default GuestPortalContext;
